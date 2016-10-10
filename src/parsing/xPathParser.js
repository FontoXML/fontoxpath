define([
	'text!./xPathParser.raw.js'
], function(
	xPathParserRaw
) {
	'use strict';

	var module = {};
	new Function(xPathParserRaw).call(module);
	return module.xPathParser;
});
