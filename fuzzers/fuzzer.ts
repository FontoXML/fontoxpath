import {
	evaluateXPath,
	compileXPathToJavaScript,
	executeJavaScriptCompiledXPath,
} from 'fontoxpath';

import { Backend } from 'mutators';

/**
 * Interface for fuzzer which are run by the {@link Engine}.
 */
export interface IFuzzer {
	globalInit(): void;
	isExpectedError(error: Error): boolean;
	prepareCase(): FuzzCase;
}

/**
 * A single executable fuzz case.
 */
export class FuzzCase {
	contextItem?: any | null;
	language: string;
	selector: string;
	backend: Backend;

	constructor(selector: string, language: string, backend: Backend, contextItem?: any | null) {
		this.selector = selector;
		this.language = language;
		this.backend = backend;
		this.contextItem = contextItem;
	}

	run(): void {
		const options = {
			disableCache: true,
			language: this.language,
		};

		// Execute the expression using the given backend.
		if (this.backend === 'expression') {
			evaluateXPath(this.selector, this.contextItem, null, null, null, options);
		} else if (this.backend === 'js-codegen') {
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
