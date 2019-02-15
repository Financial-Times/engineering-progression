#!/usr/bin/env node

const {copyFile, ensureDir} = require('fs-extra');
const path = require('path');
const semver = require('semver');

buildWebsiteApi({
	tag: process.env.CIRCLE_TAG,
	apiPath: path.resolve(__dirname, '..', 'site', 'api'),
	competenciesJsonFilePath: path.resolve(__dirname, '..', 'dist', 'competencies.json')
});

async function buildWebsiteApi({tag, apiPath, competenciesJsonFilePath}) {
	if (!tag || !semver.valid(tag)) {
		process.exitCode = 1;
		return console.error('Error: CIRCLE_TAG environment variable must be set to a valid semver version');
	} else {
		const versionedApiPath = path.join(apiPath, `v${semver.major(tag)}`);
		const versionedCompetenciesPath = path.join(versionedApiPath, 'competencies.json');
		await ensureDir(versionedApiPath);
		await copyFile(competenciesJsonFilePath, versionedCompetenciesPath);
	}
}
