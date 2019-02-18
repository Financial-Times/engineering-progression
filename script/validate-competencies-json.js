#!/usr/bin/env node

const Ajv = require('ajv');
const path = require('path');
const pointer = require('json-pointer');
const {readJson} = require('fs-extra');
const schema = require('../test/schema/schema.json');

validateJsonAsCompetencies(path.resolve(__dirname, '..', 'dist', 'competencies.json'));

/**
 * Validate a JSON file as if it were an array of competencies, then output the result.
 *
 * @param {String} yamlFilePath - the path of a JSON file to validate.
 * @returns {Promise} Returns a promise that resolves when the JSON has been validated.
 * @modifies Modifies the process with an exit code, and outputs via console.info/error
 */
async function validateJsonAsCompetencies(jsonFilePath) {
	const competencies = await readJson(jsonFilePath);
	const errors = getValidationErrors(competencies);
	outputErrorsToCommandLine(errors);
}

/**
 * Get validation errors for a set of competencies.
 *
 * @param {Array<Object>} competencies - the array of competencies to validate.
 * @returns {Array<Object>} Returns an array of objects representing validation errors.
 */
function getValidationErrors(competencies) {
	return [
		...getSchemaErrors(competencies),
		...getDuplicateIdErrors(competencies)
	];
}

/**
 * Get JSON Schema validation errors for a set of competencies.
 *
 * @param {Array<Object>} competencies - the array of competencies to validate.
 * @returns {Array<Object>} Returns an array of objects representing schema validation errors.
 */
function getSchemaErrors(competencies) {
	const ajv = new Ajv({
		allErrors: true,
		jsonPointers: true
	});
	const validate = ajv.compile(schema);
	return (validate(competencies) ? [] : processSchemaErrors(validate.errors, competencies));
}

/**
 * Get duplicate ID validation errors for a set of competencies.
 *
 * @param {Array<Object>} competencies - the array of competencies to validate.
 * @returns {Array<Object>} Returns an array of objects representing duplicate ID validation errors.
 */
function getDuplicateIdErrors(competencies) {
	// We have to code defensively here, as we're not guaranteed at
	// this point that the competencies match the schema
	if (Array.isArray(competencies)) {
		const foundIds = [];
		return competencies
			.filter(competency => (
				typeof competency === 'object' &&
				competency !== null &&
				competency.id &&
				typeof competency.id === 'string'
			))
			.filter(competency => {
				if (foundIds.includes(competency.id)) {
					return true;
				}
				foundIds.push(competency.id);
				return false;
			})
			.map(competency => {
				return {
					path: '/',
					value: competency,
					expected: 'IDs must not be duplicated',
					received: `"${competency.id}" multiple times`
				};
			});
	}
	return [];
}

/**
 * Process a set of schema errors, ironing out the formatting ready for output.
 *
 * @param {Array<Object>} errors - the array of errors to process.
 * @param {Array<Object>} competencies - the array of competencies that the errors are for.
 * @returns {Array<Object>} Returns an array of processed error objects.
 */
function processSchemaErrors(errors, competencies) {
	return errors.map(error => {
		const processedError = {
			path: error.dataPath,
			value: pointer(competencies, error.dataPath),
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
		console.error('There were validation errors found in the competencies:\n');
		console.error(errors.map(errorToString).join('\n\n') + '\n');
		process.exitCode = 1;
	} else {
		console.info('No validation errors found in the competencies');
	}
}

/**
 * Stringify an error object ready for output.
 *
 * @param {Object} error - the error to stringify.
 * @returns {String} Returns a string representation of an error.
 */
function errorToString(error) {
	return `Error in value at ${error.path}:
		├── Expected: ${error.expected}
		└── Received: ${error.received}
	`.trim().replace(/\t/g, '');
}
