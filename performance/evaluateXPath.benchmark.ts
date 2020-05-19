import { Document } from 'slimdom';
import { domFacade, evaluateXPath } from '../src/index';
import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';

let document: Document;

function setup() {
	document = new Document();
}

benchmarkRunner.addBenchmark(
	'evaluateXPath',
	() => {
		evaluateXPath('true()', document, domFacade);
	},
	setup
);
