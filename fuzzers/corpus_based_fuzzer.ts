import { Fuzzer, FuzzCase } from 'engine';
import { rand, randomLanguage, mutateCharactersInPlace, mutateString } from 'mutators';
import { sync } from 'slimdom-sax-parser';

/**
 * Implements a corpus-based {@link Fuzzer}.
 */
export default class CorpusBasedFuzzer implements Fuzzer {
	private corpus: string[];
	private documentNode: any;

	constructor(corpus: string[]) {
		this.corpus = corpus;
	}

	isExpectedError(error: Error): boolean {
		// Not interested in static errors, we're looking for crashes
		if (error.message.startsWith('XPST')) {
			return true;
		}

		// Not interested in type errors, we're looking for crashes
		if (error.message.startsWith('XPTY')) {
			return true;
		}

		// Not interested in function errors, we're looking for crashes
		if (error.message.startsWith('FORG')) {
			return true;
		}

		// Did not expect error
		return false;
	}

	globalInit(): void {
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

		return new FuzzCase(expression, language, this.documentNode);
	}
}
