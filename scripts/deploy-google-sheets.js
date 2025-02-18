import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import sheets from '@googleapis/sheets';
import { valid as isValidVersion } from 'semver';
import { buildCompetencies } from './lib/build-competencies.js';

const rootPath = resolvePath(import.meta.dirname, '..');
const dataPath = resolvePath(rootPath, 'data');
const distPath = resolvePath(rootPath, 'dist');
const tmpPath = resolvePath(rootPath, 'tmp');

buildCompetencies({ input: dataPath, output: distPath })
	.then(async (buildInfo) => {
		const googleClient = sheets.sheets({
			auth: await authWithGoogle(),
			version: 'v4'
		});
		const version = process.env.VERSION;
		if (!version || !isValidVersion(version)) {
			throw new Error('VERSION environment variable must be set to a valid semantic version');
		}
		for (const path of Object.values(buildInfo)) {
			const pathRelative = path.replace(`${rootPath}/`, '');
			const jobFamily = JSON.parse(await readFile(path, 'utf-8'));
			console.log('Deploying Google Sheet for competencies at', pathRelative);
			await deployGoogleSheet({
				client: googleClient,
				jobFamily,
				spreadsheetId: jobFamily.googleSheetId,
				version
			});
		}
	})
	.catch((error) => {
		process.exitCode = 1;
		console.error('Building Google Sheet failed:');
		console.error(error.stack);
	});

async function authWithGoogle() {
	// We have to auth with a keyfile - a JSON file on the filesystem. We create and delete this
	// file based on an environment variable
	if (!process.env.SERVICE_ACCOUNT_KEYFILE) {
		throw new Error('No keyfile found in the SERVICE_ACCOUNT_KEYFILE environment variable');
	}
	await mkdir(tmpPath, { recursive: true });
	const keyfilePath = resolvePath(tmpPath, `${randomUUID()}.json`);
	await writeFile(keyfilePath, process.env.SERVICE_ACCOUNT_KEYFILE);
	const auth = sheets.auth.getClient({
		keyFile: keyfilePath,
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	});
	await rm(keyfilePath);
	return auth;
}

/**
 * @param {object} options
 * @param {import('@googleapis/sheets').sheets_v4.Sheets} options.client
 * @param {object<string, any>} options.jobFamily
 * @param {string} options.spreadsheetId
 * @param {string} options.version
 */
async function deployGoogleSheet({ client, jobFamily, spreadsheetId, version }) {
	console.log('version:', version, '/ Spreadsheet ID:', spreadsheetId);
	const spreadsheet = (await client.spreadsheets.get({ spreadsheetId })).data;
	const sheetIds = await createSheets({ client, jobFamily, spreadsheet });

	// Start batching updates to the actual sheet data and format
	const batchedUpdates = [];

	// Set some formatting rules which apply to all sheets,
	// mostly cell alignment
	for (const sheetId of Object.values(sheetIds)) {
		batchedUpdates.push(
			createBatchAlignmentUpdate(sheetId, {
				horizontalAlignment: 'LEFT',
				verticalAlignment: 'TOP',
				wrapStrategy: 'WRAP'
			})
		);
	}

	// Set the data that appears in the overview sheet. This includes some background,
	// warnings about editing the sheet manually, and links to useful resources
	batchedUpdates.push(
		createBatchCellUpdate(sheetIds.overview, [
			[`Progression Tracker:\n${jobFamily.name}`],
			[
				`This is an example spreadsheet for tracking engineering progression. This sheet is generated automatically. Any edits you make here will be overwritten (including comments).\n\nThis spreadsheet contains sheets for the different levels within ${jobFamily.name}. You can use these to inform conversations about career progression. Please make a copy of this spreadsheet to do this.`
			],
			[''],
			[
				'=HYPERLINK("https://engineering-progression.ft.com/competencies/how-to-use/", "Before tracking your progress, it\'s best to read how to use the competencies.")'
			],
			[''],
			['Competencies Version', version],
			[
				'More Info',
				'=HYPERLINK("https://engineering-progression.ft.com/", "Engineering Progression website")'
			],
			[
				'Feedback/Questions',
				'=HYPERLINK("https://github.com/Financial-Times/engineering-progression/issues/new", "Use GitHub issues")'
			]
		])
	);

	// Merge the top rows for the overview sheet,
	// we use this as a header and introduction
	batchedUpdates.push({
		mergeCells: {
			range: {
				sheetId: sheetIds.overview,
				startRowIndex: 0,
				endRowIndex: 5,
				startColumnIndex: 0,
				endColumnIndex: 2
			},
			mergeType: 'MERGE_ROWS'
		}
	});

	// Resize the columns for the overview sheet
	batchedUpdates.push(
		createBatchColumnResize(sheetIds.overview, {
			startIndex: 0,
			width: 150
		})
	);
	batchedUpdates.push(
		createBatchColumnResize(sheetIds.overview, {
			startIndex: 1,
			width: 350
		})
	);

	// Delete additional columns for the overview sheet
	batchedUpdates.push({
		deleteDimension: {
			range: {
				sheetId: sheetIds.overview,
				dimension: 'COLUMNS',
				startIndex: 2
			}
		}
	});

	// Bold the main heading for the overview sheet
	batchedUpdates.push({
		repeatCell: {
			range: {
				sheetId: sheetIds.overview,
				startRowIndex: 0,
				endRowIndex: 1
			},
			cell: {
				userEnteredFormat: {
					textFormat: {
						bold: true,
						fontSize: 16
					}
				}
			},
			fields: 'userEnteredFormat(textFormat)'
		}
	});

	// Bold the "how to use link" for the overview sheet
	batchedUpdates.push({
		repeatCell: {
			range: {
				sheetId: sheetIds.overview,
				startRowIndex: 3,
				endRowIndex: 4
			},
			cell: {
				userEnteredFormat: {
					textFormat: {
						bold: true
					}
				}
			},
			fields: 'userEnteredFormat(textFormat)'
		}
	});

	// Bold the meta information headings for the overview sheet
	batchedUpdates.push({
		repeatCell: {
			range: {
				sheetId: sheetIds.overview,
				startRowIndex: 5,
				startColumnIndex: 0,
				endColumnIndex: 1
			},
			cell: {
				userEnteredFormat: {
					textFormat: {
						bold: true
					}
				}
			},
			fields: 'userEnteredFormat(textFormat)'
		}
	});

	// Set the data that appears in each of the competency level sheets
	for (const level of jobFamily.levels) {
		const sheetId = sheetIds[level.id];
		const competenciesForLevel = jobFamily.competencies.filter(
			(competency) => competency.level === level.id
		);

		// Add the actual data for the level
		batchedUpdates.push(
			createBatchCellUpdate(sheetId, [
				['Theme', 'Competency', 'Proficiency', 'Evidence'],
				...competenciesForLevel.map((competency) => {
					let content = competency.summary;
					if (competency.examples?.length) {
						content += `, e.g.\n${competency.examples.map((example) => `• ${example}`).join('\n')}`;
					}
					return [
						jobFamily.themes.find((theme) => theme.id === competency.theme).name,
						content,
						competency.proficiency
					];
				})
			])
		);

		// Resize the columns for the level
		batchedUpdates.push(
			createBatchColumnResize(sheetId, {
				startIndex: 0,
				width: 100
			})
		);
		batchedUpdates.push(
			createBatchColumnResize(sheetId, {
				startIndex: 1,
				width: 500
			})
		);
		batchedUpdates.push(
			createBatchColumnResize(sheetId, {
				startIndex: 2,
				width: 120
			})
		);
		batchedUpdates.push(
			createBatchColumnResize(sheetId, {
				startIndex: 3,
				width: 500
			})
		);

		// Delete additional columns for the level
		batchedUpdates.push({
			deleteDimension: {
				range: {
					sheetId,
					dimension: 'COLUMNS',
					startIndex: 4
				}
			}
		});

		// Format the header cells for the level
		batchedUpdates.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 0,
					endRowIndex: 1
				},
				cell: {
					userEnteredFormat: {
						backgroundColor: {
							// This is a Slate tint from o-colors
							red: 212 / 255,
							green: 212 / 255,
							blue: 214 / 255
						},
						textFormat: {
							bold: true
						}
					}
				},
				fields: 'userEnteredFormat(backgroundColor,textFormat)'
			}
		});
		batchedUpdates.push({
			updateSheetProperties: {
				properties: {
					sheetId,
					gridProperties: {
						frozenRowCount: 1
					}
				},
				fields: 'gridProperties.frozenRowCount'
			}
		});
	}

	await client.spreadsheets.batchUpdate({
		spreadsheetId: spreadsheetId,
		resource: { requests: batchedUpdates }
	});
	console.info('Competencies updated');
}

/**
 * @param {object} options
 * @param {import('@googleapis/sheets').sheets_v4.Sheets} options.client
 * @param {object<string, any>} options.jobFamily
 * @param {object<string, any>} options.spreadsheet
 * @returns {object<string, number>}
 */
async function createSheets({ client, jobFamily, spreadsheet }) {
	const overviewTitle = 'Overview';
	const batchedUpdates = [];

	// First we need to rename all existing sheets to avoid naming conflicts
	// with the new sheets. These can't just be deleted because you're not
	// allowed to have a spreadsheet with no sheets
	for (const existingSheet of spreadsheet.sheets) {
		batchedUpdates.push({
			updateSheetProperties: {
				properties: {
					sheetId: existingSheet.properties.sheetId,
					title: `TO-DELETE-${randomUUID()}`
				},
				fields: 'title'
			}
		});
	}

	// Add an overview sheet
	batchedUpdates.push({
		addSheet: {
			properties: { title: overviewTitle }
		}
	});

	// Add each of the levels in the job family as new sheets
	for (const level of jobFamily.levels) {
		batchedUpdates.push({
			addSheet: {
				properties: { title: level.name }
			}
		});
	}

	// Delete all of the existing sheets from before adding the new ones.
	// We can do this now because we won't be removing the last sheet
	for (const existingSheet of spreadsheet.sheets) {
		batchedUpdates.push({
			deleteSheet: {
				sheetId: existingSheet.properties.sheetId
			}
		});
	}

	// Run the batch update
	const response = await client.spreadsheets.batchUpdate({
		spreadsheetId: spreadsheet.spreadsheetId,
		includeSpreadsheetInResponse: true,
		resource: {
			requests: batchedUpdates
		}
	});

	return Object.fromEntries(
		response.data.updatedSpreadsheet.sheets.map((sheet) => {
			const sheetId = sheet.properties.sheetId;
			const level = jobFamily.levels.find((level) => level.name === sheet.properties.title);
			const id = level ? level.id : 'overview';
			return [id, sheetId];
		})
	);
}

/**
 * @param {string} sheetId
 * @param {string[][]} rows
 * @returns {object<string, any>}
 */
function createBatchCellUpdate(sheetId, rows) {
	return {
		updateCells: {
			rows: rows.map((row) => {
				return {
					values: row.map((cell) => {
						const value = {};
						if (cell === null || cell === undefined) {
							value.stringValue = '';
						}
						if (typeof cell === 'string') {
							if (cell[0] === '=') {
								value.formulaValue = cell;
							} else {
								value.stringValue = cell;
							}
						}
						if (cell === undefined) {
							return {};
						}
						return {
							userEnteredValue: value
						};
					})
				};
			}),
			fields: 'userEnteredValue',
			start: {
				sheetId,
				rowIndex: 0,
				columnIndex: 0
			}
		}
	};
}

/**
 * @param {string} sheetId
 * @param {object} options
 * @param {string} options.horizontalAlignment
 * @param {string} options.verticalAlignment
 * @param {string} options.wrapStrategy
 * @returns {object<string, any>}
 */
function createBatchAlignmentUpdate(sheetId, options) {
	return {
		repeatCell: {
			range: {
				sheetId,
				startRowIndex: 0,
				startColumnIndex: 0
			},
			cell: {
				userEnteredFormat: options
			},
			fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy)'
		}
	};
}

/**
 * Helper function to create a batch request which resizes columns in a sheet.
 *
 * @param {string} sheetId - The ID of a single sheet within a spreadsheet.
 * @param {object} options - Column options.
 * @param {string} options.startIndex - The column start index (zero-based)
 * @param {string} options.endIndex - The column end index (defaults to start index + 1, which updates one column)
 * @param {string} options.width - The pixel width to set the column to
 * @returns {object} Returns a batch request based on the provided options.
 */
function createBatchColumnResize(sheetId, { endIndex, startIndex, width }) {
	if (endIndex === undefined) {
		endIndex = startIndex + 1;
	}
	return {
		updateDimensionProperties: {
			range: {
				sheetId,
				dimension: 'COLUMNS',
				startIndex,
				endIndex
			},
			properties: {
				pixelSize: width
			},
			fields: 'pixelSize'
		}
	};
}

/**
 * Helper function to create a batch request which resizes rows in a sheet.
 *
 * @param {string} sheetId - The ID of a single sheet within a spreadsheet.
 * @param {object} options - Row options.
 * @param {string} options.startIndex - The row start index (zero-based)
 * @param {string} options.endIndex - The row end index (defaults to start index + 1, which updates one row)
 * @param {string} options.height - The pixel height to set the row to
 * @returns {object} Returns a batch request based on the provided options.
 */
function createBatchRowResize(sheetId, { endIndex, startIndex, height }) {
	if (endIndex === undefined) {
		endIndex = startIndex + 1;
	}
	return {
		updateDimensionProperties: {
			range: {
				sheetId,
				dimension: 'ROWS',
				startIndex,
				endIndex
			},
			properties: {
				pixelSize: height
			},
			fields: 'pixelSize'
		}
	};
}

/**
 * Capitalise the first letter in a string.
 *
 * @param {string} string - The string to capitalise the first letter of
 * @returns {string} Returns the string with the first letter capitalised
 */
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
