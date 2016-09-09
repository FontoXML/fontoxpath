define([
	'text!./xPathParser.raw.js',
	'./compileAstToSelector'
], function (
	xPathParserRaw,
	compileAstToSelector
) {
	'use strict';

	// Webworkers need a function string
	var compileFunction = [
			xPathParserRaw,
			'',
			'self.onmessage = function (event) {',
			'	var ast;',
			'	try {',
			'		ast = self.xPathParser.parse(event.data.xPath);',
			'	} catch (error) {',
			'		self.postMessage({',
			'			success: false,',
			'			key: event.data.key,',
			'			error: error',
			'		});',
			'		return;',
			'	}',

			'	self.postMessage({',
			'		success: true,',
			'		key: event.data.key,',
			'		ast: ast',
			'	});',
			'}'].join('\n');


	var blob = new Blob([compileFunction]),
		worker = new Worker(URL.createObjectURL(blob));

	var waitingTaskCallbackByTaskKey = Object.create(null);

	worker.onmessage = function (event) {
		waitingTaskCallbackByTaskKey[event.data.key](event.data);
	};

	worker.onerror = function (event) {
		console.error(event);
	};

	/**
	 * Parse an XPath string to a selector.
	 * Only single step paths can be compiled
	 *
	 * @param  {string}  xPathString      The string to parse
	 */
	return function createSelectorFromXPathAsync (xPathString) {
		return new Promise(function (resolve, reject) {
			waitingTaskCallbackByTaskKey[xPathString] = function (result) {
				if (!result.success) {
					reject(new Error('Unable to parse XPath: ' + xPathString + '.\n' +  result.error));
					return;
				}
				delete waitingTaskCallbackByTaskKey[xPathString];
				var selector = compileAstToSelector(result.ast);
				resolve(selector);
			};

			worker.postMessage({
				key: xPathString,
				xPath: xPathString
			});
		});
	};
});
