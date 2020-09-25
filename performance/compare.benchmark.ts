import { Document, Node } from 'slimdom';
import * as slimdomSaxParser from 'slimdom-sax-parser';
import {
	domFacade,
	evaluateXPath,
	evaluateXPathToFirstNode,
	evaluateXPathToNumber,
} from '../src/index';

import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import jsonMlMapper from '../test/helpers/jsonMlMapper';
import loadFile from './utils/loadFile';

const testDocumentFilename = 'test/assets/QT3TS/app/XMark/XMarkAuction.xml';

let document: Document;

benchmarkRunner.compareBenchmarks(
	'simple traversal to first descendant',
	() => {
		document = new Document();
		jsonMlMapper.parse(['r', ['a', ['b', ['c']]]], document);
	},
	undefined,
	{
		name: 'xpath',
		test: () => {
			evaluateXPathToFirstNode('descendant::c', document, domFacade);
		},
	},
	{
		name: 'manual',
		test: () => {
			let node: Node = document;
			while (node) {
				if (node.nodeName === 'c') {
					break;
				}
				node = node.firstChild;
			}
		},
	}
);

benchmarkRunner.compareBenchmarks(
	'count 3190 text elements',
	async () => {
		const content = await loadFile(testDocumentFilename);
		document = slimdomSaxParser.sync(content);
	},
	undefined,
	{
		name: 'xpath',
		test: () => {
			evaluateXPathToNumber('count(//text)', document, domFacade);
		},
	},
	{
		name: 'manual',
		test: () => {
			function countParagraphs(node: Node): number {
				let count = 0;
				if (node.nodeName === 'text') {
					count++;
				}
				node.childNodes.forEach((child) => {
					count += countParagraphs(child);
				});
				return count;
			}

			countParagraphs(document);
		},
	}
);

benchmarkRunner.compareBenchmarks(
	'XMark-Q14, this is one of the more expensive tests in the qt3ts',
	async () => {
		const content = await loadFile(testDocumentFilename);
		document = slimdomSaxParser.sync(content);
	},
	undefined,
	{
		name: 'xpath',
		test: () => {
			evaluateXPathToFirstNode(
				`(: Purpose: Return the names of all items whose description contains the word ;'gold'. :)
				<XMark-result-Q14> {
					let $auction := (/) return
					for $i in $auction/site//item
					where contains(string(exactly-one($i/description)), "gold")
					return $i/name/text() }
				</XMark-result-Q14>`,
				document,
				domFacade,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			);
		},
	},
	{
		name: 'manual',
		test: () => {
			function getDescendantItems(node: Node, nameTest: string): Node[] {
				const results: Node[] = [];
				node.childNodes.forEach((child) => {
					if (child.nodeName === nameTest) {
						results.push(child);
					}
					results.push(...getDescendantItems(child, nameTest));
				});
				return results;
			}

			const auction = document;
			const nameContents = [];
			auction.childNodes.forEach((child) => {
				if (child.nodeName !== 'site') {
					return;
				}

				const items = getDescendantItems(child, 'item');
				for (const i of items) {
					const descriptionElements = [];
					i.childNodes.forEach((c) => {
						if (c.nodeName === 'description') {
							descriptionElements.push(c);
						}
					});

					if (descriptionElements.length !== 1) {
						throw new Error('FORG0005');
					}

					if (descriptionElements[0].textContent.includes('gold')) {
						i.childNodes.forEach((c) => {
							if (c.nodeName === 'name') {
								nameContents.push(c.textContent);
							}
						});
					}
				}
			});

			const textNode = document.createTextNode(nameContents.join(''));

			const res = document.createElement('XMark-result-Q14');
			res.append(textNode);
		},
	}
);
