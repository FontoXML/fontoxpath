import xPathParserRaw from './xPathParser.raw';
var module = /** @type {({xPathParser: {parse:function(!string):?}, SyntaxError:?})} */ ({});
new Function(xPathParserRaw()).call(module);

const xpathParserModule = module['xPathParser'];
export const parse = xpathParserModule['parse'];
export const SyntaxError = xpathParserModule['SyntaxError'];
