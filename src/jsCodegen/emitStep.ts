import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { Bucket } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

const axisAstNodes = {
	ATTRIBUTE: 'attribute',
	CHILD: 'child',
	PARENT: 'parent',
	SELF: 'self',
};

// The child axis contains the children of the context node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ForwardAxis
//
// returns node()'s.
// https://www.w3.org/TR/xpath-datamodel-31/#dm-children
const childAxisContextNodesIdentifier = 'childNodes';
function emitChildAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	bucket: Bucket | null
): PartialCompilationResult {
	const bucketArg = bucket ? `, "${bucket}"` : '';
	const axisIterationCode = `let contextItem${nestLevel} = domFacade.getFirstChild(contextItem${
		nestLevel - 1
	}${bucketArg});
		contextItem${nestLevel};
		contextItem${nestLevel} = domFacade.getNextSibling(contextItem${nestLevel}${bucketArg})`;

	return emitMultipleNodeAxis(test, predicates, nestLevel, nestedCode, '', axisIterationCode);
}

// the attribute axis contains the attributes of the context node,
const attributeAxisContextNodesIdentifier = 'attributeNodes';
function emitAttributeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	bucket: Bucket | null
): PartialCompilationResult {
	// Only element nodes can have attributes.
	const contextCode = `
	let ${attributeAxisContextNodesIdentifier}${nestLevel} = [];
	if (contextItem${nestLevel - 1} && contextItem${nestLevel - 1}.nodeType === /*ELEMENT_NODE*/ ${
		NODE_TYPES.ELEMENT_NODE
	}) {
		${attributeAxisContextNodesIdentifier}${nestLevel} =  domFacade.getAllAttributes(contextItem${
		nestLevel - 1
	} ${bucket ? `, "${bucket}"` : ''});
	}
	`;
	const axisIterationCode = `const contextItem${nestLevel} of ${attributeAxisContextNodesIdentifier}${nestLevel}`;

	return emitMultipleNodeAxis(
		test,
		predicates,
		nestLevel,
		nestedCode,
		contextCode,
		axisIterationCode
	);
}

// self::para selects the context node if it is a para element, and otherwise
// returns an empty sequence
function emitSelfAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string
): PartialCompilationResult {
	const contextItemCode = `const contextItem${nestLevel} = contextItem${nestLevel - 1};`;

	return emitSingleNodeAxis(test, predicates, nestLevel, nestedCode, contextItemCode);
}

// parent::node() selects the parent of the context node. If the context node is
// an attribute node, this expression returns the element node (if any) to which
// the attribute node is attached.
function emitParentAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	bucket: Bucket | null
): PartialCompilationResult {
	const contextItemCode = `
	const contextItem${nestLevel} = domFacade.getParentNode(contextItem${nestLevel - 1} ${
		bucket ? `, "${bucket}"` : ''
	});
	`;

	return emitSingleNodeAxis(test, predicates, nestLevel, nestedCode, contextItemCode);
}

function formatConditions(...conditions: string[]): string {
	return conditions.filter((c) => c !== '').join(' && ');
}

function emitMultipleNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextCode: string,
	axisIterationCode: string
): PartialCompilationResult {
	const nullCheckCode = `contextItem${nestLevel}`;
	const conditions = formatConditions(nullCheckCode, test, predicates);

	const axisCode = `
	${contextCode}
	for (${axisIterationCode}) {
		if (!(${conditions})) {
			continue;
		}
		${nestedCode}
	}
	`;

	return acceptAst(axisCode, { type: GeneratedCodeBaseType.Statement });
}

// Emit code for an axis made up of exactly one node, that should only be
// returned once.
function emitSingleNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextItemCode: string
): PartialCompilationResult {
	const nullCheckCode = `contextItem${nestLevel}`;

	const conditions = formatConditions(nullCheckCode, test, predicates);

	return acceptAst(
		`
		${contextItemCode}
		if (${conditions}) {
			${nestedCode}
		}
		`,
		{ type: GeneratedCodeBaseType.Statement }
	);
}

function emitStep(
	ast: IAST,
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	bucket: Bucket | null
): [PartialCompilationResult, Bucket] {
	const axisName = astHelper.getTextContent(ast);

	switch (axisName) {
		case axisAstNodes.ATTRIBUTE:
			return [emitAttributeAxis(test, predicates, nestLevel, nestedCode, bucket), 'type-1'];
		case axisAstNodes.CHILD:
			return [emitChildAxis(test, predicates, nestLevel, nestedCode, bucket), null];
		case axisAstNodes.PARENT:
			return [emitParentAxis(test, predicates, nestLevel, nestedCode, bucket), null];
		case axisAstNodes.SELF:
			return [emitSelfAxis(test, predicates, nestLevel, nestedCode), bucket];
		default:
			return [rejectAst(`Unsupported: the ${axisName} axis`), null];
	}
}

export default emitStep;
