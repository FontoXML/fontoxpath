const peg = require('peggy');
const fs = require('fs-extra');

const ts = require('typescript');

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const skipParserBuild = process.env.npm_config_skip_parser;
const skipClosureBuild = process.env.npm_config_skip_closure;

const tscc = require('@tscc/tscc').default;
function doPegJsBuild() {
	return new Promise((resolve, reject) =>
		fs.readFile('./src/parsing/xpath.pegjs', 'utf8', (err, file) =>
			err ? reject(err) : resolve(file)
		)
	)
		.then((pegJsString) =>
			peg.generate(pegJsString, {
				cache: true,
				output: 'source',
				format: 'globals',
				exportVar: 'xPathParser',
			})
			 )
	// Note the ts-nocheck, the output of pegJs is not valid TypeScript. The tslint-disable disables
	// linter errors. Also, don't measure code coverage on this file. It is generated.
		.then((parserString) => `// @ts-nocheck
/* tslint:disable */
/* istanbul ignore file */

// HACK: PegJS uses a single object with keys that are later indexed using strings,
//  this is incompatible with the closure compiler.
// Annotate this object with the following interface to prevent renaming.
declare interface pegjs_internal {
	literal: unknown,
	class: unknown,
	any: unknown,
	end: unknown,
	other: unknown,
}

export default function(globalThis) {
(function() {
${parserString.replace('var DESCRIBE_EXPECTATION_FNS = ', 'var DESCRIBE_EXPECTATION_FNS: pegjs_internal = ')}
}).call(globalThis);
};`)
		.then((parserString) =>
			Promise.all([
				new Promise((resolve, reject) =>
					fs.writeFile('./src/parsing/xPathParser_raw.ts', parserString, (err) =>
						err ? reject(err) : resolve()
					)
				),
			])
		)
		.then(() => console.info('Parser generator done'));
}

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
				output_wrapper: `function (xspattern) {
const VERSION='${require('./package.json').version}';
const fontoxpathGlobal = {};
%output%
return fontoxpathGlobal;
}
`,
			},
			external: { xspattern: 'xspattern' },
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
		(member) => member.kind === 'Function' || member.kind === 'Variable'
	);

	const exports = members.map(
		(member) => `export const ${member.name} = fontoxpath.${member.name};`
	);

	const fontoxpathFunction = fs.readFileSync('./dist/fontoxpath-raw.js', 'utf8');
	const fullModule = `import * as xspattern from 'xspattern';
const fontoxpath = (${fontoxpathFunction})
	.call(typeof window === 'undefined' ? undefined : window, xspattern);
${exports.join('\n')};
export default fontoxpath;
`;

	const umdModule = `(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['xspattern'], factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory(require('xspattern'));
	} else {
		// Browser globals (root is window)
		// Maybe it is in scope:
		root.fontoxpath = factory(root.xspattern);
	}
})(this, function (xspattern) {
	return (${fontoxpathFunction})(xspattern);
});
`;

	fs.writeFileSync('./dist/fontoxpath.esm.js', fullModule, 'utf8');
	fs.writeFileSync('./dist/fontoxpath.js', umdModule, 'utf8');
}

let chain = Promise.resolve();
if (!skipParserBuild) {
	chain = chain.then(doPegJsBuild);
}

if (!skipClosureBuild) {
	chain = chain.then(outputDeclarations);
	chain = chain.then(doTSCCBuild);
	chain = chain.then(doModuleBuild);
}

chain.catch((err) => {
	console.error('Err: ' + err);
	process.exit(1);
});
