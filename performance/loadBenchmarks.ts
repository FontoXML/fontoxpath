import * as glob from 'glob';

export function getImports(): string[] {
	const toImport: string[] = [];
	const files = glob.sync('performance/**/*.benchmark.ts');
	toImport.push(
		...files.map(file => {
			const fileWithoutExtension = file.slice(0, -3);
			// We need to replace 'performance/' with './'
			const relativeImport = '.' + fileWithoutExtension.substring('performance'.length);
			return relativeImport;
		})
	);

	return toImport;
}

export default async function loadBenchmarks() {
	const imports = getImports();
	for (const relativeImport of imports) {
		await import(relativeImport);
	}
}
