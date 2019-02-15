#!/usr/bin/env node

const Ajv = require('ajv');
const competencies = require('../dist/competencies.json');
const pointer = require('json-pointer');
const schema = require('../test/schema/schema.json');

outputValidationErrors();

function outputValidationErrors() {
	const errors = getValidationErrors();
	if (!errors.length) {
		return console.log('No validation errors found in the competencies');
	}
	console.log('There were validation errors found in the competencies:\n');
	console.log(errors.map(errorToString).join('\n\n') + '\n');
	process.exitCode = 1;
}

function getValidationErrors() {
	const ajv = new Ajv({
		allErrors: true,
		jsonPointers: true
	});
	const validate = ajv.compile(schema);
	return (validate(competencies) ? [] : validate.errors);
}

function errorToString(error) {
	const value = pointer(competencies, error.dataPath);
	let expected = error.message;
	if (error && error.params && error.params.allowedValues) {
		expected += ` (${error.params.allowedValues.join(', ')})`;
	}
	const valueAsJson = JSON.stringify(value, null, '\t');
	return `Error in value at ${error.dataPath}:
		├── Expected: ${expected}
		└── Received: ${valueAsJson}
	`.trim().replace(/\t/g, '');
}
