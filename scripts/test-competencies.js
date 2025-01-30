import { readFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import roleSchema from '../test/schema/role.json' with { type: 'json' };
import { buildCompetencies } from './lib/build-competencies.js';

const rootPath = resolvePath(import.meta.dirname, '..');
const dataPath = resolvePath(rootPath, 'data');
const distPath = resolvePath(rootPath, 'dist');

const ajv = new Ajv({ allErrors: true });
const validateSchema = ajv.compile(roleSchema);

buildCompetencies({ input: dataPath, output: distPath })
	.then(async (buildInfo) => {
		for (const path of Object.values(buildInfo)) {
			const pathRelative = path.replace(`${rootPath}/`, '');
			console.log('Testing competencies at', pathRelative);
			const role = JSON.parse(await readFile(path, 'utf-8'));

			// Validate against the schema
			const isValid = validateSchema(role);
			if (!isValid) {
				throw new AggregateError(validateSchema.errors);
			}
			console.log('Competencies pass schema validation');

			// Test that IDs are unique
			assertUniqueIds('competencies', role);
			assertUniqueIds('levels', role);
			assertUniqueIds('themes', role);
			console.log('All IDs are unique');

			// Test that competency referenced IDs are valid
			const levelsById = Object.fromEntries(role.levels.map((level) => [level.id, level]));
			const themesById = Object.fromEntries(role.themes.map((theme) => [theme.id, theme]));
			const errors = [];
			for (const [index, competency] of Object.entries(role.competencies)) {
				if (!levelsById[competency.level]) {
					errors.push(
						Object.assign(
							new Error(
								'must have a level property that points to an existing level id'
							),
							{
								instancePath: `/competencies/${index}/level`
							}
						)
					);
				}
				if (!themesById[competency.theme]) {
					errors.push(
						Object.assign(
							new Error(
								'must have a theme property that points to an existing theme id'
							),
							{
								instancePath: `/competencies/${index}/theme`
							}
						)
					);
				}
			}
			if (errors.length) {
				throw new AggregateError(errors);
			}
			console.log('All competency levels and themes are defined');
		}
	})
	.catch((error) => {
		process.exitCode = 1;
		console.error('Testing competencies failed:');
		if (error instanceof AggregateError) {
			for (const validationError of error.errors) {
				console.log(`* ${validationError.instancePath}: ${validationError.message}`);
			}
		} else {
			console.error(error.message);
		}
	});

function assertUniqueIds(property, data) {
	const foundIds = new Set();
	const errors = [];
	for (const [index, item] of Object.entries(data[property])) {
		if (foundIds.has(item.id)) {
			errors.push(
				Object.assign(new Error(`must not have a duplicate id property: ${item.id}`), {
					instancePath: `/${property}/${index}`
				})
			);
		}
		foundIds.add(item.id);
	}
	if (errors.length) {
		throw new AggregateError(errors);
	}
}
