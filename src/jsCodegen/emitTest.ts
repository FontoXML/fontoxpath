import { NODE_TYPES } from '../domFacade/ConcreteNode';
import QName from '../expressions/dataTypes/valueTypes/QName';
import astHelper, { IAST } from '../parsing/astHelper';
import { CompilationOptions } from './CompilationOptions';
import escapeJavaScriptString from './escapeJavaScriptString';
import { acceptAst, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

const testAstNodes = {
	TEXT_TEST: 'textTest',
	ELEMENT_TEST: 'elementTest',
	NAME_TEST: 'nameTest',
	WILDCARD: 'Wildcard',
};

export const tests = Object.values(testAstNodes);

// text() matches any text node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
function emitTextTest(_ast: IAST, identifier: string): PartialCompilationResult {
	return acceptAst(`${identifier}.nodeType === ${NODE_TYPES.TEXT_NODE}`);
}

function emitNameTestFromQName(
	identifier: string,
	{ prefix, namespaceURI, localName }: QName,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	const isElementOrAttributeCode = `${identifier}.nodeType && (${identifier}.nodeType === ${NODE_TYPES.ELEMENT_NODE} || ${identifier}.nodeType === ${NODE_TYPES.ATTRIBUTE_NODE})`;

	// Simple case.
	if (prefix === null && namespaceURI !== '' && localName === '*') {
		return acceptAst(isElementOrAttributeCode);
	}

	// Any prefix means any node matches, unless a non-wildcard localName is
	// used.
	if (prefix === '*') {
		if (localName === '*') {
			return acceptAst(isElementOrAttributeCode);
		}
		return acceptAst(
			`${isElementOrAttributeCode} && ${identifier}.localName === ${escapeJavaScriptString(
				localName
			)}`
		);
	}

	// Return a condition that compares localName and the resolved namespaceURI
	// against the context item.
	const matchesLocalNameCode =
		localName !== '*'
			? `${isElementOrAttributeCode} && ${identifier}.localName === ${escapeJavaScriptString(
					localName
			  )} && `
			: '';

	const isElementConditionCode = `${identifier}.nodeType && ${identifier}.nodeType === ${NODE_TYPES.ELEMENT_NODE}`;
	const resolveNamespaceURICode =
		prefix === ''
			? `(${isElementConditionCode} ? ${escapeJavaScriptString(namespaceURI)} : null)`
			: escapeJavaScriptString(namespaceURI);
	const matchesNamespaceCode = `(${identifier}.namespaceURI || null) === (${resolveNamespaceURICode} || null)`;

	return acceptAst(`${matchesLocalNameCode}${matchesNamespaceCode}`);
}

// element() and element(*) match any single element node, regardless of its name or type annotation.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementTest
function emitElementTest(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	const isElementCode = `${identifier}.nodeType === ${NODE_TYPES.ELEMENT_NODE}`;

	if (elementName === null || star) {
		return acceptAst(isElementCode);
	}

	const qName = astHelper.getQName(astHelper.getFirstChild(elementName, 'QName'));

	return emitNameTestFromQName(identifier, qName, compilationOptions);
}

// A node test that consists only of an EQName or a Wildcard is called a name test.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
function emitNameTest(ast: IAST, identifier: string, compilationOptions: CompilationOptions) {
	return emitNameTestFromQName(identifier, astHelper.getQName(ast), compilationOptions);
}

// select all element children of the context node
// for example: child::*.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-Wildcard
function emitWildcard(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	if (!astHelper.getFirstChild(ast, 'star')) {
		return emitNameTestFromQName(
			identifier,
			{
				localName: '*',
				namespaceURI: null,
				prefix: '*',
			},
			compilationOptions
		);
	}

	return rejectAst('Unsupported: the given wildcard.');
}

export default function emitTest(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	const test = ast[0];

	switch (test) {
		case testAstNodes.ELEMENT_TEST:
			return emitElementTest(ast, identifier, compilationOptions);
		case testAstNodes.TEXT_TEST:
			return emitTextTest(ast, identifier);
		case testAstNodes.NAME_TEST:
			return emitNameTest(ast, identifier, compilationOptions);
		case testAstNodes.WILDCARD:
			return emitWildcard(ast, identifier, compilationOptions);
		default:
			return rejectAst(`Unsupported: the test '${test}'.`);
	}
}
