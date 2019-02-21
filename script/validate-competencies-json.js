#!/usr/bin/env node

const Ajv = require('ajv');
const path = require('path');
const pointer = require('json-pointer');
const {readJson} = require('fs-extra');
const competenciesSchema = require('../test/schema/competencies.json');
const levelsSchema = require('../test/schema/levels.json');

validateJsonFiles([
	{
		path: path.resolve(__dirname, '..', 'dist', 'competencies.json'),
		schema: competenciesSchema
	},
	{
		path: path.resolve(__dirname, '..', 'dist', 'levels.json'),
		schema: levelsSchema
	}
]);

/**
 * Validate an array of JSON files against different schemas.
 *
 * @param {Array<Object>} configurations - JSON file and schema configurations.
 * @returns {Promise} Returns a promise that resolves when the JSON has been validated.
 * @modifies Modifies the process with an exit code, and outputs via console.info/error
 */
async function validateJsonFiles(configurations) {
	let errors = [];
	for (const configuration of configurations) {
		errors = errors.concat(
			await validateJsonFileUsingSchema(configuration.path, configuration.schema)
		);
	}
	outputErrorsToCommandLine(errors);
}

/**
 * Validate a JSON file against a schema, then return any errors.
 *
 * @param {String} jsonFilePath - the path of a JSON file to validate.
 * @param {Object} schema - the JSON Schema object to validate with.
 * @returns {Promise<Array>} Returns a promise that resolves with validation errors.
 */
async function validateJsonFileUsingSchema(jsonFilePath, schema) {
	return getValidationErrors(await readJson(jsonFilePath), schema).map(error => {
		error.filePath = jsonFilePath;
		return error;
	});
}

/**
 * Get validation errors for a JavaScript object and schema.
 *
 * @param {Array<Object>} data - the array of things to validate.
 * @param {Object} schema - the JSON Schema object to validate with.
 * @returns {Array<Object>} Returns an array of objects representing validation errors.
 */
function getValidationErrors(data, schema) {
	return [
		...getSchemaErrors(data, schema),
		...getDuplicateIdErrors(data)
	];
}

/**
 * Get JSON Schema validation errors for a set of competencies.
 *
 * @param {Array<Object>} data - the array of things to validate.
 * @param {Object} schema - the JSON Schema object to validate with.
 * @returns {Array<Object>} Returns an array of objects representing schema validation errors.
 */
function getSchemaErrors(data, schema) {
	const ajv = new Ajv({
		allErrors: true,
		jsonPointers: true
	});
	const validate = ajv.compile(schema);
	return (validate(data) ? [] : processSchemaErrors(validate.errors, data));
}

/**
 * Get duplicate ID validation errors for a set of competencies.
 *
 * @param {Array<Object>} data - the array of things to validate.
 * @returns {Array<Object>} Returns an array of objects representing duplicate ID validation errors.
 */
function getDuplicateIdErrors(data) {
	// We have to code defensively here, as we're not guaranteed at
	// this point that the data match the schema
	if (Array.isArray(data)) {
		const foundIds = [];
		return data
			.filter(item => (
				typeof item === 'object' &&
				item !== null &&
				item.id &&
				typeof item.id === 'string'
			))
			.filter(item => {
				if (foundIds.includes(item.id)) {
					return true;
				}
				foundIds.push(item.id);
				return false;
			})
			.map(item => {
				return {
					path: '/',
					value: item,
					expected: 'IDs must not be duplicated',
					received: `"${item.id}" multiple times`
				};
			});
	}
	return [];
}

/**
 * Process a set of schema errors, ironing out the formatting ready for output.
 *
 * @param {Array<Object>} errors - the array of errors to process.
 * @param {Array<Object>} data - the array of things that the errors are for.
 * @returns {Array<Object>} Returns an array of processed error objects.
 */
function processSchemaErrors(errors, data) {
	return errors.map(error => {
		const processedError = {
			path: error.dataPath,
			value: pointer(data, error.dataPath),
			expected: error.message,
			received: ''
		};
		processedError.received = JSON.stringify(processedError.value, null, '\t');

		// Custom formatting for enum properties
		if (error && error.params && error.params.allowedValues) {
			processedError.expected += ` (${error.params.allowedValues.join(', ')})`;
		}

		// Custom formatting for "additional property" errors
		if (error && error.params && error.params.additionalProperty) {
			processedError.received = `additional property "${error.params.additionalProperty}"`;
		}

		return processedError;
	});
}

/**
 * Output an array of errors to the command line.
 *
 * @param {Array<Object>} errors - the errors to output.
 * @returns {Undefined} Returns nothing.
 * @modifies Modifies the process with an exit code, and outputs via console.info/error
 */
function outputErrorsToCommandLine(errors) {
	if (errors.length) {
		console.error('There were validation errors found in the competencies data:\n');
		console.error(errors.map(errorToString).join('\n\n') + '\n');
		process.exitCode = 1;
	} else {
		console.info('No validation errors found in the competencies data');
	}
}

/**
 * Stringify an error object ready for output.
 *
 * @param {Object} error - the error to stringify.
 * @returns {String} Returns a string representation of an error.
 */
function errorToString(error) {
	return `Error in value at ${error.path} (${error.filePath}):
		├── Expected: ${error.expected}
		└── Received: ${error.received}
	`.trim().replace(/\t/g, '');
}
