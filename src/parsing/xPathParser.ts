import xPathParserRaw from './xPathParser.raw';
const module = {};
new Function(xPathParserRaw()).call(module);

const xpathParserModule = module['xPathParser'];
export const parse =  (xpathParserModule['parse']);
export const SyntaxError =  (xpathParserModule['SyntaxError']);
