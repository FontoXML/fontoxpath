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
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map(createAsserter);
			return (xpath, contextNode, variablesInScope) =>
				asserts.forEach(a => a(xpath, contextNode, variablesInScope));
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map(createAsserter);
			return (xpath, contextNode, variablesInScope) => {
				const errors = [];
				chai.assert(asserts.some((a => {
					try {
						a(xpath, contextNode, variablesInScope);
					}
					catch (error) {
						// if (error.name !== 'AssertionError') {
						// 	throw error;
						// }
						errors.push(error);
						return false;
					}
					return true;
				})), `Expected executing the XPath "${xpath}" to resolve to one of the expected results, but got ${errors.join(', ')}.`);
			};
		}
		case 'error': {
			const errorCode = evaluateXPathToString('@code', assertNode);
			return (xpath, contextNode, variablesInScope) =>
				chai.assert.throws(() => evaluateXPathToString(xpath, contextNode, null, variablesInScope), errorCode, xpath);
		}
		case 'assert':
			return (xpath, contextNode, variablesInScope) => chai.assert.isTrue(evaluateXPathToBoolean(`let $result := (${xpath}) return ${evaluateXPathToString('.', assertNode)}`, contextNode, null, variablesInScope), xpath);
		case 'assert-true':
			return (xpath, contextNode, variablesInScope) => chai.assert.isTrue(evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope), `Expected XPath ${xpath} to resolve to true`);
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) = (${equalWith})`, contextNode, null, variablesInScope), `Expected XPath ${xpath} to resolve to ${equalWith}`);
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope) => chai.assert.isTrue(evaluateXPathToBoolean(`deep-equal(${xpath}, ${equalWith})`, contextNode, null, variablesInScope), `Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`);
		}
		case 'assert-empty':
			return (xpath, contextNode, variablesInScope) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) => empty()`, contextNode, null, variablesInScope), `Expected XPath ${xpath} to resolve to the empty sequence`);
		case 'assert-false':
			return (xpath, contextNode, variablesInScope) => chai.assert.isFalse(evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope), `Expected XPath ${xpath} to resolve to false`);
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode);
			return (xpath, contextNode, variablesInScope) => chai.assert.equal(evaluateXPathToNumber(`(${xpath}) => count()`, contextNode, null, variablesInScope), expectedCount, `Expected ${xpath} to resolve to ${expectedCount}`);
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) instance of ${expectedType}`, contextNode, null, variablesInScope), `Expected XPath ${xpath} to resolve to something of type ${expectedType}`);
		}
		case 'assert-xml': {
			const expectedNodes = Array.from(parser.parseFromString(`<xml>${assertNode.textContent}</xml>`, 'text/xml').documentElement.childNodes).map(node => node.outerHTML);
			return (xpath, contextNode, variablesInScope) => chai.assert.deepEqual(evaluateXPathToNodes(xpath, contextNode, null, variablesInScope).map(node => node.outerHTML), expectedNodes, `Expected XPath ${xpath} to resolve to the given XML`);
		}
		case 'assert-string-value': {
			const expectedString = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope) => chai.assert.equal(evaluateXPathToString(`(${xpath})!string() => string-join(" ")`, contextNode, null, variablesInScope), expectedString, xpath);
		}
		default:
			return () => {
				chai.assert.fail(null, null, `Skipped test, it was a ${assertNode.localName}`);
			};
	}

}
function getAsserterForTest (testCase) {
	return createAsserter(evaluateXPathToFirstNode('./result/*', testCase));
}

const instantiatedDocumentByAbsolutePath = Object.create(null);

function getFile (fileName) {
	while (fileName.includes('..')) {
		const parts = fileName.split('/');
		fileName = parts.slice(0, parts.indexOf('..') - 1).concat(parts.slice(parts.indexOf('..') + 1)).join('/');
	}
	if (instantiatedDocumentByAbsolutePath[fileName]) {
		return instantiatedDocumentByAbsolutePath[fileName];
	}

	return instantiatedDocumentByAbsolutePath[fileName] =
		parser.parseFromString(context(`./QT3_1_0/${fileName}`), 'text/xml');
}

const catalog = getFile('catalog.xml');
const emptyDoc = catalog.implementation.createDocument(null, null);

function createEnvironment (cwd, environmentNode) {
	const fileName = evaluateXPathToString('source[@role="."]/@file', environmentNode);
	const variables = evaluateXPathToNodes('source[@role!="."]', environmentNode)
		.reduce((varsByName, variable) => Object.assign(
			varsByName,
			{ [evaluateXPathToString('@role', variable).substr(1)]: getFile((cwd ? cwd + '/' : '') + evaluateXPathToString('@file', variable)) }
		), {});
	return {
		contextNode: fileName ? getFile((cwd ? cwd + '/' : '') + fileName) : emptyDoc,
		variables
	};
}

const environmentsByName = evaluateXPathToNodes('/catalog/environment[source]', catalog)
	.reduce((envByName, environmentNode) =>	{
		return Object.assign(
			envByName,
			{ [evaluateXPathToString('@name', environmentNode)]: createEnvironment('', environmentNode)
			});
	}, {
		empty: {
			contextNode: emptyDoc
		}
	});

const shouldRunTestByName = require('text!./runnableTestSets.csv')
		.split('\n')
		.map(line=>line.split(','))
		.reduce((accum, [name, run]) => Object.assign(accum, { [name]: run === 'true' }), Object.create(null));

evaluateXPathToNodes('/catalog/test-set', catalog)
	.filter(testSetNode => shouldRunTestByName[evaluateXPathToString('@name', testSetNode)])
	.map(testSetNode => evaluateXPathToString('@file', testSetNode))
	.forEach(testSetFileName => {
		const testSet = getFile(testSetFileName);
		if (evaluateXPathToBoolean('/test-set/@name = "fn-matches" or /test-set/@name => contains("date") or /test-set/@name => contains("time") or /test-set/@name => contains("collation") or /test-set/@name => contains("duration")', testSet)) {
			return;
		}

		// Find all the tests we can run
		const testCases = evaluateXPathToNodes(`
/test-set[not(./dependency[@value eq "XQ10+" or @value eq "XQ30+"])]/test-case[
  not(./dependency[@value eq "XQ10+"]) and
  not(./dependency[@value eq "XQ10"]) and
  not(./dependency[@value eq "schemaImport"]) and
  not(./dependency[@type eq "xsd-version" and @value eq "1.1"]) and
  not(./dependency[@value eq "moduleImport"]) and
  not(./dependency[@value eq "schemaAware"]) and
  not(./test => contains("date")) and
  not(./test => contains("castable as")) and
  not(./test => contains("treat as")) and
  not(./test => contains("xs:long")) and
  not(./test => contains("xs:int(")) and
  not(./test => contains("xs:unsignedLong")) and
  not(./test => contains("xs:unsignedShort")) and
  not(./test => contains("xs:hexBinary")) and
  not(./test => contains("xs:base64Binary")) and
  not(./test => contains("xs:byte")) and
  not(./test => contains("xs:language")) and
  not(./test => contains("xs:token")) and
  not(./test => contains("xs:NCName")) and
  not(./test => contains("xs:ID")) and
  not(./test => contains("xs:IDREF")) and
  not(./test => contains("xs:ENTITY")) and
  not(./test => contains("xs:Name")) and
  not(./test => contains("xs:unsignedInt")) and
  not(./test => contains("xs:normalizedString")) and
  not(./test => contains("xs:unsignedByte")) and
  not(./test => contains("xs:NMTOKEN")) and
  not(./test => contains("xs:gDay")) and
  not(./test => contains("xs:QName")) and
  not(./test => contains("xs:anyURI")) and
  not(./test => contains("xs:short")) and
  not(./test => contains("function-lookup")) and
  not(./test => contains("error(")) and
  not(./test => contains("QName(")) and
  not(./test => contains("codepoints-to-string")) and
  not(./test => contains("codepoint-equal")) and
  not(./test => contains("format-integer")) and
  not(./test => contains("namespace-uri-from-QName")) and
  not(./test => contains("unparsed-text")) and
  not(./test => contains("upper-case")) and
  not(./test => contains("base-uri")) and
  not(./test => contains("distinct-values")) and
  not(./test => contains("normalize-unicode")) and
  not(./test => contains("translate")) and
  not(./test => contains("substring")) and
  not(./test => contains("string-to-codepoints")) and
  not(./test => contains("zero-or-one")) and
  not(./test => contains("lower-case")) and
  not(./test => contains("default-collation")) and
  not(./test => contains("encode-for-uri")) and
  not(./test => contains("namespace-uri")) and
  not(./test => contains("escape-html-uri")) and
  not(./test => contains("exactly-one")) and
  not(./test => contains("resolve-uri")) and
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
  not(./dependency[@value eq "XQ30+"])]`, testSet);
		if (!testCases.length) {
			return;
		}

		const shouldRunTestCaseByName = require('text!./unrunnableTestCases.csv')
				.split('\n')
				.map(line => line.split(','))
				.reduce((accum, [name, run]) => Object.assign(accum, { [name]: run === 'true' }), Object.create(null));

		describe(evaluateXPathToString('/test-set/description', testSet), () => {
			for (const testCase of testCases) {
				const testName = evaluateXPathToString('./@name', testCase);
				if (shouldRunTestCaseByName[testName] === false) {
					continue;
				}

				const testQuery = evaluateXPathToString('./test', testCase);
				const description = evaluateXPathToString('if (description/text()) then description else test', testCase);
				const asserter = getAsserterForTest(testCase);

				const environmentName = evaluateXPathToString('./environment/@ref', testCase);
				let contextNode;
				let variablesInScope;
				if (environmentName) {
					const environmentNode = evaluateXPathToFirstNode('/test-set/environment[@name = $envName]', testCase, null, { envName: environmentName });
					let env;
					if (environmentNode) {
						env = createEnvironment(testSetFileName.substr(0, testSetFileName.lastIndexOf('/')), environmentNode);
					}
					else {
						env = environmentsByName[environmentName] || { contextNode: environmentsByName['empty'] };
					}
					contextNode = env.contextNode;
					variablesInScope = env.variables;
				}
				else {
					contextNode = environmentsByName['empty'];
				}
				chai.assert(contextNode);
				const assertFn = () => asserter(testQuery, contextNode, variablesInScope);
				assertFn.toString = () => testCase.outerHTML;
				it(description, assertFn);
			}
		});
	});
