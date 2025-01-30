import { resolve as resolvePath } from 'node:path';
import { buildCompetencies } from './lib/build-competencies.js';

const rootPath = resolvePath(import.meta.dirname, '..');
const dataPath = resolvePath(rootPath, 'data');
const distPath = resolvePath(rootPath, 'dist');

buildCompetencies({ input: dataPath, output: distPath })
	.then((buildInfo) => {
		console.log('Competency data built:');
		for (const [input, output] of Object.entries(buildInfo)) {
			const inputRelative = input.replace(`${rootPath}/`, '');
			const outputRelative = output.replace(`${rootPath}/`, '');
			console.log(`${inputRelative} to ${outputRelative}`);
		}
	})
	.catch((error) => {
		process.exitCode = 1;
		console.error('Failed to build competencies:');
		console.error(error.message);
	});
