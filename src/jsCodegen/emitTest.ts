import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

const kindTestNodeNames = {
	TEXT_TEST: 'textTest',
	ELEMENT_TEST: 'elementTest',
	NAME_TEST: 'nameTest',
	WILDCARD: 'Wildcard',
};

export const kindTestNames = Object.values(kindTestNodeNames);

const testEmittersByNodeName = {
	[kindTestNodeNames.TEXT_TEST]: emitTextTest,
	[kindTestNodeNames.NAME_TEST]: emitNameTest,
	[kindTestNodeNames.ELEMENT_TEST]: emitElementTest,
	[kindTestNodeNames.WILDCARD]: emitWildcard,
};

const typesByNodeName = {
	[kindTestNodeNames.TEXT_TEST]: 'text()',
	[kindTestNodeNames.NAME_TEST]: 'element()',
	[kindTestNodeNames.ELEMENT_TEST]: 'element()',
	[kindTestNodeNames.WILDCARD]: 'element()',
};

export function determineTypeFromTest(testAst: IAST): ValueType {
	const testType = testAst[0];
	const type = typesByNodeName[testType] as ValueType;

	if (type === undefined) {
		throw new Error(`Unsupported test type: ${testAst[0]}`);
	}
	return type;
}

// text() matches any text node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
function emitTextTest(_ast: IAST, identifier: string) {
	return `${identifier}.nodeType === NODE_TYPES.TEXT_NODE`;
}

// element() and element(*) match any single element node, regardless of its name or type annotation.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementTest
function emitElementTest(ast: IAST, identifier: string) {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	const isElementCode = `${identifier}.nodeType === NODE_TYPES.ELEMENT_NODE`;
	if (!elementName || star) {
		return isElementCode;
	}
	const qName = astHelper.getQName(astHelper.getFirstChild(elementName, 'QName'));
	return `${isElementCode} && ${identifier}.localName === "${qName.localName}"`;
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
function emitNameTest(ast: IAST, identifier: string) {
	const qName = astHelper.getQName(ast);
	if (qName.namespaceURI === '') {
		throw new Error("Unsupported: empty namespaceURI's");
	}

	return `${identifier}.nodeType === NODE_TYPES.ELEMENT_NODE && ${identifier}.localName === "${qName.localName}"`;
}

// select all element children of the context node
// for example: child::*.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-Wildcard
function emitWildcard(ast: IAST, identifier: string): string {
	if (astHelper.getChildren(ast, 'Wildcard').length !== 0) {
		throw new Error('Unsupported: the provided wildcard');
	}
	return emitElementTest(ast, identifier);
}

function emitTest(ast: IAST, identifier: string): string {
	const test = ast[0];
	const emittedTest = testEmittersByNodeName[test](ast, identifier);

	if (emittedTest === undefined) {
		throw new Error('This test is not supported');
	}
	return emittedTest;
}

export default emitTest;
