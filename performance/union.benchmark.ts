import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import { Document, parseXmlDocument } from 'slimdom';
import { domFacade, evaluateXPath } from '../src/index';

let document: Document;

function setup() {
	document = parseXmlDocument(`
    <xml>
        <title>xpath.playground.fontoxml.com</title>
        <summary>This is a learning tool for XML, XPath and XQuery.</summary>
        <tips>
		${new Array(1000).fill('<tip>with some content</tip>')}
        </tips>
    </xml>`);
}

benchmarkRunner.addBenchmark(
	'union',
	() => {
		evaluateXPath('//tip | reverse(//tip)', document, domFacade);
	},
	setup
);
