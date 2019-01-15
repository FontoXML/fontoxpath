/* eslint-disable no-console */
const peg = require('pegjs');
const fs = require('fs-extra');
const Compiler = new require('google-closure-compiler').compiler;
const UglifyJS = require('uglify-js');

const path = require('path');

const { spawn } = require('child_process');

const { Extractor } = require('@microsoft/api-extractor');

const skipParserBuild = process.env.npm_config_skip_parser;
const skipClosureBuild = process.env.npm_config_skip_closure;
const doDebugBuild = process.env.npm_config_debug_closure;
const reportUnknownTypes = process.env.npm_config_report_unknown_types;

const TEMP_BUILD_DIR = 'dist/tmp';

function doPegJsBuild() {
	return new Promise((resolve, reject) =>
		fs.readFile('./src/parsing/xpath.pegjs', 'utf8', (err, file) =>
			err ? reject(err) : resolve(file)
		)
	)
		.then(pegJsString =>
			peg.generate(pegJsString, {
				cache: true,
				output: 'source',
				format: 'globals',
				exportVar: 'xPathParser'
			})
		)
		.then(parserString => {
			const uglified = UglifyJS.minify(parserString);
			if (uglified.error) {
				fs.writeFileSync('./src/parsing/xPathParser.raw.ts', parserString);
				throw uglified.error;
			}
			return uglified.code;
		})
		.then(parserString => `export default () => ${JSON.stringify(parserString)};`)
		.then(parserString =>
			Promise.all([
				new Promise((resolve, reject) =>
					fs.writeFile('./src/parsing/xPathParser.raw.ts', parserString, err =>
						err ? reject(err) : resolve()
					)
				)
			])
		)
		.then(() => console.info('Parser generator done'));
}

function doTsickleBuild() {
	return fs.ensureDir(TEMP_BUILD_DIR).then(
		() =>
			new Promise((resolve, reject) => {
				const tsickleProcess = spawn('node', [
					'./node_modules/tsickle/src/main.js',
					'--',
					'--outDir',
					path.join(__dirname, TEMP_BUILD_DIR)
				]);

				tsickleProcess.stderr.on('data', data => {
					console.error(data.toString());
				});
				tsickleProcess.stdout.on('data', data => {
					console.log(data.toString());
				});

				tsickleProcess.on('close', code => {
					if (code !== 0) {
						// We should reject here but tsickle seems to
						// always output an error code because we still
						// have some closure typings in out typescript
						// code...
						reject(`tsickle exited with code: ${code}`);
						return;
					}

					resolve();
				});
			})
	);
}

const apiExtractorConfig = {
	apiReviewFile: {
		enabled: false
	},
	compiler: {
		configType: 'tsconfig',
		rootFolder: process.cwd()
	},
	project: {
		entryPointSourceFile: 'dist/tmp/index.d.ts'
	},
	dtsRollup: {
		enabled: true,
		trimming: false
	}
};

function outputDeclarations() {
	console.log('Starting generation of typings');
	const extractor = new Extractor(apiExtractorConfig, {});
	extractor.analyzeProject();
	console.log('Typings generated');
}

function doExpressionsBuild() {
	return new Promise((resolve, reject) => {
		console.log('Starting closure compiler build');
		new Compiler({
			assume_function_wrapper: true,
			debug: !!doDebugBuild,
			language_in: 'stable',
			rewrite_polyfills: false,
			generate_exports: true,
			language_out: 'ES5_STRICT',
			create_source_map: './dist/fontoxpath.js.map',
			source_map_location_mapping: `${TEMP_BUILD_DIR}|../${TEMP_BUILD_DIR}`,
			jscomp_warning: reportUnknownTypes ? ['reportUnknownTypes'] : [],
			jscomp_error: [
				'accessControls',
				'checkDebuggerStatement',
				'checkRegExp',
				'checkTypes',
				'checkVars',
				'const',
				'constantProperty',
				'deprecated',
				'deprecatedAnnotations',
				'duplicate',
				'missingProperties',
				'missingReturn',
				'newCheckTypes',
				'typeInvalidation',
				'undefinedVars',
				'uselessCode'
			],
			warning_level: 'VERBOSE',
			compilation_level: 'ADVANCED',
			externs: [],
			module_resolution: 'NODE',
			dependency_mode: 'STRICT',
			output_wrapper: `
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.fontoxpath = factory();
	}
})(this, function () {
	var window = {};
	var VERSION='${require('./package.json').version}';
	%output%
	return window;
});
//# sourceMappingURL=./fontoxpath.js.map
`,
			js_output_file: './dist/fontoxpath.js',
			entry_point: `./${TEMP_BUILD_DIR}/index.js`,
			js: `"${TEMP_BUILD_DIR}/**.js"`
		}).run((exitCode, stdOut, stdErr) => {
			console.log('done');
			if (exitCode !== 0) {
				reject(stdErr);
				return;
			}
			resolve(stdOut + stdErr);
		});
	}).then(stdOut => {
		console.info(stdOut);
		console.info('Closure build done');
	});
}

var chain = Promise.resolve();
if (!skipParserBuild) {
	chain = chain.then(doPegJsBuild);
}

if (!skipClosureBuild) {
	chain = chain.then(doTsickleBuild);
	chain = chain.then(outputDeclarations);
	chain = chain.then(doExpressionsBuild);
}

chain.catch(err => {
	console.error('Err: ' + err);
	process.exit(1);
});
