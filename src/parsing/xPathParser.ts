import xPathParserRaw from './xPathParser.raw';

const xpathModule: any = {};

// tslint:disable-next-line:function-constructor
new Function(xPathParserRaw()).call(xpathModule);

const xpathParserModule = xpathModule['xPathParser'];
export const parse = xpathParserModule['parse'];
// tslint:disable-next-line:variable-name
export const SyntaxError = xpathParserModule['SyntaxError'];
