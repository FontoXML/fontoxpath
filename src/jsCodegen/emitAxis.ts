import { acceptAst, PartiallyCompiledJavaScriptResult } from './CompiledJavaScript';

const axisAstNodeNames = {
	ATTRIBUTE: 'attribute',
	CHILD: 'child',
	PARENT: 'parent',
	SELF: 'self',
};

export const axisEmittersByAstNodeName = {
	[axisAstNodeNames.ATTRIBUTE]: emitAttributeAxis,
	[axisAstNodeNames.CHILD]: emitChildAxis,
	[axisAstNodeNames.PARENT]: emitParentAxis,
	[axisAstNodeNames.SELF]: emitSelfAxis,
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
	nestedCode: string
): PartiallyCompiledJavaScriptResult {
	const contextNodesCode = `const ${childAxisContextNodesIdentifier}${nestLevel} = domFacade.getChildNodes(contextItem${
		nestLevel - 1
	});`;

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
	nestedCode: string
): PartiallyCompiledJavaScriptResult {
	const contextNodesCode = `const ${attributeAxisContextNodesIdentifier}${nestLevel} = domFacade.getAllAttributes(contextItem${
		nestLevel - 1
	});`;

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
): PartiallyCompiledJavaScriptResult {
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
	nestedCode: string
): PartiallyCompiledJavaScriptResult {
	const contextNodeCode = `
	const contextItem${nestLevel} = domFacade.getParentNode(contextItem${nestLevel - 1});
	`;

	return emitSingleNodeAxis(test, predicates, nestLevel, nestedCode, contextNodeCode);
}

function formatConditionCode(condition: string) {
	return condition.length !== 0 ? `&& ${condition}` : '';
}

function emitMultipleNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextItemsIdentifier: string,
	contextNodeCode: string
): PartiallyCompiledJavaScriptResult {
	const indexReset = nestLevel !== 1 ? `i${nestLevel} = 0;` : ``;
	const predicateConditionCode = formatConditionCode(predicates);

	const axisCode = `
	${contextNodeCode}
	while (i${nestLevel} < ${contextItemsIdentifier}${nestLevel}.length) {
		const contextItem${nestLevel} = ${contextItemsIdentifier}${nestLevel}[i${nestLevel}];
		if (!(${test} ${predicateConditionCode})) {
			i${nestLevel}++;
			continue;
		}
		${nestedCode}
	}
	${indexReset}
	`;

	return acceptAst(axisCode, [`let i${nestLevel} = 0;`]);
}

// Emit code for an axis made up of exactly one node, that should only be
// returned once.
function emitSingleNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextNodeCode: string
): PartiallyCompiledJavaScriptResult {
	const testEvaluatationCode = formatConditionCode(test);
	const predicateEvaluationCode = formatConditionCode(predicates);

	return acceptAst(
		`
		${contextNodeCode}
		if (i${nestLevel} == 0 ${testEvaluatationCode} ${predicateEvaluationCode}) {
			${nestedCode}
		}
		`,
		[`let i${nestLevel} = 0;`]
	);
}
