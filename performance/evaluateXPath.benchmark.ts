import { Document } from 'slimdom';
import { domFacade, evaluateXPath } from '../src/index';
import runner from './BenchmarkRunner';

let document: Document;

function setup() {
	document = new Document();
}

runner.addBenchmark(
	'evaluateXPath',
	() => {
		evaluateXPath('true()', document, domFacade);
	},
	setup
);
