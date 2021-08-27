import {
	compileXPathToJavaScript,
	evaluateXPath,
	executeJavaScriptCompiledXPath,
} from 'fontoxpath';
import { BACKEND } from './mutators';

/**
 * Known XPath/XQuery error codes which are not treated as a crash.
 *
 * https://www.w3.org/2005/xqt-errors/
 */
const EXPECTED_ERROR_PREFIXES = [
	'FOAP',
	'FOAR',
	'FOAY',
	'FOCA',
	'FOCH',
	'FODC',
	'FODF',
	'FODT',
	'FOER',
	'FOFD',
	'FOJS',
	'FONS',
	'FOQM',
	'FORG',
	'FORX',
	'FOTY',
	'FOUT',
	'FOXT',
	'XPDY',
	'XPST',
	'XPTY',
	'XQDY',
	'XQST',
	'XQTY',
];

/**
 * Interface for fuzzer which are run by the {@link Engine}.
 */
export interface IFuzzer {
	globalInit(): void;
	prepareCase(): FuzzCase;
}

/**
 * A single executable fuzz case.
 */
export class FuzzCase {
	backend: BACKEND;
	contextItem?: any | null;
	language: string;
	selector: string;

	constructor(selector: string, language: string, backend: BACKEND, contextItem?: any | null) {
		this.selector = selector;
		this.language = language;
		this.backend = backend;
		this.contextItem = contextItem;
	}

	/**
	 * Tests whether the given error is expected,
	 * meaning the error should not be considered a crash.
	 *
	 * @param error - The {@link Error} which to test.
	 * @returns Returns `true` when expected.
	 */
	isExpectedError(error: Error): boolean {
		return EXPECTED_ERROR_PREFIXES.some((prefix) => error.message.startsWith(prefix));
	}

	/**
	 * Run this fuzz case.
	 */
	run(): void {
		const options = {
			disableCache: true,
			language: this.language,
		};

		// Execute the expression using the given backend.
		if (this.backend === BACKEND.EXPRESSION) {
			evaluateXPath(this.selector, this.contextItem, null, null, null, options);
		} else if (this.backend === BACKEND.JS_CODEGEN) {
			const compiledXPathResult = compileXPathToJavaScript(
				this.selector,
				evaluateXPath.BOOLEAN_TYPE,
				options
			);
			if (compiledXPathResult.isAstAccepted === true) {
				// tslint:disable-next-line
				const evalFunction = new Function(compiledXPathResult.code);
				executeJavaScriptCompiledXPath(evalFunction, this.contextItem);
			}
		}
	}
}
