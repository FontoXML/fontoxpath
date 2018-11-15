import xPathParserRaw from './xPathParser.raw';
const module = {};
new Function(xPathParserRaw()).call(module);

const xpathParserModule = module['xPathParser'];
export const parse = /** @type {function(!string, !{xquery: boolean}):!Array<*>} */ (xpathParserModule['parse']);
export const SyntaxError = /** @type {Error} */ (xpathParserModule['SyntaxError']);
