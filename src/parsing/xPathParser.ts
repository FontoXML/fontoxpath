import xPathParserRaw from './xPathParser.raw';

const xpathModule: any = {};

new Function(xPathParserRaw()).call(xpathModule);

const xpathParserModule = xpathModule['xPathParser'];
export const parse =  (xpathParserModule['parse']);
export const SyntaxError =  (xpathParserModule['SyntaxError']);
