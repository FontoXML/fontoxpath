const peg = require('pegjs');
const fs = require('fs');
const asPromise = require('fontoxml-node-promise-utils').asPromise;
const Compiler = new require('google-closure-compiler').compiler;
const UglifyJS = require('uglify-js');

asPromise(fs.readFile, './src/parsing/xpath.pegjs', 'utf8')
	.then(pegJsString => peg.generate(pegJsString, {
		cache: true,
		output: 'source',
		format: 'globals',
		exportVar: 'xPathParser'
	}))
	.then(parserString => UglifyJS.minify([parserString], { fromString: true }).code)
	.then(parserString => `export default ${JSON.stringify(parserString)};`)
	.then(parserString => asPromise(fs.writeFile, './src/parsing/xPathParser.raw.js', parserString))
	.then(() => {
		const compiler = new Compiler({
				//	assume_function_wrapper: true,
				language_in: 'ES6',
				language_out: 'ES5',
				  create_source_map: './dist/selectors.js.map',
				compilation_level: 'ADVANCED',
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
        root.returnExports = factory();
    }
}(this, function () {
	%output%
}));
//# sourceMappingURL=./selectors.js.map`,
				js_output_file: './dist/selectors.js',
				js: './src/**.js'
			});
		return new Promise((resolve) => compiler.run(resolve));
	})
	.then((code, str, error) => { console.log(code, str, error); })
	.catch(console.error.bind(console));
