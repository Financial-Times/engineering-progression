#!/usr/bin/env node

const {google} = require('googleapis');
const {outputFile, remove: deleteFile} = require('fs-extra');
const path = require('path');
const semver = require('semver');
const uuid = require('uuid').v4;

process.on('unhandledRejection', error => {
	console.error(error.stack);
	process.exitCode = 1;
});

if (!process.env.CIRCLE_TAG || !semver.valid(process.env.CIRCLE_TAG)) {
	process.exitCode = 1;
	return console.error('Error: CIRCLE_TAG environment variable must be set to a valid semver version');
}

deployGoogleSheets({
	levels: require('../dist/levels.json'),
	competencies: require('../dist/competencies.json'),
	competenciesVersion: process.env.CIRCLE_TAG,

	// You can find the value for this environment variable in LastPass
	jsonAuthData: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}',

	// This is the ID of a spreadsheet to edit. There are a couple of things to note:
	//   1. The spreadsheet must be shared with the Google API user who matches the given credentials (you can find this information in LastPass)
	//   2. The spreadsheet will be completely overwritten by this script
	spreadsheetId: process.env.GOOGLE_SHEET_ID

});

/**
 * Deploy the competencies data to Google Sheets.
 *
 * @param {Object} options
 * @param {Array} options.competencies - The competencies data.
 * @param {String} options.competenciesVersion - The version of the competencies being deployed.
 * @param {String} options.jsonAuthData - Google authentication data as a JSON string.
 * @param {Array} options.levels - The competency levels data.
 * @param {String} options.spreadsheetId - The Google Sheets ID to push data to.
 * @returns {Promise} Returns a promise that resolves when the Google Sheet has been updated.
 * @modifies Modifies a Google Sheet, and clears the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
 */
async function deployGoogleSheets({competencies, competenciesVersion, jsonAuthData, levels, spreadsheetId}) {
	try {

		// This is neeed because Google auth requires a local JSON file, see documentation
		// for this function for more information
		await setupAuthCredentialsJson(jsonAuthData);

		// Connect to Google Sheets. The Google Sheets API client uses environment
		// variables for configuration, which is why no auth details are passed in
		const client = await createGoogleSheetsClient();

		// Fetch the current spreadsheet information. We do this so that we can delete
		// and then re-create the various sheets rather than trying to overwrite things
		console.info(`⏳ Loading live spreadsheet information`);
		const spreadsheet = (await client.spreadsheets.get({spreadsheetId})).data;
		console.info(`✨ Loaded spreadsheet`);

		// Wrangle the sheets into place. This creates an Overview sheet, as well as a
		// sheet for each competency level that we retrieved from the API
		console.info(`⏳ Wrangling the sheets into place`);
		const sheets = await createRequiredSheets(client, spreadsheet, [
			'Overview',
			...levels.map(level => level.name)
		]);
		console.info(`✨ All sheets have been wrangled`);

		// We generate a helpful map of sheet title to sheet. We'll need this later
		const sheetsByTitle = sheets.reduce((sheetsByTitle, sheet) => {
			sheetsByTitle[sheet.properties.title] = sheet;
			return sheetsByTitle;
		}, {});
		const overviewSheetId = sheetsByTitle['Overview'].properties.sheetId;

		// Start batching updates to the actual sheet data and format
		const batchedUpdates = [];

		// Set some formatting rules which apply to all sheets,
		// mostly cell alignment
		for (const sheet of sheets) {
			batchedUpdates.push(createBatchAlignmentUpdate(sheet.properties.sheetId, {
				horizontalAlignment: 'LEFT',
				verticalAlignment: 'TOP',
				wrapStrategy: 'WRAP'
			}));
		}

		// Set the data that appears in the overview sheet. This includes some background,
		// warnings about editing the sheet manually, and links to useful resources
		batchedUpdates.push(createBatchCellUpdate(overviewSheetId, [
			['Engineering Progression'],
			['This is an example spreadsheet for tracking engineering progression. This sheet is generated automatically, any edits you make here will be overwritten (including comments).\n\nThis spreadsheet contains sheets for the different levels of engineer, you can use these to track a person\'s progress towards their next promotion. Please make a copy of this spreadsheet to do this.'],
			[''],
			['Competencies Version', competenciesVersion],
			['More Info', '=HYPERLINK("https://engineering-progression.ft.com/", "Engineering Progression website")'],
			['Feedback/Questions', '=HYPERLINK("https://github.com/Financial-Times/engineering-progression/issues/new", "Use GitHub issues")']
		]));

		// Merge the top rows for the overview sheet,
		// we use this as a header and introduction
		batchedUpdates.push({
			mergeCells: {
				range: {
					sheetId: overviewSheetId,
					startRowIndex: 0,
					endRowIndex: 3,
					startColumnIndex: 0,
					endColumnIndex: 2
				},
				mergeType: 'MERGE_ROWS'
			}
		});

		// Resize the columns for the overview sheet
		batchedUpdates.push(createBatchColumnResize(overviewSheetId, {
			startIndex: 0,
			width: 150
		}));
		batchedUpdates.push(createBatchColumnResize(overviewSheetId, {
			startIndex: 1,
			width: 300
		}));

		// Delete additional columns for the overview sheet
		batchedUpdates.push({
			deleteDimension: {
				range: {
					sheetId: overviewSheetId,
					dimension: 'COLUMNS',
					startIndex: 2
				}
			}
		});

		// Bold the main heading for the overview sheet
		batchedUpdates.push({
			repeatCell: {
				range: {
					sheetId: overviewSheetId,
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

		// Bold the meta information headings for the overview sheet
		batchedUpdates.push({
			repeatCell: {
				range: {
					sheetId: overviewSheetId,
					startRowIndex: 3,
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

		// Set the data that appears in each of the competency level sheets. We use the
		// data that we fetched from the live API for this
		for (const level of levels) {

			const sheet = sheetsByTitle[level.name];
			const sheetId = sheet.properties.sheetId;

			const competenciesForLevel = competencies.filter(competency => competency.level === level.id);

			// Add the actual data for the level
			batchedUpdates.push(createBatchCellUpdate(sheetId, [
				['Area', 'Competency', 'Done?', 'Evidence'],
				...competenciesForLevel.map(competency => {
					let content = competency.summary;
					if (competency.examples.length) {
						content += `, e.g.\n${competency.examples.map(example => `• ${example}`).join('\n')}`;
					}
					return [
						capitalizeFirstLetter(competency.area),
						content
					];
				})
			]));

			// Set up the checkbox column for the level
			batchedUpdates.push({
				repeatCell: {
					range: {
						sheetId,
						startRowIndex: 1,
						endRowIndex: competenciesForLevel.length + 1,
						startColumnIndex: 2,
						endColumnIndex: 3
					},
					cell: {
						dataValidation: {
							condition: {
								type: 'BOOLEAN'
							}
						},
						userEnteredFormat: {
							horizontalAlignment: 'CENTER'
						}
					},
					fields: 'dataValidation,userEnteredFormat(horizontalAlignment)'
				}
			});

			// Freeze the header row for the level
			batchedUpdates.push({
				updateSheetProperties: {
					properties: {
						sheetId,
						grid_properties: {
							frozenRowCount: 1
						}
					},
					fields: 'gridProperties.frozenRowCount'
				}
			});

			// Resize the columns for the level
			batchedUpdates.push(createBatchColumnResize(sheetId, {
				startIndex: 0,
				width: 100
			}));
			batchedUpdates.push(createBatchColumnResize(sheetId, {
				startIndex: 1,
				width: 500
			}));
			batchedUpdates.push(createBatchColumnResize(sheetId, {
				startIndex: 2,
				width: 50
			}));
			batchedUpdates.push(createBatchColumnResize(sheetId, {
				startIndex: 3,
				width: 500
			}));

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

		}

		// Send of the batch update
		console.info(`⏳ Adding updated competencies data into the spreadsheet`);
		const response = await client.spreadsheets.batchUpdate({
			spreadsheetId: spreadsheet.spreadsheetId,
			resource: {
				requests: batchedUpdates
			}
		});
		console.info(`✨ Competencies data has been added`);

	} catch (error) {
		console.error(error.stack);
		process.exitCode = 1;
	}
	// Tear down the auth credentials we added to the file system. See `setupAuthCredentialsJson`
	await teardownAuthCredentialsJson();
}

/**
 * Set up the Google auth credentials JSON. The Google API client requires a local JSON file
 * for this, which we don't want to include in the repo for obvious reasons. This function
 * takes a string of JSON auth data (which is found in a _different_ environment variable)
 * and saves it to the disk under an ignored file.
 *
 * @param {String} jsonAuthData - Google authentication data as a JSON string.
 * @returns {Promise} Returns a promise that resolves when the JSON has been written to disk.
 * @modifies Sets the `GOOGLE_APPLICATION_CREDENTIALS` environment variable and writes a file to disk.
 */
async function setupAuthCredentialsJson(jsonAuthData) {
	const jsonFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS = '.env.google-jwt.json';
	return outputFile(path.join(process.cwd(), jsonFilePath), jsonAuthData);
}

/**
 * Tear down the Google auth credentials created by `setupAuthCredentialsJson`.
 *
 * @returns {Promise} Returns a promise that resolves when all the auth stuff is torn down.
 * @modifies Deletes the `GOOGLE_APPLICATION_CREDENTIALS` environment variable and deletes a file from the disk.
 */
async function teardownAuthCredentialsJson() {
	const jsonFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
	return deleteFile(jsonFilePath);
}

/**
 * Create an authenticated Google Sheets client.
 *
 * @returns {Promise} Returns a promise that resolves with a Google Sheets client.
 */
async function createGoogleSheetsClient() {
	const auth = await google.auth.getClient({
		scopes: [
			'https://www.googleapis.com/auth/spreadsheets'
		]
	});
	return google.sheets({
		version: 'v4',
		auth
	});
}

/**
 * Create a set of sheets on a spreadsheet, and delete all of the existing sheets.
 *
 * @param {Object} client - The Google Sheets API client.
 * @param {Object} spreadsheet - A Google spreadsheet object, as returned from the API.
 * @param {Array<String>} requiredSheetTitles - An array of sheet titles to create, in order.
 * @returns {Promise} Returns a promise that resolves with the created sheets.
 * @modifies Updates the specified spreadsheet on Google Sheets.
 */
async function createRequiredSheets(client, spreadsheet, requiredSheetTitles) {
	const batchedUpdates = [];

	// First we need to rename all existing sheets to avoid naming conflicts
	// with the new sheets. These can't just be deleted because you're not
	// allowed to have a spreadsheet with no sheets
	for (const existingSheet of spreadsheet.sheets) {
		batchedUpdates.push({
			updateSheetProperties: {
				properties: {
					sheetId: existingSheet.properties.sheetId,
					title: `TO-DELETE-${uuid()}`
				},
				fields: 'title'
			}
		});
	}

	// Add each of the required sheet titles as new sheets
	for (const title of requiredSheetTitles) {
		batchedUpdates.push({
			addSheet: {
				properties: {title}
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

	return response.data.updatedSpreadsheet.sheets;
}

/**
 * Helper function to create a batch request which sets data for a sheet based on a nested array of rows and columns.
 *
 * @param {String} sheetId - The ID of a single sheet within a spreadsheet.
 * @param {Array<Array<*>>} rows - An array of arrays of values, representing a sheet, rows, and cells.
 * @returns {Object} Returns a batch request based on the provided row data.
 */
function createBatchCellUpdate(sheetId, rows) {
	return {
		updateCells: {
			rows: rows.map(row => {
				return {
					values: row.map(cell => {
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
 * Helper function to create a batch request which sets alignment and wrapping for all cells in a sheet.
 *
 * @param {String} sheetId - The ID of a single sheet within a spreadsheet.
 * @param {Object} options - Alignment and wrapping options.
 * @param {String} options.horizontalAlignment - The horizontal alignment of all cells (see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#HorizontalAlign).
 * @param {String} options.verticalAlignment - The vertical alignment of all cells (see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#VerticalAlign).
 * @param {String} options.wrapStrategy - The wrap strategy of all cells (see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/cells#wrapstrategy).
 * @returns {Object} Returns a batch request based on the provided options.
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
 * @param {String} sheetId - The ID of a single sheet within a spreadsheet.
 * @param {Object} options - Column options.
 * @param {String} options.startIndex - The column start index (zero-based)
 * @param {String} options.endIndex - The column end index (defaults to start index + 1, which updates one column)
 * @param {String} options.width - The pixel width to set the column to
 * @returns {Object} Returns a batch request based on the provided options.
 */
function createBatchColumnResize(sheetId, {endIndex, startIndex, width}) {
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
 * Capitalise the first letter in a string.
 *
 * @param {String} string - The string to capitalise the first letter of
 * @returns {String} Returns the string with the first letter capitalised
 */
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
