import xPathParserRaw from './xPathParser.raw.js';
var module = {
	};
new Function(xPathParserRaw).call(module);

/**
 * @type {({xPathParser: {parse:function(!string):!Array<*>}, SyntaxError:Error})}
 */
export default {
	parse: module['xPathParser']['parse'],
	SyntaxError: module['xPathParser']['SyntaxError']
};
