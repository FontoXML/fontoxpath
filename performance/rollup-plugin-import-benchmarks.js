// We can import the javascript version as we always compile the typescript before rollup.
import { getImports } from './lib/performance/loadBenchmarks';

export default function importBenchmarks() {
	return {
		name: 'import-benchmarks',

		load(id) {
			console.log(id);
			if (!id.endsWith('runBenchmarks.js')) {
				return null;
			}

			// We want to overwrite the code of runBenchmarks. Instead of loading all benchmarks by
			// searching for the files we'll search for the files now and generate import statements.
			const toImport = getImports();
			let imports = '';
			for (const i of toImport) {
				imports += `import '${i}';`;
			}

			return `import runner from './benchmarkRunner/BenchmarkRunner';
			${imports}
			runner.run();`;
		}
	};
}
