import { Document } from 'slimdom';
import { domFacade, evaluateXPath } from '../src/index';
import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import { sync } from 'slimdom-sax-parser';

let document: Document;

function setup() {
    document = sync(`
    <xml>
        <title>xpath.playground.fontoxml.com</title>
        <summary>This is a learning tool for XML, XPath and XQuery.</summary>
        <tips>
            <tip id='edit'>You can edit everything on the left</tip>
            <tip id='examples'>You can access more examples from a menu in the top right</tip>
            <tip id='permalink'>Another button there lets you share your test using an URL</tip>
        </tips>
    </xml>`)
}

benchmarkRunner.addBenchmark(
	'union',
	() => {
		evaluateXPath('/xml/title | /xml/tips/tip[id=\'permalink\'] | /xml/summary', document, domFacade);
	},
	setup
);
