// Basic XPath expression fuzzer inspired by @gamozolabs
//
// This script implements a simple fuzzer which uses a `corpus` of valid XPath expressions
// which it mutates using `mutateCharactersInPlace` and `mutateString` and then evaluates to
// test the parser and the expression engine for bugs.
//
// The fuzzer deduplicates errors thrown by their unique stack trace and filters out
// expected XPath errors which are properly generated by the engine to reduce noise.
//
// The fuzzer reports its progress, including the number of unique crashes and the number
// of fuzz cases per second (`fcps`) every 1000 cases.
//
// # Running the fuzzer
//
// ```
// npm run fuzzer
// ```
//
// # Ideas/Improvements
//
// * Component library + mutation strategy
// * Clean up the corpus
// * Corpus feedback
//
// # References
//
// * [Fuzz Week](https://www.youtube.com/playlist?list=PLSkhUfcCXvqHsOy2VUxuoAf5m_7c8RqvO)
// * [YouTube](https://www.youtube.com/user/gamozolabs)
// * [Twitch](https://www.twitch.tv/gamozo)
//

import CorpusBasedFuzzer, { ICorpusLoader } from 'corpus_based_fuzzer';
import Engine from 'engine';
import isoCorpusLoader from 'iso_corpus';
import xpath31FunctionCatalogCorpusLoader from 'xpath-31-function-catalog-corpus';

// Select the corpus to use
const corpora: { [key: string]: ICorpusLoader } = {
	[isoCorpusLoader.name]: isoCorpusLoader,
	[xpath31FunctionCatalogCorpusLoader.name]: xpath31FunctionCatalogCorpusLoader,
};
const corpusName = process.argv.slice(2)[0];
const corpusLoader = corpora[corpusName];
if (corpusLoader !== null) {
	// Bootstrap
	const fuzzer = new CorpusBasedFuzzer(corpusLoader);
	const engine = new Engine<CorpusBasedFuzzer>();
	engine.run(fuzzer, __filename);
} else {
	const options = Object.keys(corpora)
		.map((name) => `npm run fuzzer ${name}`)
		.join('\n');
	process.stdout.write(`Specify a valid corpus to use:\n${options}\n`);
}
