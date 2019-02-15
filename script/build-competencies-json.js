#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const YAML = require('yaml');

const dataFolderPath = path.resolve(__dirname, '..', 'data');
const distFolderPath = path.resolve(__dirname, '..', 'dist');

(async () => {
	const data = await parseCompetenciesYaml();
	await saveCompetenciesJson(JSON.stringify(data, null, '\t'));
})();

async function parseCompetenciesYaml() {
	const yamlFilePath = path.join(dataFolderPath, 'competencies.yml');
	const yamlFileContent = await fs.readFile(yamlFilePath, 'utf-8');
	return YAML.parse(yamlFileContent);
}

async function saveCompetenciesJson(json) {
	await fs.mkdirp(distFolderPath);
	const jsonFilePath = path.join(distFolderPath, 'competencies.json');
	return fs.writeFile(jsonFilePath, json);
}
