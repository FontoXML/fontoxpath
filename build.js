const fs = require('fs-extra');

const ts = require('typescript');

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const skipClosureBuild = process.env.npm_config_skip_closure;

const tscc = require('@tscc/tscc').default;

function outputDeclarations() {
	console.log('Starting generation of typings');
	const options = {
		outDir: './built',
		baseUrl: '.',
		lib: ['es6', 'es2017', 'esnext.asynciterable'],
		target: 'es2017',
		module: 'commonjs',
		declaration: true,
		emitDeclarationOnly: true,
	};

	const host = ts.createCompilerHost(options);

	const program = ts.createProgram(['./src/index.ts'], options, host);
	program.emit();
	const apiExtractorConfig = ExtractorConfig.loadFileAndPrepare('./api-extractor.json');
	const extractorResult = Extractor.invoke(apiExtractorConfig, {});
	if (!extractorResult.succeeded) {
		throw new Error('Typing extraction failed');
	}
	console.log('Typings generated');
}

function doTSCCBuild() {
	return tscc(
		{
			modules: {
				'dist/fontoxpath-raw': 'src/index.ts',
			},
			prefix: './',
			compilerFlags: {
				debug: false,
				assume_function_wrapper: true,
				compilation_level: 'ADVANCED',
				output_wrapper: `function (xspattern, prsc) {
const VERSION='${require('./package.json').version}';
const fontoxpathGlobal = {};
%output%
return fontoxpathGlobal;
}
`,
			},
			external: { xspattern: 'xspattern', prsc: 'prsc' },
		},
		'./tsconfig.json',
		{
			declaration: false,
		}
	).then(() => console.log('Done'));
}

function doModuleBuild() {
	// Feels dirty but works like a charm: get the public exports of the bundle from the typings and generate a bundle that wraps the umd
	const api = JSON.parse(fs.readFileSync('dist/fontoxpath.api.json', 'utf-8'));
	const fontoxpathAPI = api.members.find((member) => member.kind === 'EntryPoint');
	const members = fontoxpathAPI.members.filter(
		(member) =>
			member.kind === 'Function' || member.kind === 'Variable' || member.kind === 'Enum'
	);

	// Some part of the compiler is aliasing types with a `_2` postfix. Fix them.
	const memberNames = members.map(({ name }) =>
		name.endsWith('_2') ? name.substring(0, name.length - 2) : name
	);

	const exports = memberNames.map((name) => `export const ${name} = fontoxpath.${name};`);

	const fontoxpathFunction = fs.readFileSync('./dist/fontoxpath-raw.js', 'utf8');
	const fullModule = `import * as xspattern from 'xspattern';
import * as prsc from 'prsc';
const fontoxpath = (${fontoxpathFunction})
	.call(typeof window === 'undefined' ? undefined : window, xspattern);
${exports.join('\n')}
export default fontoxpath;
`;

	const umdModule = `(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['xspattern', 'prsc'], factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = [factory(require('xspattern')), factor(require('prsc'))];
	} else {
		// Browser globals (root is window)
		// Maybe it is in scope:
		root.fontoxpath = [factory(root.xspattern), factory(root.prsc)];
	}
})(this, function (xspattern, prsc) {
	return (${fontoxpathFunction})(xspattern, prsc);
});
`;

	fs.writeFileSync('./dist/fontoxpath.esm.js', fullModule, 'utf8');
	fs.writeFileSync('./dist/fontoxpath.js', umdModule, 'utf8');
}

let chain = Promise.resolve();

if (!skipClosureBuild) {
	chain = chain.then(outputDeclarations);
	chain = chain.then(doTSCCBuild);
	chain = chain.then(doModuleBuild);
}

chain.catch((err) => {
	console.error('Err: ' + err);
	process.exit(1);
});
