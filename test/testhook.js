const useDist = process.argv.includes('--dist');
const useJsCodegen = process.argv.includes('--jscodegen');

console.log(
	(useDist ? 'Running tests against dist build' : 'Running tests against development bundle') +
		(useJsCodegen ? ' using the JSCodegen backend where possible' : '')
);

const tsConfig = require('./tsconfig.json');

const tsConfigPaths = require('tsconfig-paths');

if (useDist) {
	tsConfig.compilerOptions.paths.fontoxpath = ['../dist/fontoxpath.esm.js'];
}

if (useJsCodegen) {
	tsConfig.compilerOptions.paths.fontoxpath = ['../test/testCodegenFacade.ts'];
}

// Make the import of 'xspattern' point to the node_modules version for unit tests
tsConfig.compilerOptions.paths.xspattern = ['node_modules/xspattern/dist/xspattern.ts'];

tsConfigPaths.register({
	baseUrl: './test',
	paths: tsConfig.compilerOptions.paths,
	allowJs: true,
	include: '../dist/*',
});

require('source-map-support/register');
