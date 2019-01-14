const useDist = process.argv.includes('--dist');

console.log(useDist);

const tsConfig = require('./tsconfig.json');

const tsConfigPaths = require('tsconfig-paths');

if (useDist) {
	tsConfig.compilerOptions.paths.fontoxpath = ['dist/fontoxpath.js'];
}

tsConfigPaths.register({
	baseUrl: '.',
	paths: tsConfig.compilerOptions.paths
});

require('source-map-support/register');
