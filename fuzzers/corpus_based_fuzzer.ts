import { sync } from 'slimdom-sax-parser';
import { FuzzCase, IFuzzer } from './fuzzer';
import {
	mutateCharactersInPlace,
	mutateString,
	rand,
	randomBackend,
	randomLanguage,
} from './mutators';

/**
 * Defines the interface for loading a fuzzing corpus.
 */
export interface ICorpusLoader {
	name: string;
	get(): string[];
}

/**
 * Implements a corpus-based {@link Fuzzer}.
 */
export default class CorpusBasedFuzzer implements IFuzzer {
	private corpus: string[];
	private documentNode: any;
	private loader: ICorpusLoader;

	constructor(loader: ICorpusLoader) {
		this.loader = loader;
	}

	globalInit(): void {
		this.corpus = this.loader.get();
		this.documentNode = sync(
			'<xml> \
			<title>xpath.playground.fontoxml.com</title> \
			<summary>This is a learning tool for XML, XPath and XQuery.</summary> \
			<tips> \
			<tip id="edit">You can edit everything on the left</tip> \
			<tip id="examples">You can access more examples from a menu in the top right</tip> \
			<tip id="permalink">Another button there lets you share your test using an URL</tip> \
			</tips> \
		</xml>'
		);
	}

	prepareCase(): FuzzCase {
		// Select an expression from the corpus
		let expression = this.corpus[rand(this.corpus.length)];

		// Mutate the input using a simple character mutation
		expression = mutateString(expression);
		expression = mutateCharactersInPlace(expression);

		// Select a random language
		const language = randomLanguage();

		const backend = randomBackend();

		return new FuzzCase(expression, language, backend, this.documentNode);
	}
}
