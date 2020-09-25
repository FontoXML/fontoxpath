import * as chai from 'chai';
import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	Language,
	parseScript,
} from 'fontoxpath';
import { slimdom, sync } from 'slimdom-sax-parser';

function removeInsignificantWhitespace(root) {
	const nonSignificantWhitespace = evaluateXPathToNodes<slimdom.Node>(
		'//*/text()',
		root,
		null,
		null,
		{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
	);
	for (const node of nonSignificantWhitespace) {
		node.data = node.data.trim();
		if (node.data.length === 0) {
			node.parentNode.removeChild(node);
		}
	}
}

export function buildTestCase(
	testCase: string,
	loadXQuery: () => Promise<string>,
	loadXQueryX: () => Promise<string>,
	skippableTests: string[],
	onActualParsed: (actual: any) => void
): void {
	it(testCase, async function () {
		let xQuery = await loadXQuery();
		if (!xQuery) {
			skippableTests.push(`${testCase},XQuery script could not be found`);
			throw new Error('XQuery script could not be found!');
		}
		xQuery = xQuery.replace(/\r/g, '');
		let astElement: slimdom.Element;
		try {
			astElement = parseScript(
				xQuery,
				{ language: Language.XQUERY_UPDATE_3_1_LANGUAGE },
				new slimdom.Document()
			);
		} catch (err) {
			if (err.message.includes('XPST0003')) {
				skippableTests.push(`${testCase},Parse error`);
				chai.assert.fail('Parse error', 'No parse error');
			} else {
				skippableTests.push(`${testCase},Parser related error, ${err}`);
				throw err;
			}
			this.skip();
		}

		const actual = new slimdom.Document();
		actual.appendChild(astElement);
		actual.normalize();
		onActualParsed(actual);

		let expected;
		try {
			const rawFile = (await loadXQueryX()).replace(/\r/g, '');
			expected = sync(rawFile);
			expected.normalize();
		} catch (e) {
			skippableTests.push(`${testCase},Expected XML could not be parsed`);
			throw e;
		}

		removeInsignificantWhitespace(actual);
		removeInsignificantWhitespace(expected);
		// Compare contents as a quick fail. Use
		// contents because we can assume that
		// the outer element is the same, but it may contain random attributes we should ignore.

		const actualInnerHtml = new slimdom.XMLSerializer().serializeToString(
			actual.documentElement.firstElementChild
		);
		const expectedInnerHtml = new slimdom.XMLSerializer().serializeToString(
			expected.documentElement.firstElementChild
		);
		if (actualInnerHtml.replace(/></g, '><') === expectedInnerHtml.replace(/></g, '><')) {
			return;
		}

		if (
			!evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, {
				expected,
				actual,
			})
		) {
			try {
				chai.assert.equal(
					new slimdom.XMLSerializer()
						.serializeToString(actual.documentElement)
						.replace(/></g, '>\n<'),
					new slimdom.XMLSerializer()
						.serializeToString(expected.documentElement)
						.replace(/></g, '>\n<'),
					'Expected the XML to be deep-equal'
				);
			} catch (e) {
				skippableTests.push(`${testCase},result was not equal`);

				throw e;
			}
		}
	});
}
