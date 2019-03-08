#!/usr/bin/env node

const competencies = require('../dist/competencies.json');
const {outputJSON} = require('fs-extra');
const levels = require('../dist/levels.json');
const path = require('path');
const semver = require('semver');

process.on('unhandledRejection', error => {
	console.error(error.stack);
	process.exitCode = 1;
});

buildWebsiteData({
	dataPath: path.resolve(__dirname, '..', 'site', '_data'),
	competencies
});

async function buildWebsiteData({dataPath, competencies}) {
	await createCompetenciesData(competencies, dataPath);
	await createLevelsData(levels, dataPath);
}

function createCompetenciesData(competencies, dataPath) {
	const competenciesPath = path.join(dataPath, 'competencies.json');
	return outputJSON(competenciesPath, competencies, {
		spaces: '\t'
	});
}

function createLevelsData(levels, dataPath) {
	const levelsPath = path.join(dataPath, 'levels.json');
	return outputJSON(levelsPath, levels, {
		spaces: '\t'
	});
}
