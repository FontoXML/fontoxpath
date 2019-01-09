/* eslint-disable no-console */
const peg = require('pegjs');
const fs = require('fs-extra');
const Compiler = new require('google-closure-compiler').compiler;
const UglifyJS = require('uglify-js');

const path = require('path');

const { spawn } = require('child_process');

const skipParserBuild = process.env.npm_config_skip_parser;
const skipClosureBuild = process.env.npm_config_skip_closure;
const doDebugBuild = process.env.npm_config_debug;
const reportUnknownTypes = process.env.npm_config_report_unknown_types;

function doPegJsBuild () {
	return new Promise((resolve, reject) => fs.readFile('./src/parsing/xpath.pegjs', 'utf8', (err, file) => err ? reject(err) : resolve(file)))
		.then(pegJsString => peg.generate(pegJsString, {
			cache: true,
			output: 'source',
			format: 'globals',
			exportVar: 'xPathParser'
		}))
		.then(parserString => {
			const uglified = UglifyJS.minify(parserString);
			if (uglified.error) {
				fs.writeFileSync('./src/parsing/xPathParser.raw.ts', parserString);
				throw uglified.error;
			}
			return uglified.code;
		})
		.then(parserString => `export default () => ${JSON.stringify(parserString)};`)
		.then(parserString => Promise.all([
			new Promise((resolve, reject) =>
						fs.writeFile('./src/parsing/xPathParser.raw.ts', parserString, (err) => err ? reject(err) : resolve()))
		]))
		.then(() => console.info('Parser generator done'));
}

function doTsickleBuild () {
	return fs.ensureDir('dist/tmp')
		.then(() => new Promise((resolve, reject) => {
			const tsickleProcess = spawn(
				'node',
				[
					'./node_modules/tsickle/src/main.js',
					'--',
					'--outDir',
					path.join(__dirname, 'dist/tmp')
				]
			);

			tsickleProcess.stderr.on('data', data => {
				console.error(data.toString());
			});
			tsickleProcess.stdout.on('data', data => {
				console.log(data.toString());
			});

			tsickleProcess.on('close', code => {
				if (code !== 0) {
					console.log('tsickle exited with code: ' + code);
					// We should reject here but tsickle seems to
					// always output an error code because we still
					// have some closure typings in out typescript
					// code...  reject();
					resolve();
					return;
				}

				resolve();
			});
		}));
}

function doExpressionsBuild () {
	return new Promise((resolve, reject) => {
		new Compiler({
			assume_function_wrapper: true,
			debug: !!doDebugBuild,
			language_in: 'stable',
			generate_exports: true,
			language_out: 'ES5_strict',
			create_source_map: './dist/fontoxpath.js.map',
			source_map_location_mapping: '"dist/tmp|../dist/tmp"',
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
			externs: [
			],
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
			entry_point: './dist/tmp/index.js',
			js: '"built/**.js"'
		})
			.run((exitCode, stdOut, stdErr) => {
				if (exitCode !== 0) {
					reject(stdErr);
					return;
				}
				resolve(stdOut + stdErr);
			});
	})
		.then((stdOut) => {
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
	chain = chain.then(doExpressionsBuild);
}

chain.catch((err) => {
	console.error(err);
	process.exit(1);
});
