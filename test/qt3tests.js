const {
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	evaluateXPathToString,
	evaluateXPathToNumber,
	evaluateXPathToFirstNode
} = require('fontoxpath');

const context = require.context('text!assets', true, /\.xml$/);
const parser = new DOMParser();

function createAsserter (assertNode) {
	switch (assertNode.localName) {
		case 'all-of':
			const asserts = evaluateXPathToNodes('*', assertNode).map(createAsserter);
			return (xpath, contextNode) =>
				asserts.forEach(a => a(xpath, contextNode));
		case 'error':
			const errorCode = evaluateXPathToString('@code', assertNode);
			return (xpath, contextNode) =>
				chai.assert.throws(() => evaluateXPathToString(xpath, contextNode), errorCode, xpath);
		case 'assert':
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(`let $result := (${xpath}) return ${evaluateXPathToString('.', assertNode)}`, contextNode), xpath);
		case 'assert-true':
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(xpath, contextNode), xpath);
		case 'assert-eq':
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) = (${equalWith})`, contextNode), xpath);
		case 'assert-empty':
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) => empty()`, contextNode), xpath);
		case 'assert-false':
			return (xpath, contextNode) => chai.assert.isFalse(evaluateXPathToBoolean(xpath, contextNode), xpath);
		case 'assert-count':
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode);
			return (xpath, contextNode) => chai.assert.equal(evaluateXPathToNumber(`(${xpath}) => count()`, contextNode), expectedCount, xpath);
		case 'assert-type':
			const expectedType = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) instance of ${expectedType}`, contextNode), xpath);
		case 'assert-string-value':
			const expectedString = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode) => chai.assert.equal(evaluateXPathToString(`(${xpath})!string() => string-join(" ")`, contextNode), expectedString, xpath);
		default:
			return () => {
				chai.assert.fail(null, null, `Skipped test, it was a ${assertNode.localName}`);
			};
	}

}
function getAsserterForTest (testCase) {
	return createAsserter(evaluateXPathToFirstNode('./result/*', testCase));
}

context.keys().forEach((item) => {
	// Load the XML
	const doc = parser.parseFromString(context(item), 'text/xml');
	if (evaluateXPathToBoolean('/test-set/@name = "fn-matches" or /test-set/@name => contains("date") or /test-set/@name => contains("time") or /test-set/@name => contains("collation") or /test-set/@name => contains("duration")', doc)) {
		return;
	}

	// Find all the tests we can run
	const testCases = evaluateXPathToNodes(`
/test-set[not(./dependency[@value eq "XQ10+" or @value eq "XQ30+"])]/test-case[
  not(./environment) and
  not(./dependency[@value eq "XQ10+"]) and
  not(./dependency[@value eq "schemaImport"]) and
  not(./dependency[@type eq "xsd-version" and @value eq "1.1"]) and
  not(./dependency[@value eq "moduleImport"]) and
  not(./dependency[@value eq "schemaAware"]) and
  not(./test => contains("date")) and
  not(./test => contains("castable as")) and
  not(./test => contains("treat as")) and
  not(./test => contains("xs:long")) and
  not(./test => contains("xs:unsignedLong")) and
  not(./test => contains("xs:short")) and
  not(./test => contains("Integer")) and
  not(./test => contains("day")) and
  not(./test => contains("uration")) and
  not(./test => contains("month")) and
  not(./test => contains("Month")) and
  not(./test => contains("year")) and
  not(./test => contains("Year")) and
  not(./test => contains("time")) and
  not(./test => contains("matches")) and
  not(./test => contains("replace")) and
  not(./dependency[@value eq "XQ30+"])]`, doc);
	if (!testCases.length) {
		return;
	}
	describe(evaluateXPathToString('/test-set/description', doc), () => {
		for (const testCase of testCases) {
			const testQuery = evaluateXPathToString('./test', testCase);
			const description = evaluateXPathToString('if (description/text()) then description else test', testCase);
			const asserter = getAsserterForTest(testCase);
			const assertFn = () => asserter(testQuery, doc);
			assertFn.toString = () => testCase.outerHTML;
			it(description, assertFn);
		}
	});
});
