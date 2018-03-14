const {
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString
} = require('fontoxpath');

let context;
let parser;

let unrunnableTestCasesByName;
let shouldRunTestByName;
if (!(typeof window === 'undefined')) {
	// In the browser
	context = require.context('text-loader!assets/', true, /\.xq|\.xml|\.out$/);
	parser = new DOMParser();


	let greppedTestsetName = null;
	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('grep')) {
			[greppedTestsetName] = urlParams.get('grep').split('~');
		}
	}
	if (greppedTestsetName) {
		shouldRunTestByName = { [greppedTestsetName.replace(/\\./g, '.')]: true };
	}
	else {
		shouldRunTestByName = require('text-loader!./runnableTestSets.csv')
			.split('\n')
			.map(line=>line.split(','))
			.reduce((accum, [name, run]) => Object.assign(accum, { [name]: run === 'true' }), Object.create(null));
	}
	unrunnableTestCasesByName = require('text-loader!./unrunnableTestCases.csv')
		.split('\n')
		.map(line => line.split(','))
		.reduce((accum, [name, ...runInfo]) => Object.assign(accum, { [name]: runInfo.join('.') }), Object.create(null));
}
else {
	const fs = require('fs');
	// On node
	context = what => fs.readFileSync(`test/assets/${what}`, 'utf-8');

	const { sync } = require('slimdom-sax-parser');
	parser = {
		parseFromString: xmlString => {
			try {
				return sync(xmlString);
			}
			catch (e) {
				console.log(`Error parsing the string ${xmlString}.`, e);
				throw e;
			}
		}
	};


	shouldRunTestByName = fs.readFileSync('test/runnableTestSets.csv', 'utf8')
		.split('\n')
		.map(line=>line.split(','))
		.reduce((accum, [name, run]) => Object.assign(accum, { [name]: run === 'true' }), Object.create(null));

	unrunnableTestCasesByName = fs.readFileSync('test/unrunnableTestCases.csv', 'utf-8')
		.split('\n')
		.map(line => line.split(','))
		.reduce((accum, [name, ...runInfo]) => Object.assign(accum, { [name]: runInfo.join(',') }), Object.create(null));

}

const globalDocument = parser.parseFromString('<xml/>', 'text/xml');


const instantiatedDocumentByAbsolutePath = Object.create(null);
// Especially the CI can be slow, up the timeout to 60s.
mocha.timeout(60000);

function getFile (fileName) {
	while (fileName.includes('..')) {
		const parts = fileName.split('/');
		fileName = parts.slice(0, parts.indexOf('..') - 1).concat(parts.slice(parts.indexOf('..') + 1)).join('/');
	}
	if (instantiatedDocumentByAbsolutePath[fileName]) {
		return instantiatedDocumentByAbsolutePath[fileName];
	}

	let content = context(`./QT3TS-master/${fileName}`);
	if (fileName.endsWith('.out')) {
		if (content.endsWith('\n')) {
			content = content.slice(0, -1);
		}
		content = `<xml>${content}</xml>`;
		const parsedContents = Array.from(parser.parseFromString(content, 'text/xml').firstChild.childNodes);
		const documentFragment = globalDocument.createDocumentFragment(null, null);
		parsedContents.forEach(node => documentFragment.appendChild(node));
		return instantiatedDocumentByAbsolutePath[fileName] = documentFragment;

	}
	if (fileName.includes('.xq')) {
		return content;
	}
	return instantiatedDocumentByAbsolutePath[fileName] =
		parser.parseFromString(content, 'text/xml');
}

function createAsserter (baseUrl, assertNode, language) {
	const nodesFactory = {
		createElementNS: assertNode.ownerDocument.createElementNS.bind(assertNode.ownerDocument),
		createTextNode: assertNode.ownerDocument.createTextNode.bind(assertNode.ownerDocument),
		createComment: assertNode.ownerDocument.createComment.bind(assertNode.ownerDocument),
		createProcessingInstruction: assertNode.ownerDocument.createProcessingInstruction.bind(assertNode.ownerDocument)
	};

	switch (assertNode.localName) {
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map(innerAssertNode => createAsserter(baseUrl, innerAssertNode, language));
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				asserts.forEach(a => a(xpath, contextNode, variablesInScope, namespaceResolver));
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map(innerAssertNode => createAsserter(baseUrl, innerAssertNode, language));
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
				chai.assert.throws(() => evaluateXPathToString(xpath, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), errorCode === '*' ? '' : errorCode, xpath);
		}
		case 'assert':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`let $result := (${xpath}) return ${evaluateXPathToString('.', assertNode)}`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), xpath);
		case 'assert-true':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), `Expected XPath ${xpath} to resolve to true`);
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) = (${equalWith})`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), `Expected XPath ${xpath} to resolve to ${equalWith}`);
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`deep-equal((${xpath}), (${equalWith}))`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), `Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`);
		}
		case 'assert-empty':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) => empty()`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), `Expected XPath ${xpath} to resolve to the empty sequence`);
		case 'assert-false':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isFalse(evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), `Expected XPath ${xpath} to resolve to false`);
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.equal(evaluateXPathToNumber(`(${xpath}) => count()`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), expectedCount, `Expected ${xpath} to resolve to ${expectedCount}`);
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.isTrue(evaluateXPathToBoolean(`(${xpath}) instance of ${expectedType}`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), `Expected XPath ${xpath} to resolve to something of type ${expectedType}`);
		}
		case 'assert-xml': {
			let parsedFragment;
			if (evaluateXPathToBoolean('@file', assertNode)) {
				parsedFragment = getFile(evaluateXPathToString('$baseUrl || "/" || @file', assertNode, null, { baseUrl }));
			}
			else {
				parsedFragment = parser.parseFromString(`<xml>${assertNode.textContent}</xml>`, 'text/xml').documentElement;
			}
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const result = evaluateXPathToNodes(xpath, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language });
				chai.assert(evaluateXPathToBoolean('deep-equal($a, $b)', null, null, {
					a: result,
					b: Array.from(parsedFragment.childNodes)
				}), `Expected XPath ${xpath} to resolve to the given XML. Expected ${result.map(result=>result.outerHTML).join(' ')} to equal ${parsedFragment.innerHTML}`);
			};
		}
		case 'assert-string-value': {
			const expectedString = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => chai.assert.equal(evaluateXPathToString(`(${xpath})!string() => string-join(" ")`, contextNode, null, variablesInScope, { namespaceResolver, nodesFactory, language }), expectedString, xpath);
		}
		default:
			return () => {
				chai.assert.fail(null, null, `Skipped test, it was a ${assertNode.localName}`);
			};
	}

}
function getAsserterForTest (baseUrl, testCase, language) {
	return createAsserter(baseUrl, evaluateXPathToFirstNode('./result/*', testCase), language);
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
		contextNode: fileName ? getFile((cwd ? cwd + '/' : '') + fileName) : null,
		variables,
		namespaceResolver: Object.keys(namespaces).length ? prefix => namespaces[prefix] : null
	};
}

const environmentsByName = evaluateXPathToNodes('/catalog/environment', catalog)
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

window.log = '';

evaluateXPathToNodes('/catalog/test-set', catalog)
	.filter(testSetNode => shouldRunTestByName[evaluateXPathToString('@name', testSetNode)])
	.map(testSetNode => evaluateXPathToString('@file', testSetNode))
	.forEach(testSetFileName => {
		const testSet = getFile(testSetFileName);

		const testSetName = evaluateXPathToString('/test-set/@name', testSet);

		// Find all the tests we can run
		const testCases = evaluateXPathToNodes(`
/test-set/test-case[
  let $dependencies := (./dependency | ../dependency)
  return not(
     $dependencies/@value = (
       (:"schemaValidation",:)
       "schemaImport",
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

		describe(evaluateXPathToString('/test-set/@name || /test-set/description!(if (string()) then "~" || . else "")', testSet), () => {
			for (const testCase of testCases) {
				try {
					const testName = evaluateXPathToString('./@name', testCase);
					const description = testSetName + '~' + testName + '~' + evaluateXPathToString('if (description/text()) then description else test', testCase);

					if (unrunnableTestCasesByName[testName]) {
						it.skip(`${unrunnableTestCasesByName[testName]}. (${description})`);
						continue;
					}

					const assertFn = () => {
						const baseUrl = testSetFileName.substr(0, testSetFileName.lastIndexOf('/'));

						let testQuery;
						if (evaluateXPathToBoolean('./test/@file', testCase)) {
							testQuery = getFile(
								evaluateXPathToString('$baseUrl || "/" || test/@file', testCase, null, { baseUrl }));
						}
						else {
							testQuery = evaluateXPathToString('./test', testCase);
						}
						const language = evaluateXPathToString(
							'if (((dependency | ../dependency)[@type = "spec"]/@value)!tokenize(.) = ("XQ10", "XQ10+", "XQ30", "XQ30+", "XQ31+", "XQ31")) then "XQuery3.1" else "XPath3.1"', testCase);
						const namespaces = evaluateXPathToMap('(environment/namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()', testCase);

						const localNamespaceResolver = Object.keys(namespaces).length ? prefix => namespaces[prefix] : null;
						let namespaceResolver = localNamespaceResolver;
						let variablesInScope = undefined;
						const environmentNode = evaluateXPathToFirstNode('let $ref := ./environment/@ref return if ($ref) then /test-set/environment[@name = $ref] else ./environment', testCase, null);
						let env;
						if (environmentNode) {
							env = createEnvironment(baseUrl, environmentNode);
						}
						else {
							env = environmentsByName[evaluateXPathToString('(./environment/@ref, "empty")[1]', testCase)];
						}
						const contextNode = env.contextNode;
						namespaceResolver = localNamespaceResolver ? prefix => localNamespaceResolver(prefix) || env.namespaceResolver(prefix) : null;
						variablesInScope = env.variables;
						const asserter = getAsserterForTest(baseUrl, testCase, language);

						try {
							asserter(testQuery, contextNode, variablesInScope, namespaceResolver);
						}
						catch (e) {
							if (e instanceof TypeError) {
								throw e;
							}
							window.log += `${testName},${e.toString().replace(/\n/g, ' ')}\n`;
							// And rethrow the error
							throw e;
						}
					};
					assertFn.toString = () => testCase.outerHTML;
					it(description, assertFn);
				}
				catch (e) {
					console.error(e);
					continue;
				}
			}
		});
	});
