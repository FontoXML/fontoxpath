import { IAST } from './astHelper';
import xPathParserRaw from './xPathParser_raw';

const xpathModule: any = {};

xPathParserRaw(xpathModule);

const xpathParserModule = xpathModule.xPathParser;
export const parse = xpathParserModule.parse as (
	source: string,
	params: { outputDebugInfo: boolean; xquery: boolean }
) => IAST;

export const SyntaxError = xpathParserModule.SyntaxError;
