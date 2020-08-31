const peg = require('pegjs');
const fs = require('fs-extra');
const UglifyJS = require('uglify-js');

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
		.then((parserString) => {
			const uglified = UglifyJS.minify(parserString);
			if (uglified.error) {
				fs.writeFileSync('./src/parsing/xPathParser_raw.ts', parserString);
				throw uglified.error;
			}
			return uglified.code;
		})
		.then((parserString) => `export default () => ${JSON.stringify(parserString)};`)
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
				assume_function_wrapper: true,
				compilation_level: 'ADVANCED',
				output_wrapper: `function (xspattern) {
	const window = {};
	window.xspattern = xspattern;
	var VERSION='${require('./package.json').version}';
	%output%
	return window;
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
const fontoxpath = (${fontoxpathFunction})(xspattern);
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
