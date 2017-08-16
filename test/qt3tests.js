const {
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString
} = require('fontoxpath');

const context = require.context('text-loader!assets', true, /\.xml|\.out$/);
const parser = new DOMParser();

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
		parser.parseFromString(context(`./QT3TS-master/${fileName}`), 'text/xml');
}

function createAsserter (assertNode) {
	switch (assertNode.localName) {
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map(createAsserter);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				asserts.forEach(a => a(xpath, contextNode, variablesInScope, namespaceResolver));
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map(createAsserter);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const errors = [];
				chai.assert(asserts.some((a => {
					try {
						a(xpath, contextNode, variablesInScope, namespaceResolver);
					}
					catch (error) {
						errors.push(error);
						return false;
					}
					return true;
				})), `Expected executing the XPath "${xpath}" to resolve to one of the expected results, but got ${errors.join(', ')}.`);
			};
		}
		case 'error': {
			const errorCode = evaluateXPathToString('@code', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.throws(() => evaluateXPathToString(xpath, contextNode, null, variablesInScope, { namespaceResolver }), errorCode, xpath);
		}
		case 'assert':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`let $result := (${xpath}) return ${evaluateXPathToString('.', assertNode)}`, contextNode, null, variablesInScope, { namespaceResolver }), xpath);
		case 'assert-true':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, { namespaceResolver }), `Expected XPath ${xpath} to resolve to true`);
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) = (${equalWith})`, contextNode, null, variablesInScope, { namespaceResolver }), `Expected XPath ${xpath} to resolve to ${equalWith}`);
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`deep-equal((${xpath}), (${equalWith}))`, contextNode, null, variablesInScope, { namespaceResolver }), `Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`);
		}
		case 'assert-empty':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) => empty()`, contextNode, null, variablesInScope, { namespaceResolver }), `Expected XPath ${xpath} to resolve to the empty sequence`);
		case 'assert-false':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isFalse(evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, { namespaceResolver }), `Expected XPath ${xpath} to resolve to false`);
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.equal(evaluateXPathToNumber(`(${xpath}) => count()`, contextNode, null, variablesInScope, { namespaceResolver }), expectedCount, `Expected ${xpath} to resolve to ${expectedCount}`);
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) instance of ${expectedType}`, contextNode, null, variablesInScope, { namespaceResolver }), `Expected XPath ${xpath} to resolve to something of type ${expectedType}`);
		}
		case 'assert-xml': {
			let parsedFragment;
			if (evaluateXPathToBoolean('@file', assertNode)) {
				parsedFragment = getFile(evaluateXPathToString('"prod/" || @file', assertNode));
			}
			else {
				parsedFragment = parser.parseFromString(`<xml>${assertNode.textContent}</xml>`, 'text/xml').documentElement;
			}
			const expectedNodes = Array.from(parsedFragment.childNodes).map(node => node.outerHTML);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const result = evaluateXPathToNodes(xpath, contextNode, null, variablesInScope, { namespaceResolver }).map(node => node.outerHTML);
				chai.assert.deepEqual(result, expectedNodes, `Expected XPath ${xpath} to resolve to the given XML`);
			};
		}
		case 'assert-string-value': {
			const expectedString = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.equal(evaluateXPathToString(`(${xpath})!string() => string-join(" ")`, contextNode, null, variablesInScope, { namespaceResolver }), expectedString, xpath);
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

const catalog = getFile('catalog.xml');
const emptyDoc = catalog.implementation.createDocument(null, null);

function createEnvironment (cwd, environmentNode) {
	const fileName = evaluateXPathToString('source[@role="."]/@file', environmentNode);
	const variables = evaluateXPathToNodes('source[@role!="."]', environmentNode)
		.reduce((varsByName, variable) => Object.assign(
			varsByName,
			{ [evaluateXPathToString('@role', variable).substr(1)]: getFile((cwd ? cwd + '/' : '') + evaluateXPathToString('@file', variable)) }), {});
	const namespaces = evaluateXPathToMap('(namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()', environmentNode);

	return {
		contextNode: fileName ? getFile((cwd ? cwd + '/' : '') + fileName) : emptyDoc,
		variables,
		namespaceResolver: Object.keys(namespaces).length ? prefix => namespaces[prefix] : null
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

const shouldRunTestByName = require('text-loader!./runnableTestSets.csv')
	.split('\n')
	.map(line=>line.split(','))
	.reduce((accum, [name, run]) => Object.assign(accum, { [name]: run === 'true' }), Object.create(null));

const unrunnableTestCasesByName = require('text-loader!./unrunnableTestCases.csv')
	.split('\n')
	.map(line => line.split(','))
	.reduce((accum, [name, ...runInfo]) => Object.assign(accum, { [name]: runInfo.join('.') }), Object.create(null));


evaluateXPathToNodes('/catalog/test-set', catalog)
	.filter(testSetNode => shouldRunTestByName[evaluateXPathToString('@name', testSetNode)])
	.map(testSetNode => evaluateXPathToString('@file', testSetNode))
	.forEach(testSetFileName => {
		const testSet = getFile(testSetFileName);

		// Find all the tests we can run
		const testCases = evaluateXPathToNodes(`
/test-set/test-case[
  let $dependencies := (./dependency | ../dependency)
  return not(
     $dependencies/@value = (
       (:"schemaValidation",:)
       "schemaImport",
       ("XQ10", "XQ30+", "XQ31+", "XQ10+"),
       (:"staticTyping",:)
       (:"serialization",:)
       "infoset-dtd",
       (:"xpath-1.0-compatibility",:)
       "namespace-axis",
       "moduleImport",
       "schema-location-hint",
       (:"collection-stability",:)
       "directory-as-collation-uri",
       (:"fn-transform-XSLT",:)
       (:"fn-transform-XSLT30",:)
       (:"fn-format-integer-CLDR",:)
       (:"non-empty-sequence-collection",:)
       "non-unicode-codepoint-collation",
       "simple-uca-fallback",
       "advanced-uca-fallback"))]`, testSet);
		if (!testCases.length) {
			return;
		}

		window.log = '';
		describe(evaluateXPathToString('/test-set/description', testSet), () => {
				for (const testCase of testCases) {
					const testName = evaluateXPathToString('./@name', testCase);
					const description = evaluateXPathToString('if (description/text()) then description else test', testCase);
					if (unrunnableTestCasesByName[testName]) {
						it.skip(`${unrunnableTestCasesByName[testName]}. (${description})`);
						continue;
					}

					const testQuery = evaluateXPathToString('./test', testCase);
					const asserter = getAsserterForTest(testCase);

					const environmentName = evaluateXPathToString('./environment/@ref', testCase);
					const namespaces = evaluateXPathToMap('(environment/namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()', testCase);

					let contextNode;
					const localNamespaceResolver = Object.keys(namespaces).length ? prefix => namespaces[prefix] : null;
					let namespaceResolver = localNamespaceResolver;
					let variablesInScope = undefined;
					if (environmentName) {
						const environmentNode = evaluateXPathToFirstNode('/test-set/environment[@name = $envName]', testCase, null, { envName: environmentName });
						let env;
						if (environmentNode) {
							env = createEnvironment(testSetFileName.substr(0, testSetFileName.lastIndexOf('/')), environmentNode);
						}
						else {
							env = environmentsByName[environmentName] || environmentsByName['empty'];
						}
						contextNode = env.contextNode;
						namespaceResolver = localNamespaceResolver ? prefix => localNamespaceResolver(prefix) || env.namespaceResolver(prefix) : null;
						variablesInScope = env.variables;
					}
					else {
						contextNode = environmentsByName['empty'].contextNode;
					}
					const assertFn = () => {
						try {
							asserter(testQuery, contextNode, variablesInScope, namespaceResolver);
						}
						catch (e) {
							window.log += `${testName},${e.toString().replace(/\n/g, ' ')}\n`;
							// And rethrow the error
							throw e;
						}
					};
					assertFn.toString = () => testCase.outerHTML;
					it(description, assertFn);
				}
		});
	});
