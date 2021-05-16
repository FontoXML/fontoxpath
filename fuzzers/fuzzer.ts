import { evaluateXPath } from 'fontoxpath';

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

	constructor(selector: string, language: string, contextItem?: any | null) {
		this.selector = selector;
		this.language = language;
		this.contextItem = contextItem;
	}

	run(): void {
		// Execute the expression
		evaluateXPath(this.selector, this.contextItem, null, null, null, {
			disableCache: true,
			language: this.language
		});
	}
}
