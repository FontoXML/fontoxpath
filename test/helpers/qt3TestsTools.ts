import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToString,
	Language,
} from 'fontoxpath';

import { getSkippedTests } from './getSkippedTests';
import testFs from './testFs';

import { sync } from 'slimdom-sax-parser';
import { Node, Document, DocumentFragment } from 'slimdom';

const ALL_TESTS_QUERY = `
/test-set/test-case[
  let $dependencies := (./dependency | ../dependency)
  return not(exists($dependencies[@type="xml-version" and @value="1.1"])) and not(
     $dependencies/@value/tokenize(.) = (
       "XQ10",
       "XQ20",
       "XQ30",
       "schemaValidation",
       "schemaImport",
       (:"staticTyping",:)
       (:"serialization",:)
       "infoset-dtd",
       (:"xpath-1.0-compatibility",:)
       "namespace-axis",
       (:"moduleImport",:)
       "schema-location-hint",
       (:"collection-stability",:)
       "directory-as-collation-uri",
       (:"fn-transform-XSLT",:)
       (:"fn-transform-XSLT30",:)
       (:"fn-format-integer-CLDR",:)
       (:"non-empty-sequence-collection",:)
       "non-unicode-codepoint-collation",
       "simple-uca-fallback",
       "advanced-uca-fallback"))]`;

(global as any).atob = (b64Encoded) => {
	return new Buffer(b64Encoded, 'base64').toString('binary');
};

(global as any).btoa = (str) => {
	return new Buffer(str, 'binary').toString('base64');
};

const parser = {
	parseFromString: (xmlString: string): Document => {
		try {
			return sync(xmlString);
		} catch (e) {
			// tslint:disable-next-line: no-console
			console.log(`Error parsing the string ${xmlString}.`, e);
			throw e;
		}
	},
};

let shouldRunTestByName;

const indexOfGrep = process.argv.indexOf('--grep');
if (indexOfGrep >= 0) {
	const [greppedTestsetName] = process.argv[indexOfGrep + 1].split('~');
	shouldRunTestByName = { [greppedTestsetName.replace(/\\./g, '.')]: true };
} else {
	shouldRunTestByName = testFs
		.readFileSync('runnableTestSets.csv')
		.split(/\r?\n/)
		.map((line) => line.split(','))
		.reduce((accum, [name, run]) => {
			return { ...accum, [name]: run === 'true' };
		}, Object.create(null));
}

const unrunnableTestCases = getSkippedTests('unrunnableTestCases.csv');
const unrunnableTestCasesByName = unrunnableTestCases
	.map((line) => line.split(','))
	.reduce((accum, [name, ...runInfo]) => {
		return { ...accum, [name]: runInfo.join(',') };
	}, Object.create(null));

const globalDocument = parser.parseFromString('<xml/>');
const instantiatedDocumentByAbsolutePath = Object.create(null);

function getFile(fileName: string): Document | DocumentFragment | string {
	while (fileName.includes('..')) {
		const parts = fileName.split('/');
		fileName = parts
			.slice(0, parts.indexOf('..') - 1)
			.concat(parts.slice(parts.indexOf('..') + 1))
			.join('/');
	}
	if (instantiatedDocumentByAbsolutePath[fileName]) {
		return instantiatedDocumentByAbsolutePath[fileName];
	}

	let content = testFs.readFileSync(`QT3TS/${fileName}`).replace(/\r\n/g, '\n');
	if (fileName.endsWith('.out')) {
		if (content.endsWith('\n')) {
			content = content.slice(0, -1);
		}
		content = `<xml>${content}</xml>`;
		const parsedContents = Array.from(parser.parseFromString(content).firstChild.childNodes);
		const documentFragment = globalDocument.createDocumentFragment();
		parsedContents.forEach((node) => documentFragment.appendChild(node));
		return (instantiatedDocumentByAbsolutePath[fileName] = documentFragment);
	}
	if (fileName.includes('.xq')) {
		return content;
	}
	return (instantiatedDocumentByAbsolutePath[fileName] = parser.parseFromString(content));
}

const catalog = getFile('catalog.xml') as Document;
const emptyDoc = catalog.implementation.createDocument(null, null);

function createEnvironment(cwd, environmentNode) {
	const fileName = evaluateXPathToString('source[@role="."]/@file', environmentNode);
	const variables = evaluateXPathToNodes('source[@role!="."]', environmentNode).reduce(
		(varsByName, variable) => {
			return {
				...varsByName,
				[evaluateXPathToString('@role', variable).substr(1)]: getFile(
					(cwd ? cwd + '/' : '') + evaluateXPathToString('@file', variable)
				),
			};
		},
		{}
	);

	// Params area also variables. But different
	evaluateXPathToNodes('param', environmentNode).forEach((paramNode) => {
		variables[evaluateXPathToString('@name', paramNode)] = evaluateXPath(
			evaluateXPathToString('@select', paramNode)
		);
		// tslint:disable-next-line: no-console
		console.log(variables);
	});

	const namespaces = evaluateXPathToMap(
		'(namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()',
		environmentNode
	);

	return {
		contextNode: fileName ? getFile((cwd ? cwd + '/' : '') + fileName) : null,
		namespaceResolver: Object.keys(namespaces).length ? (prefix) => namespaces[prefix] : null,
		variables,
	};
}

const environmentsByName = evaluateXPathToNodes('/catalog/environment', catalog).reduce(
	(envByName, environmentNode) => {
		return {
			...envByName,
			[evaluateXPathToString('@name', environmentNode)]: createEnvironment(
				'',
				environmentNode
			),
		};
	},
	{
		empty: {
			contextNode: emptyDoc,
		},
	}
);

function getAllTestSets(): string[] {
	return evaluateXPathToNodes('/catalog/test-set', catalog)
		.filter((testSetNode) => shouldRunTestByName[evaluateXPathToString('@name', testSetNode)])
		.map((testSetNode) => evaluateXPathToString('@file', testSetNode));
}

function getArguments(
	testSetFileName: string,
	testCase: Node
): {
	baseUrl: string;
	contextNode: Node;
	language: Language;
	namespaceResolver: (prefix: string) => string | null;
	testQuery: string;
	variablesInScope: { [key: string]: string };
} {
	const baseUrl = testSetFileName.substr(0, testSetFileName.lastIndexOf('/'));

	let testQuery;
	if (evaluateXPathToBoolean('./test/@file', testCase)) {
		testQuery = getFile(
			evaluateXPathToString('$baseUrl || "/" || test/@file', testCase, null, {
				baseUrl,
			})
		);
	} else {
		testQuery = evaluateXPathToString('./test', testCase);
	}
	const language = evaluateXPathToString(
		`if (((dependency)[@type = "spec"]/@value)!tokenize(.) = ("XQ10+", "XQ30+", "XQ31+", "XQ31"))
							then "XQuery3.1" else if (((dependency)[@type = "spec"]/@value)!tokenize(.) = ("XP20", "XP20+", "XP30", "XP30+"))
							then "XPath3.1"	else if (((../dependency)[@type = "spec"]/@value)!tokenize(.) = ("XQ10+", "XQ30+", "XQ31+", "XQ31"))
							then "XQuery3.1" else "XPath3.1"`,
		testCase
	) as Language;
	const namespaces = evaluateXPathToMap(
		'(environment/namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()',
		testCase
	);

	const localNamespaceResolver = Object.keys(namespaces).length
		? (prefix) => namespaces[prefix]
		: null;
	let namespaceResolver = localNamespaceResolver;
	let variablesInScope;
	const environmentNode = evaluateXPathToFirstNode(
		'let $ref := ./environment/@ref return if ($ref) then /test-set/environment[@name = $ref] else ./environment',
		testCase,
		null
	);
	const env = environmentNode
		? createEnvironment(baseUrl, environmentNode)
		: environmentsByName[evaluateXPathToString('(./environment/@ref, "empty")[1]', testCase)];

	const contextNode = env.contextNode;
	namespaceResolver = localNamespaceResolver
		? (prefix) => localNamespaceResolver(prefix) || env.namespaceResolver(prefix)
		: (prefix) =>
				env.namespaceResolver
					? env.namespaceResolver(prefix)
					: prefix === ''
					? null
					: undefined;
	variablesInScope = env.variables;

	return {
		baseUrl,
		contextNode,
		testQuery,
		language,
		namespaceResolver,
		variablesInScope,
	};
}

export {
	ALL_TESTS_QUERY,
	getAllTestSets,
	getArguments,
	getFile,
	parser,
	unrunnableTestCases,
	unrunnableTestCasesByName,
};
