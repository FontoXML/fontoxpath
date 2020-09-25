import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import { Document } from 'slimdom';
import { sync } from 'slimdom-sax-parser';
import { domFacade, evaluateXPath } from '../src/index';

let document: Document;

function setup() {
	document = sync(`
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
