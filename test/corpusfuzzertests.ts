import * as chai from 'chai';
import { evaluateXPath } from 'fontoxpath';
import * as slimdom from 'slimdom';
import { sync } from 'slimdom-sax-parser';
import CorpusBasedFuzzer from '../fuzzers/corpus_based_fuzzer';
import { FuzzCase } from '../fuzzers/fuzzer';
import ISO_CORPUS from '../fuzzers/iso_corpus';
import { BACKEND, randomBackend, randomLanguage } from '../fuzzers/mutators';

describe('Corpus Fuzzer tests', () => {
	const corpus = ISO_CORPUS;
	const fuzzer = new CorpusBasedFuzzer(corpus);
	fuzzer.globalInit();

	const languages = [
		evaluateXPath.XPATH_3_1_LANGUAGE,
		evaluateXPath.XQUERY_3_1_LANGUAGE,
		evaluateXPath.XQUERY_UPDATE_3_1_LANGUAGE,
	];

	const backends = [BACKEND.EXPRESSION, BACKEND.JS_CODEGEN];

	let documentNode: slimdom.Document;
	beforeEach(() => {
		documentNode = sync(
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
	});

	it('Manually create random base ISO corpus fuzz cases and run them', () => {
		for (const selector of corpus.get()) {
			const language = randomLanguage();
			const backend = randomBackend();
			const fuzzCase = new FuzzCase(selector, language, backend, documentNode);

			try {
				fuzzCase.run();
			} catch (error) {
				if (!fuzzCase.isExpectedError(error)) {
					chai.assert.fail(
						`Fuzz case was not expecting an error for selector \"${selector}\", but it failed nonetheless.`
					);
				}
			}
		}
	});

	languages.forEach((language) => {
		backends.forEach((backend) => {
			it(`All ISO corpus fuzz cases with language: ${language} and backend: ${backend}`, () => {
				for (const selector of corpus.get()) {
					const fuzzCase = new FuzzCase(selector, language, backend, documentNode);
					try {
						fuzzCase.run();
					} catch (error) {
						if (!fuzzCase.isExpectedError(error)) {
							chai.assert.fail(
								`Fuzz case was not expecting an error for selector \"${fuzzCase.selector}\", but it failed nonetheless.`
							);
						}
					}
				}
			});
		});
	});
});
