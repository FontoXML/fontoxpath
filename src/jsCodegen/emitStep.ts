import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { Bucket } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import {
	acceptAst,
	ContextItemIdentifier,
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
	const contextNodesCode = `const ${childAxisContextNodesIdentifier}${nestLevel} = domFacade.getChildNodes(contextItem${
		nestLevel - 1
	} ${bucket ? `, "${bucket}"` : ''});`;

	return emitMultipleNodeAxis(
		test,
		predicates,
		nestLevel,
		nestedCode,
		childAxisContextNodesIdentifier,
		contextNodesCode
	);
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
	const contextNodesCode = `
	let ${attributeAxisContextNodesIdentifier}${nestLevel};
	if (contextItem && contextItem${nestLevel - 1}.nodeType === /*ELEMENT_NODE*/ ${
		NODE_TYPES.ELEMENT_NODE
	}) {
		${attributeAxisContextNodesIdentifier}${nestLevel} =  domFacade.getAllAttributes(contextItem${
		nestLevel - 1
	} ${bucket ? `, "${bucket}"` : ''});
	}
	`;

	return emitMultipleNodeAxis(
		test,
		predicates,
		nestLevel,
		nestedCode,
		attributeAxisContextNodesIdentifier,
		contextNodesCode
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
	const contextNodeCode = `const contextItem${nestLevel} = contextItem${nestLevel - 1};`;

	return emitSingleNodeAxis(test, predicates, nestLevel, nestedCode, contextNodeCode);
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
	const contextNodeCode = `
	const contextItem${nestLevel} = domFacade.getParentNode(contextItem${nestLevel - 1} ${
		bucket ? `, "${bucket}"` : ''
	});
	`;

	return emitSingleNodeAxis(test, predicates, nestLevel, nestedCode, contextNodeCode);
}

function formatConditions(...conditions: string[]): string {
	return conditions.filter((c) => c !== '').join(' && ');
}

function emitMultipleNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextItemIdentifier: ContextItemIdentifier,
	contextNodeCode: string
): PartialCompilationResult {
	const whileConditions = formatConditions(
		`${contextItemIdentifier}${nestLevel}`,
		`i${nestLevel} < ${contextItemIdentifier}${nestLevel}.length`
	);

	const indexReset = nestLevel !== 1 ? `i${nestLevel} = 0;` : ``;
	const nullCheckCode = `contextItem${nestLevel}`;

	const conditions = formatConditions(nullCheckCode, test, predicates);

	const axisCode = `
	${contextNodeCode}
	while (${whileConditions}) {
		const contextItem${nestLevel} = ${contextItemIdentifier}${nestLevel}[i${nestLevel}];
		if (!(${conditions})) {
			i${nestLevel}++;
			continue;
		}
		${nestedCode}
	}
	${indexReset}
	`;

	return acceptAst(axisCode, { type: GeneratedCodeBaseType.Statement }, [
		`let i${nestLevel} = 0;`,
	]);
}

// Emit code for an axis made up of exactly one node, that should only be
// returned once.
function emitSingleNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextNodeCode: string
): PartialCompilationResult {
	const isFirstPassCode = `i${nestLevel} === 0`;

	const nullCheckCode = `contextItem${nestLevel}`;

	const conditions = formatConditions(isFirstPassCode, nullCheckCode, test, predicates);

	return acceptAst(
		`
		${contextNodeCode}
		if (${conditions}) {
			${nestedCode}
		}
		`,
		{ type: GeneratedCodeBaseType.Statement },
		[`let i${nestLevel} = 0;`]
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
