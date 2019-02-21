#!/usr/bin/env node

const {google} = require('googleapis');
const {outputFile, remove: deleteFile} = require('fs-extra');
const path = require('path');
const semver = require('semver');
const uuid = require('uuid').v4;

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
	spreadsheetId: '1V0LIbCQtJsi2iowfJnRTDr4Na4LhNAlJ_UHl9dDQs00'

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

		// Start batching updates to the actual sheet data
		const batchedUpdates = [];

		// Set the data that appears in the overview sheet. This includes some background,
		// warnings about editing the sheet manually, and links to useful resources
		batchedUpdates.push(createCellUpdateForBatch(sheetsByTitle['Overview'].properties.sheetId, [
			['Engineering Progression'],
			['This is an example spreadsheet for tracking engineering progression. This sheet is generated automatically, any edits you make here will be overwritten.'],
			['Competencies Version', competenciesVersion],
			['More Info', 'https://engineering-progression.ft.com/']
		]));

		// Set the data that appears in each of the competency level sheets. We use the
		// data that we fetched from the live API for this
		for (const level of levels) {
			batchedUpdates.push(createCellUpdateForBatch(sheetsByTitle[level.name].properties.sheetId, [
				['Area', 'Competency'],
				...competencies
					.filter(competency => competency.level === level.id)
					.map(competency => {
						return [
							competency.area,
							`${competency.summary}\n${competency.examples.map(example => `• ${example}`).join('\n')}`
						];
					})
			]));
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
 * Helper function to create a cell update request from a standard nested array. The Google Sheets
 * request format is very strict and verbose and this simplifies it.
 *
 * @param {String} sheetId - The ID of a single sheet within a spreadsheet.
 * @param {Array<Array<*>>} rows - An array of arrays of values, representing a sheet, rows, and cells.
 * @returns {Object} Returns an `updateCells` batch request based on the provided row data.
 */
function createCellUpdateForBatch(sheetId, rows) {
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
							value.stringValue = cell;
						}
						return {
							userEnteredValue: value
						};
					})
				};
			}),
			fields: '*',
			start: {
				sheetId,
				rowIndex: 0,
				columnIndex: 0
			}
		}
	};
}
