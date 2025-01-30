import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve as resolvePath } from 'node:path';
import { buildCompetencies } from './lib/build-competencies.js';

const rootPath = resolvePath(import.meta.dirname, '..');
const dataPath = resolvePath(rootPath, 'data');
const distPath = resolvePath(rootPath, 'dist');
const siteDataPath = resolvePath(rootPath, 'site', '_data');
const siteCompetencyPagePath = resolvePath(rootPath, 'site', 'pages', 'competencies');

buildCompetencies({ input: dataPath, output: distPath })
	.then(async (buildInfo) => {
		for (const path of Object.values(buildInfo)) {
			const pathRelative = path.replace(`${rootPath}/`, '');

			console.log('Copying competencies at', pathRelative, 'into site data folder');
			const outPath = resolvePath(siteDataPath, path.replace(`${distPath}/`, ''));
			await mkdir(dirname(outPath), { recursive: true });
			await copyFile(path, outPath);

			console.log('Building pages for each level in', pathRelative);
			const role = JSON.parse(await readFile(path, 'utf-8'));
			const roleId = basename(path, extname(path));
			await mkdir(resolvePath(siteCompetencyPagePath, roleId), { recursive: true });

			const indexPage = `
					---
					title: ${role.name} Competencies
					permalink: /competencies/${roleId}/
					redirect_to: /competencies/
					---
				`
				.replace(/\t/g, '')
				.trim();
			await writeFile(resolvePath(siteCompetencyPagePath, roleId, 'index.md'), indexPage);

			for (const level of role.levels) {
				console.log(`Building page for ${role.name} / ${level.name}`);
				const pagePath = resolvePath(siteCompetencyPagePath, roleId, `${level.id}.md`);
				const page = `
					---
					title: ${level.name} Competencies (${role.name})
					description: Competencies for ${level.name} within ${role.name} at the Financial Times.
					permalink: /competencies/${roleId}/${level.id}/
					layout: competencies
					roleId: ${roleId}
					levelId: ${level.id}
					---
				`
					.replace(/\t/g, '')
					.trim();
				await writeFile(pagePath, page);
			}
		}
	})
	.catch((error) => {
		process.exitCode = 1;
		console.error('Failed to build website data:');
		console.error(error.message);
	});
