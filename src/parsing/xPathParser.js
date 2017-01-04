import xPathParserRaw from './xPathParser.raw.js';
var module = /** @type {({xPathParser: {parse:function(!string):!Array<*>}, SyntaxError:Error})} */ ({});
new Function(xPathParserRaw).call(module);

export default {
	parse: module['xPathParser']['parse'],
	SyntaxError: module['xPathParser']['SyntaxError']
};
