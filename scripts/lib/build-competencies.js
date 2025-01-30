import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve as resolvePath } from 'node:path';
import { parse as parseYaml } from 'yaml';

export async function buildCompetencies({ input, output }) {
	const paths = await readdir(input, { recursive: true, withFileTypes: true });
	const yamlPaths = paths
		.filter((dirent) => dirent.isFile() && dirent.name.endsWith('.yml'))
		.map((dirent) => resolvePath(dirent.parentPath, dirent.name));

	const buildInfo = {};
	for (const path of yamlPaths) {
		const outPath = path.replace(input, output).replace('.yml', '.json');
		await mkdir(dirname(outPath), { recursive: true });
		const data = parseYaml(await readFile(path, 'utf-8'));
		await writeFile(outPath, JSON.stringify(data, null, '\t'));
		buildInfo[path] = outPath;
	}

	return buildInfo;
}
