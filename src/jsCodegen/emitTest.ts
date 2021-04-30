import astHelper, { IAST } from '../parsing/astHelper';
import { acceptAst, EmittedJavaScript, rejectAst } from './EmittedJavaScript';

const testAstNames = {
	TEXT_TEST: 'textTest',
	ELEMENT_TEST: 'elementTest',
	NAME_TEST: 'nameTest',
	WILDCARD: 'Wildcard',
};

export const kindTestNames = Object.values(testAstNames);

const testEmittersByNodeName = {
	[testAstNames.TEXT_TEST]: emitTextTest,
	[testAstNames.NAME_TEST]: emitNameTest,
	[testAstNames.ELEMENT_TEST]: emitElementTest,
	[testAstNames.WILDCARD]: emitWildcard,
};

// text() matches any text node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
function emitTextTest(_ast: IAST, identifier: string): EmittedJavaScript {
	return acceptAst(`${identifier}.nodeType === NODE_TYPES.TEXT_NODE`);
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
	return acceptAst(`${isElementCode} && ${identifier}.localName === "${qName.localName}"`);
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
function emitNameTest(ast: IAST, identifier: string) {
	const qName = astHelper.getQName(ast);
	if (qName.namespaceURI === '') {
		return rejectAst("Empty namespace URI's are unsupported.");
	}

	return acceptAst(`${identifier}.localName === "${qName.localName}"`);
}

// select all element children of the context node
// for example: child::*.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-Wildcard
function emitWildcard(ast: IAST, identifier: string): EmittedJavaScript {
	if (astHelper.getChildren(ast, 'Wildcard').length !== 0) {
		return rejectAst('Unsupported: the provided wildcard');
	}
	return emitElementTest(ast, identifier);
}

export default function emitTest(ast: IAST, identifier: string): EmittedJavaScript {
	const test = ast[0];
	const emittedTest = testEmittersByNodeName[test](ast, identifier);

	if (emittedTest === undefined) {
		return rejectAst('This test is not supported');
	}
	return emittedTest;
}
