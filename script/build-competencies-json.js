#!/usr/bin/env node

const {outputJson, readFile} = require('fs-extra');
const path = require('path');
const YAML = require('yaml');

parseAndSaveYaml(
	path.resolve(__dirname, '..', 'data', 'competencies.yml'),
	path.resolve(__dirname, '..', 'dist', 'competencies.json')
);

/**
 * Load and parse a YAML file, then save it as JSON.
 *
 * @param {String} yamlFilePath - the path of a YAML file to parse.
 * @param {String} jsonFilePath - the path of the JSON file to save to.
 * @returns {Promise} Returns a promise that resolves when the JSON file is saved.
 */
async function parseAndSaveYaml(yamlFilePath, jsonFilePath) {
	return outputJson(jsonFilePath, await parseYamlFile(yamlFilePath), {
		spaces: '\t'
	});
}

/**
 * Load and parse a YAML file.
 *
 * @param {String} yamlFilePath - the path of a YAML file to parse.
 * @returns {Promise<*>} Returns a promise that resolves with the parsed YAML.
 */
async function parseYamlFile(yamlFilePath) {
	return YAML.parse(await readFile(yamlFilePath, 'utf-8'));
}
