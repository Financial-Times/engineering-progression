#!/usr/bin/env node

const Ajv = require('ajv');
const competencies = require('../dist/competencies.json');
const pointer = require('json-pointer');
const schema = require('../test/schema/schema.json');

outputValidationErrors();

function outputValidationErrors() {
	const errors = [...getValidationErrors(), ...getIdErrors()];
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

function getIdErrors() {
	const errors = [];
	if (Array.isArray(competencies)) {
		const ids = competencies
			.filter(competency => typeof competency === 'object' && competency !== null)
			.map(competency => competency.id)
			.filter(competency => Boolean(competency));
		const duplicates = findDuplicates(ids);
		if (duplicates.length) {
			errors.push({
				dataPath: '',
				message: 'should contain only unique IDs',
				duplicateIds: duplicates
			})
		}
	}
	return errors;
}

function errorToString(error) {
	const value = pointer(competencies, error.dataPath);
	let expected = error.message;
	if (error && error.params && error.params.allowedValues) {
		expected += ` (${error.params.allowedValues.join(', ')})`;
	}
	const valueAsJson = JSON.stringify(value, null, '\t');
	let received = valueAsJson;
	if (error && error.params && error.params.additionalProperty) {
		received = `additional property "${error.params.additionalProperty}"`;
	}
	if (error && error.duplicateIds) {
		received = `duplicate IDs ${error.duplicateIds.join(', ')}`;
	}
	return `Error in value at ${error.dataPath}:
		├── Expected: ${expected}
		└── Received: ${received}
	`.trim().replace(/\t/g, '');
}

function findDuplicates(array) {
	const found = [];
	const duplicates = [];
	for (const item of array) {
		if (!found.includes(item)) {
			found.push(item);
		} else if (!duplicates.includes(item)) {
			duplicates.push(item);
		}
	}
	return duplicates;
}
