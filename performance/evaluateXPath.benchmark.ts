import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import { Document } from 'slimdom';
import { domFacade, evaluateXPath } from '../src/index';

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
