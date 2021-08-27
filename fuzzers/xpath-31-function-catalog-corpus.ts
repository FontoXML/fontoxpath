import { ICorpusLoader } from 'corpus_based_fuzzer';
import { evaluateXPathToStrings } from 'fontoxpath';
import fs from 'fs';
import { sync } from 'slimdom-sax-parser';

export default new (class XPath31FunctionCatalog implements ICorpusLoader {
	name: string = 'xpath-31-function-catalog';

	get(): string[] {
		// Load corpus from the W3C XPath standard
		const specDoc = sync(fs.readFileSync('./fuzzers/xpath-31-function-catalog.xml', 'utf8'));
		return evaluateXPathToStrings(
			'//Q{http://www.w3.org/xpath-functions/spec/namespace}expression/text()',
			specDoc
		);
	}
})();
