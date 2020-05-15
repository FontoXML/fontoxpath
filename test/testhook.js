const useDist = process.argv.includes('--dist');

console.log(useDist);

const tsConfig = require('./tsconfig.json');

const tsConfigPaths = require('tsconfig-paths');

if (useDist) {
	tsConfig.compilerOptions.paths.fontoxpath = ['dist/fontoxpath.js'];
}
// Make the import of 'xspattern' point to the node_modules version for unit tests
tsConfig.compilerOptions.paths.xspattern = ['node_modules/xspattern/dist/xspattern.ts'];

tsConfigPaths.register({
	baseUrl: '.',
	paths: tsConfig.compilerOptions.paths
});

require('source-map-support/register');
