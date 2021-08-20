import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import { Document, Node } from 'slimdom';
import * as slimdomSaxParser from 'slimdom-sax-parser';
import {
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	ReturnType,
	evaluateXPathToFirstNode,
} from '../src/index';
import jsonMlMapper from '../test/helpers/jsonMlMapper';
import evaluateXPathWithJsCodegen from '../test/specs/jsCodegen/evaluateXPathWithJsCodegen';
import loadFile from './utils/loadFile';

// Comparisons between the js-codegen and expression backend.

let document: Document;
const testDocumentFilename = 'test/assets/QT3TS/app/XMark/XMarkAuction.xml';

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
			evaluateXPathToBoolean(selfPQuery, node);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			const node: Node = document.firstChild;
			evaluateXPathWithJsCodegen(selfPQuery, node, null, ReturnType.BOOLEAN);
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
			evaluateXPathToBoolean(childElementsQuery, document);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathWithJsCodegen(childElementsQuery, document, null, ReturnType.BOOLEAN);
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
			evaluateXPathToBoolean(childElementsQueryWithoutResults, document);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathWithJsCodegen(
				childElementsQueryWithoutResults,
				document,
				null,
				ReturnType.BOOLEAN
			);
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
			evaluateXPathToNodes(childElementsQuery, document);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathWithJsCodegen(childElementsQuery, document, null, ReturnType.NODES);
		},
	}
);

const filterExpressionQuery = 'self::*[parent::chapter]';
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
			evaluateXPathToBoolean(filterExpressionQuery, paragraph);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			const chapter: Node = document.firstChild;
			const paragraph: Node = chapter.firstChild;
			evaluateXPathWithJsCodegen(filterExpressionQuery, paragraph, null, ReturnType.BOOLEAN);
		},
	}
);

const filterWithAndExpressionQuery = 'self::*[parent::chapter and self::element(paragraph)]';
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToBoolean => ${filterWithAndExpressionQuery}`,
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
			evaluateXPathToBoolean(filterWithAndExpressionQuery, paragraph);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			const chapter: Node = document.firstChild;
			const paragraph: Node = chapter.firstChild;
			evaluateXPathWithJsCodegen(
				filterWithAndExpressionQuery,
				paragraph,
				null,
				ReturnType.BOOLEAN
			);
		},
	}
);

const compareWithSelf = 'self::p[@class="peanut"]';
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToFirstNode => ${compareWithSelf}`,
	async () => {
		document = new Document();
		jsonMlMapper.parse(['xml', ['test', { class: 'peanut' }, 'contents']], document);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			evaluateXPathToBoolean(compareWithSelf, document);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathWithJsCodegen(compareWithSelf, document, null, ReturnType.BOOLEAN);
		},
	}
);

const compareWithAttribute = '/xml/test[@id="peanut"]';
benchmarkRunner.compareBenchmarks(
	`evaluateXPathToFirstNode => ${compareWithAttribute}`,
	async () => {
		document = new Document();
		jsonMlMapper.parse(['xml', ['test', { id: 'peanut' }, 'contents']], document);
	},
	undefined,
	{
		name: 'Expression Backend',
		test: () => {
			evaluateXPathToFirstNode(compareWithAttribute, document);
		},
	},
	{
		name: 'JS Codegen Backend',
		test: () => {
			evaluateXPathWithJsCodegen(compareWithAttribute, document, null, ReturnType.FIRST_NODE);
		},
	}
);
