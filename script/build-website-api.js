#!/usr/bin/env node

const competencies = require('../dist/competencies.json');
const {copyFile, outputJSON} = require('fs-extra');
const levels = require('../dist/levels.json');
const path = require('path');
const semver = require('semver');

buildWebsiteApi({
	tag: process.env.CIRCLE_TAG,
	apiPath: path.resolve(__dirname, '..', 'site', 'api'),
	competencies
});

async function buildWebsiteApi({tag, apiPath, competencies}) {
	if (!tag || !semver.valid(tag)) {
		process.exitCode = 1;
		return console.error('Error: CIRCLE_TAG environment variable must be set to a valid semver version');
	} else {
		const versionedApiPath = path.join(apiPath, `v${semver.major(tag)}`);
		await createCompetenciesEndpoint(competencies, versionedApiPath);
		await createLevelsEndpoint(levels, versionedApiPath);
		await createCompetenciesByLevelEndpoints(competencies, levels, versionedApiPath);
	}
}

function createCompetenciesEndpoint(competencies, versionedApiPath) {
	const versionedEndpointPath = path.join(versionedApiPath, 'competencies/all.json');
	return outputJSON(versionedEndpointPath, competencies, {
		spaces: '\t'
	});
}

function createLevelsEndpoint(levels, versionedApiPath) {
	const versionedEndpointPath = path.join(versionedApiPath, 'levels/all.json');
	return outputJSON(versionedEndpointPath, levels, {
		spaces: '\t'
	});
}

async function createCompetenciesByLevelEndpoints(competencies, levels, versionedApiPath) {
	for (const level of levels) {
		const versionedEndpointPath = path.join(versionedApiPath, `levels/${level.id}.json`);
		const clonedLevel = Object.assign({}, level);
		clonedLevel.competencies = competencies.filter(competency => competency.level === level.id);
		await outputJSON(versionedEndpointPath, clonedLevel, {
			spaces: '\t'
		});
	}
}
