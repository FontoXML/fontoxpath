import { Document, Node } from 'slimdom';
import * as slimdomSaxParser from 'slimdom-sax-parser';
import { evaluateXPathToNodes, evaluateXPathToBoolean } from '../src/index';

import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import loadFile from './utils/loadFile';
import jsonMlMapper from '../test/helpers/jsonMlMapper';

const testDocumentFilename = 'test/assets/QT3TS/app/XMark/XMarkAuction.xml';

// Comparisons between the js-codegen and expression backend.

let document: Document;

const selfPQuery = 'self::p';
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToBoolean (true) => ${selfPQuery}`,
	async () => {
		document = new Document();
		jsonMlMapper.parse(['p', 'Hello, world!'], document);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			const node: Node = document.firstChild;
			evaluateXPathToBoolean(selfPQuery, node, null, null, {
				backend: 'expression',
			});
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			const node: Node = document.firstChild;
			evaluateXPathToBoolean(selfPQuery, node, null, null, {
				backend: 'js-codegen',
			});
		},
	}
);

const childElementsQuery = '/site/regions/europe';
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToBoolean (true) => ${childElementsQuery}`,
	async () => {
		const content = await loadFile(testDocumentFilename);
		document = slimdomSaxParser.sync(content);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			evaluateXPathToBoolean(childElementsQuery, document, null, null, {
				backend: 'expression',
			});
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathToBoolean(childElementsQuery, document, null, null, {
				backend: 'js-codegen',
			});
		},
	}
);

const childElementsQueryWithoutResults = '/site/regions/does-not-exist';
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToBoolean (false) => ${childElementsQueryWithoutResults}`,
	async () => {
		const content = await loadFile(testDocumentFilename);
		document = slimdomSaxParser.sync(content);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			evaluateXPathToBoolean(childElementsQueryWithoutResults, document, null, null, {
				backend: 'expression',
			});
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathToBoolean(childElementsQueryWithoutResults, document, null, null, {
				backend: 'js-codegen',
			});
		},
	}
);

benchmarkRunner.compareBenchmarks(
	`evaluateXPathToNodes => ${childElementsQuery}`,
	async () => {
		const content = await loadFile(testDocumentFilename);
		document = slimdomSaxParser.sync(content);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			evaluateXPathToNodes(childElementsQuery, document, null, null, {
				backend: 'expression',
			});
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathToNodes(childElementsQuery, document, null, null, {
				backend: 'js-codegen',
			});
		},
	}
);

const filterExpressionQuery = "self::*[parent::chapter]"
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToBoolean => ${filterExpressionQuery}`,
	async () => {
		document = new Document();
		jsonMlMapper.parse(['chapter', ['paragraph', 'Hello, world!']], document);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			const chapter: Node = document.firstChild;
			const paragraph: Node = chapter.firstChild;
			evaluateXPathToBoolean(filterExpressionQuery, paragraph, null, null, {
				backend: 'expression',
			});
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			const chapter: Node = document.firstChild;
			const paragraph: Node = chapter.firstChild;
			evaluateXPathToBoolean(filterExpressionQuery, paragraph, null, null, {
				backend: 'js-codegen',
			});
		},
	}
);
