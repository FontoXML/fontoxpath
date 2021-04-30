import astHelper, { IAST } from '../parsing/astHelper';
import { acceptAst, EmittedJavaScript, rejectAst } from './EmittedJavaScript';

const testAstNodeNames = {
	TEXT_TEST: 'textTest',
	ELEMENT_TEST: 'elementTest',
	NAME_TEST: 'nameTest',
	WILDCARD: 'Wildcard',
};

export const testAstNodes = Object.values(testAstNodeNames);

const testEmittersByAstNodeName = {
	[testAstNodeNames.TEXT_TEST]: emitTextTest,
	[testAstNodeNames.NAME_TEST]: emitNameTest,
	[testAstNodeNames.ELEMENT_TEST]: emitElementTest,
	[testAstNodeNames.WILDCARD]: emitWildcard,
};

// text() matches any text node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
function emitTextTest(_ast: IAST, identifier: string): EmittedJavaScript {
	return acceptAst(`${identifier}.nodeType === NODE_TYPES.TEXT_NODE`);
}

type QName = { localName: string; namespaceURI: string; prefix: string };

function emitNameTestFromQName(
	identifier: string,
	{ prefix, namespaceURI, localName }: QName
): EmittedJavaScript {
	const conditionCode = `(${identifier}.nodeType === NODE_TYPES.ELEMENT_NODE || ${identifier}.nodeType === NODE_TYPES.ATTRIBUTE_NODE)`;

	if (prefix === null && namespaceURI !== '' && localName === '*') {
		return acceptAst(conditionCode);
	}

	if (prefix === '*') {
		if (localName === '*') {
			return acceptAst(conditionCode);
		}
		return acceptAst(`${conditionCode} && ${identifier}.localName === "${localName}"`);
	}

	if (localName !== '*') {
		return acceptAst(`${conditionCode} && ${identifier}.localName === "${localName}"`);
	}

	return rejectAst('Unsupported: name tests with a namespaceURI.');
}

// element() and element(*) match any single element node, regardless of its name or type annotation.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementTest
function emitElementTest(ast: IAST, identifier: string): EmittedJavaScript {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	const isElementCode = `${identifier}.nodeType === NODE_TYPES.ELEMENT_NODE`;
	if (elementName === null || star) {
		return acceptAst(isElementCode);
	}

	const qName = astHelper.getQName(astHelper.getFirstChild(elementName, 'QName'));

	return emitNameTestFromQName(identifier, qName);
}

// A node test that consists only of an EQName or a Wildcard is called a name test.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
function emitNameTest(ast: IAST, identifier: string) {
	return emitNameTestFromQName(identifier, astHelper.getQName(ast));
}

// select all element children of the context node
// for example: child::*.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-Wildcard
function emitWildcard(ast: IAST, identifier: string): EmittedJavaScript {
	if (astHelper.getChildren(ast, 'Wildcard').length !== 0) {
		return rejectAst('Unsupported: the provided wildcard');
	}
	return emitNameTestFromQName(identifier, { localName: '*', namespaceURI: null, prefix: '*' });
}

export default function emitTest(ast: IAST, identifier: string): EmittedJavaScript {
	const test = ast[0];
	const emittedTest = testEmittersByAstNodeName[test](ast, identifier);

	if (emittedTest === undefined) {
		return rejectAst('This test is not supported');
	}
	return emittedTest;
}
