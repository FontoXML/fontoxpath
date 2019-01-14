import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToNodes
} from 'fontoxpath';
import { parse } from 'fontoxpath/parsing/xPathParser';
import { parseAst } from '../demo/parseAst';
import * as chai from 'chai';
import { sync, slimdom } from 'slimdom-sax-parser';

export function buildTestCase (testCase, loadXQuery, loadXQueryX, skippableTests, onActualParsed) {
	it(testCase, async function () {
		let xQuery = await loadXQuery();
		if (!xQuery) {
			skippableTests.push(`${testCase},XQuery script could not be found`);
			throw new Error('XQuery script could not be found!');
		}
		xQuery = xQuery.replace(/\r/g, '');

		let jsonMl;
		try {
			jsonMl = parse(xQuery);
		} catch (err) {
			if (err.location) {
				const start = err.location.start.offset;
				skippableTests.push(`${testCase},Parse error`);
				chai.assert.fail('Parse error', 'No parse error', xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
			} else {
				skippableTests.push(`${testCase},Parser related error`);
				throw err;
			}
			this.skip();
		}

		const actual = new slimdom.Document();
		try {
			actual.appendChild(parseAst(actual, jsonMl));
		} catch (e) {
			skippableTests.push(`${testCase},Parser resulted in invalid JsonML`);
			throw e;
		}
		actual.normalize();
		onActualParsed(actual);

		let expected;
		try {
			const rawFile = (await loadXQueryX()).replace(/\r/g, '');
			expected = sync(rawFile);
		} catch (e) {
			skippableTests.push(`${testCase},Expected XML could not be parsed`);
			throw e;
		}
		const nonSignificantWhitespace = evaluateXPathToNodes(
			'//*/text()[starts-with(., "&#xA;") and normalize-space(.)=""]',
			expected, null, null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE });
		for (const node of nonSignificantWhitespace) {
			node.parentNode.removeChild(node);
		}

		// Compare contents as a quick fail. Use
		// contents because we can assume that
		// the outer element is the same, but it may contain random attributes we should ignore.

		const actualInnerHtml = new slimdom.XMLSerializer().serializeToString(actual.documentElement.firstElementChild);
		const expectedInnerHtml = new slimdom.XMLSerializer().serializeToString(expected.documentElement.firstElementChild);
		if (actualInnerHtml.replace(/></g, '>\n<') === expectedInnerHtml.replace(/></g, '>\n<')) {
			return;
		}

		if (!evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, { expected, actual })) {
			try {
				chai.assert.equal(
					new slimdom.XMLSerializer().serializeToString(actual.documentElement).replace(/></g, '>\n<'),
					new slimdom.XMLSerializer().serializeToString(expected.documentElement).replace(/></g, '>\n<'),
					'Expected the XML to be deep-equal');
			} catch (e) {
				skippableTests.push(`${testCase},result was not equal`);

				throw e;
			}
		}
	});
}
