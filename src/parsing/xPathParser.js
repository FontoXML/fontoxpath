import xPathParserRaw from './xPathParser.raw';
var module = /** @type {({xPathParser: {parse:function(!string):?}, SyntaxError:?})} */ ({});
new Function(xPathParserRaw).call(module);

export const parse = module['xPathParser']['parse'];
export const SyntaxError = module['xPathParser']['SyntaxError'];
