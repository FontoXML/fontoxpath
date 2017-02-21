const {
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	evaluateXPathToString,
	evaluateXPathToNumber,
	evaluateXPathToFirstNode
} = require('fontoxpath');

const context = require.context('text!assets', true, /\.xml$/);
const parser = new DOMParser();

function getAsserterForTest (testCase) {
	const expectedResultNode = evaluateXPathToFirstNode('./result/*', testCase);
	switch (expectedResultNode.localName) {
		case 'error':
			const errorCode = evaluateXPathToString('@code', expectedResultNode);
			return (xpath, contextNode) =>
				chai.assert.throws(() => evaluateXPathToString(xpath, contextNode), errorCode, xpath);
		case 'assert':
		case 'assert-true':
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(xpath, contextNode), xpath);
		case 'assert-eq':
			const equalWith = evaluateXPathToString('.', expectedResultNode);
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) = (${equalWith})`, contextNode), xpath);
		case 'assert-false':
			return (xpath, contextNode) => chai.assert.isFalse(evaluateXPathToBoolean(xpath, contextNode), xpath);
		case 'assert-count':
			const expectedCount = evaluateXPathToNumber('.', expectedResultNode);
			return (xpath, contextNode) => chai.assert.equal(evaluateXPathToNumber(`(${xpath}) => count()`, contextNode), expectedCount, xpath);
		case 'assert-string-value':
			const expectedString = evaluateXPathToString('.', expectedResultNode);
			return (xpath, contextNode) => chai.assert.equal(evaluateXPathToString(`(${xpath})!string() => string-join(" ")`, contextNode), expectedString, xpath);
		default:
			return () => {
				chai.assert.fail(null, null, `Skipped test, it was a ${expectedResultNode.localName}`);
			};
	}

}

context.keys().forEach((item) => {
	// Load the XML
	const doc = parser.parseFromString(context(item), 'text/xml');
	// Find all the tests we can run
	const testCases = evaluateXPathToNodes(`
/test-set[not(./dependency[@value eq "XQ10+" or @value eq "XQ30+"])]/test-case[
  not(./environment) and
  not(./dependency[@value eq "XQ10+"]) and
  not(./dependency[@value eq "schemaImport"]) and
  not(./dependency[@type eq "xsd-version" and @value eq "1.1"]) and
  not(./dependency[@value eq "moduleImport"]) and
  not(./dependency[@value eq "schemaAware"]) and
  not(./dependency[@value eq "XQ30+"])]`, doc);
	if (!testCases.length) {
		return;
	}
	describe(evaluateXPathToString('/test-set/description', doc), () => {
		for (const testCase of testCases) {
			const testQuery = evaluateXPathToString('./test', testCase);
			const description = evaluateXPathToString('if (description/text()) then description else test', testCase);
			const asserter = getAsserterForTest(testCase);
			it(description, () => {
				asserter(testQuery, doc);
			});
		}
	});
});
