import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import importBenchmarks from './rollup-plugin-import-benchmarks.js';

export default {
	input: 'performance/lib/performance/runBenchmarks.js',
	output: [
		{
			name: 'fontoxpath',
			file: 'performance/lib/fontoxpath-perf.js',
			format: 'umd',
			sourcemap: true
		}
	],
	onwarn(warning) {
		// Ignore "this is undefined" warning triggered by typescript's __extends helper
		if (warning.code === 'THIS_IS_UNDEFINED') {
			return;
		}

		console.error(warning.message);
	},
	plugins: [importBenchmarks(), resolve(), commonjs()],
	external: ['benchmark']
};
