import { NODE_TYPES } from '../domFacade/ConcreteNode';
import QName from '../expressions/dataTypes/valueTypes/QName';
import { Bucket } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import {
	emitAnd,
	mapPartialCompilationResult,
	mapPartialCompilationResultAndBucket,
} from './emitHelpers';
import escapeJavaScriptString from './escapeJavaScriptString';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

const testAstNodes = {
	TEXT_TEST: 'textTest',
	ELEMENT_TEST: 'elementTest',
	NAME_TEST: 'nameTest',
	WILDCARD: 'Wildcard',
	ANY_KIND_TEST: 'anyKindTest',
};

export const tests = Object.values(testAstNodes);

// text() matches any text node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
function emitTextTest(
	_ast: IAST,
	contextItemExpr: PartialCompilationResult,
	_context: CodeGenContext
): [PartialCompilationResult, Bucket | null] {
	return [
		mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
			acceptAst(
				`(${contextItemExpr.code}.nodeType === /*TEXT_NODE*/ ${NODE_TYPES.TEXT_NODE} ||
				${contextItemExpr.code}.nodeType === /* CDATA_SECTION_NODE */ ${NODE_TYPES.CDATA_SECTION_NODE})`,
				{
					type: GeneratedCodeBaseType.Value,
				},
				[]
			)
		),
		'type-3',
	];
}

function resolveNamespaceURI(qName: QName, staticContext: CodeGenContext) {
	if (qName.namespaceURI !== null) {
		return;
	}
	if (qName.prefix === '*') {
		return;
	}
	// Resolve prefix.
	const namespaceURI = staticContext.resolveNamespace(qName.prefix || '') || null;

	if (!namespaceURI && qName.prefix) {
		throw new Error(`XPST0081: The prefix ${qName.prefix} could not be resolved.`);
	}
	qName.namespaceURI = namespaceURI;
}

function emitNameTestFromQName(
	qName: QName,
	canBeAttribute: boolean,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket | null] {
	resolveNamespaceURI(qName, context);
	const { prefix, namespaceURI, localName } = qName;

	return mapPartialCompilationResultAndBucket(contextItemExpr, (contextItemExpr) => {
		const isCorrectNodeTypeExpr = canBeAttribute
			? acceptAst(
					`${contextItemExpr.code}.nodeType
						&& (${contextItemExpr.code}.nodeType === /*ELEMENT_NODE*/ ${NODE_TYPES.ELEMENT_NODE}
						|| ${contextItemExpr.code}.nodeType === /*ATTRIBUTE_NODE*/ ${NODE_TYPES.ATTRIBUTE_NODE})`,
					{ type: GeneratedCodeBaseType.Value },
					[]
			  )
			: acceptAst(
					`${contextItemExpr.code}.nodeType
						&& ${contextItemExpr.code}.nodeType === /*ELEMENT_NODE*/ ${NODE_TYPES.ELEMENT_NODE}`,
					{ type: GeneratedCodeBaseType.Value },
					[]
			  );

		// Simple cases.
		if (prefix === '*') {
			if (localName === '*') {
				return [isCorrectNodeTypeExpr, canBeAttribute ? 'type-1-or-type-2' : 'type-1'];
			}
			return [
				emitAnd(
					isCorrectNodeTypeExpr,
					acceptAst(
						`${contextItemExpr.code}.localName === ${escapeJavaScriptString(
							localName
						)}`,
						{ type: GeneratedCodeBaseType.Value },
						[]
					)
				),
				`name-${localName}`,
			];
		}

		// Return condition comparing localName and namespaceURI against the context item.
		const matchesLocalNameExpr =
			localName === '*'
				? isCorrectNodeTypeExpr
				: emitAnd(
						isCorrectNodeTypeExpr,
						acceptAst(
							`${contextItemExpr.code}.localName === ${escapeJavaScriptString(
								localName
							)}`,
							{ type: GeneratedCodeBaseType.Value },
							[]
						)
				  );

		const namespaceUriExpr = acceptAst(
			escapeJavaScriptString(namespaceURI),
			{ type: GeneratedCodeBaseType.Value },
			[]
		);
		const nodeNamespaceExpr =
			prefix === '' && canBeAttribute
				? // The prefix was empty: attributes should always resolve the empty prefix to the null namespace
				  mapPartialCompilationResult(namespaceUriExpr, (namespaceUriExpr) =>
						acceptAst(
							`${contextItemExpr.code}.nodeType === /*ELEMENT_NODE*/ ${NODE_TYPES.ELEMENT_NODE} ? ${namespaceUriExpr.code} : null`,
							{ type: GeneratedCodeBaseType.Value },
							namespaceUriExpr.variables
						)
				  )
				: namespaceUriExpr;
		const matchesNamespaceExpr = mapPartialCompilationResult(
			nodeNamespaceExpr,
			(nodeNamespaceExpr) =>
				acceptAst(
					`(${contextItemExpr.code}.namespaceURI || null) === ((${nodeNamespaceExpr.code}) || null)`,
					{ type: GeneratedCodeBaseType.Value },
					nodeNamespaceExpr.variables
				)
		);

		return [emitAnd(matchesLocalNameExpr, matchesNamespaceExpr), `name-${localName}`];
	});
}

// element() and element(*) match any single element node, regardless of its name or type annotation.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementTest
function emitElementTest(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket | null] {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');

	if (elementName === null || star) {
		return [
			mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
				acceptAst(
					`${contextItemExpr.code}.nodeType === /*ELEMENT_NODE*/ ${NODE_TYPES.ELEMENT_NODE}`,
					{ type: GeneratedCodeBaseType.Value },
					[]
				)
			),
			'type-1',
		];
	}

	const qName = astHelper.getQName(astHelper.getFirstChild(elementName, 'QName'));

	return emitNameTestFromQName(qName, false, contextItemExpr, context);
}

// A node test that consists only of an EQName or a Wildcard is called a name test.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
function emitNameTest(
	ast: IAST,
	canBeAttribute: boolean,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
) {
	return emitNameTestFromQName(astHelper.getQName(ast), canBeAttribute, contextItemExpr, context);
}

// select all element children of the context node
// for example: child::*.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-Wildcard
function emitWildcard(
	ast: IAST,
	canBeAttribute: boolean,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket | null] {
	if (!astHelper.getFirstChild(ast, 'star')) {
		return emitNameTestFromQName(
			{
				localName: '*',
				namespaceURI: null,
				prefix: '*',
			},
			canBeAttribute,
			contextItemExpr,
			context
		);
	}

	const uri = astHelper.getFirstChild(ast, 'uri');
	if (uri !== null) {
		return emitNameTestFromQName(
			{
				localName: '*',
				namespaceURI: astHelper.getTextContent(uri),
				prefix: '',
			},
			canBeAttribute,
			contextItemExpr,
			context
		);
	}

	// Either the prefix or the localName are 'starred', find out which one
	const ncName = astHelper.getFirstChild(ast, 'NCName');
	if (astHelper.getFirstChild(ast, '*')[0] === 'star') {
		// The prefix is 'starred'
		return emitNameTestFromQName(
			{
				localName: astHelper.getTextContent(ncName),
				namespaceURI: null,
				prefix: '*',
			},
			canBeAttribute,
			contextItemExpr,
			context
		);
	}

	// The localName is 'starred'
	return emitNameTestFromQName(
		{
			localName: '*',
			namespaceURI: null,
			prefix: astHelper.getTextContent(ncName),
		},
		canBeAttribute,
		contextItemExpr,
		context
	);
}

// node() matches any node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-AnyKindTest
function emitAnyKindTest(
	_ast: IAST,
	contextItemExpr: PartialCompilationResult,
	_context: CodeGenContext
): [PartialCompilationResult, Bucket | null] {
	return [
		mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
			acceptAst(
				`!!${contextItemExpr.code}.nodeType`,
				{
					type: GeneratedCodeBaseType.Value,
				},
				[]
			)
		),
		null,
	];
}

export default function emitTest(
	ast: IAST,
	canBeAttribute: boolean,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket | null] {
	const test = ast[0];

	switch (test) {
		case testAstNodes.ELEMENT_TEST:
			return emitElementTest(ast, contextItemExpr, context);
		case testAstNodes.TEXT_TEST:
			return emitTextTest(ast, contextItemExpr, context);
		case testAstNodes.NAME_TEST:
			return emitNameTest(ast, canBeAttribute, contextItemExpr, context);
		case testAstNodes.WILDCARD:
			return emitWildcard(ast, canBeAttribute, contextItemExpr, context);
		case testAstNodes.ANY_KIND_TEST:
			return emitAnyKindTest(ast, contextItemExpr, context);
		default:
			return [rejectAst(`Test not implemented: '${test}`), null];
	}
}
