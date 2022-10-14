import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { Bucket, intersectBuckets } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { emitAnd, mapPartialCompilationResult } from './emitHelpers';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

export const axisAstNodes = {
	ATTRIBUTE: 'attribute',
	CHILD: 'child',
	PARENT: 'parent',
	SELF: 'self',
};

function emitMultipleNodesAxis(
	iterationCode: PartialCompilationResult,
	conditionExpr: PartialCompilationResult,
	nestedCode: PartialCompilationResult
): PartialCompilationResult {
	return mapPartialCompilationResult(iterationCode, (iterationCode) =>
		mapPartialCompilationResult(conditionExpr, (conditionExpr) =>
			mapPartialCompilationResult(nestedCode, (nestedCode) =>
				acceptAst(
					`for (${iterationCode.code}) {
						${conditionExpr.variables.join('\n')}
						if (!(${conditionExpr.code})) {
							continue;
						}
						${nestedCode.variables.join('\n')}
						${nestedCode.code}
					}`,
					{ type: GeneratedCodeBaseType.Statement },
					iterationCode.variables
				)
			)
		)
	);
}

// The child axis contains the children of the context node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ForwardAxis
//
// returns node()s.
// https://www.w3.org/TR/xpath-datamodel-31/#dm-children
function emitChildAxis(
	conditionExpr: PartialCompilationResult,
	conditionBucket: Bucket,
	nestedCode: PartialCompilationResult,
	stepContextItemExpr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult
): PartialCompilationResult {
	const bucketArg = conditionBucket ? `, "${conditionBucket}"` : '';

	const iterationCode = mapPartialCompilationResult(stepContextItemExpr, (stepContextItemExpr) =>
		mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
			acceptAst(
				`let ${stepContextItemExpr.code} = domFacade.getFirstChild(${contextItemExpr.code}${bucketArg});
							${stepContextItemExpr.code};
							${stepContextItemExpr.code} = domFacade.getNextSibling(${stepContextItemExpr.code}${bucketArg})`,
				{ type: GeneratedCodeBaseType.Statement },
				[...stepContextItemExpr.variables, ...contextItemExpr.variables]
			)
		)
	);

	return emitMultipleNodesAxis(iterationCode, conditionExpr, nestedCode);
}

// the attribute axis contains the attributes of the context node,
function emitAttributeAxis(
	conditionExpr: PartialCompilationResult,
	conditionBucket: Bucket,
	nestedCode: PartialCompilationResult,
	stepContextItemExpr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult
): PartialCompilationResult {
	// Can't get anything but attributes here
	const bucket = intersectBuckets(conditionBucket, 'type-2');
	// Only element nodes can have attributes
	const nodesExpr = mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
		acceptAst(
			`(${contextItemExpr.code} && ${contextItemExpr.code}.nodeType === /*ELEMENT_NODE*/ ${
				NODE_TYPES.ELEMENT_NODE
			} ? domFacade.getAllAttributes(${contextItemExpr.code}${
				bucket ? `, "${bucket}"` : ''
			}) : [])`,
			{ type: GeneratedCodeBaseType.Value },
			contextItemExpr.variables
		)
	);
	const iterationCode = mapPartialCompilationResult(stepContextItemExpr, (stepContextItemExpr) =>
		mapPartialCompilationResult(nodesExpr, (nodesExpr) =>
			acceptAst(
				`const ${stepContextItemExpr.code} of ${nodesExpr.code}`,
				{ type: GeneratedCodeBaseType.Statement },
				[...stepContextItemExpr.variables, ...nodesExpr.variables]
			)
		)
	);

	return emitMultipleNodesAxis(iterationCode, conditionExpr, nestedCode);
}

// self::para selects the context node if it is a para element, and otherwise
// returns an empty sequence
function emitSelfAxis(
	conditionExpr: PartialCompilationResult,
	conditionBucket: Bucket,
	nestedCode: PartialCompilationResult,
	stepContextItemExpr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult
): PartialCompilationResult {
	return emitSingleNodeAxis(stepContextItemExpr, contextItemExpr, conditionExpr, nestedCode);
}

// parent::node() selects the parent of the context node. If the context node is
// an attribute node, this expression returns the element node (if any) to which
// the attribute node is attached.
function emitParentAxis(
	conditionExpr: PartialCompilationResult,
	conditionBucket: Bucket,
	nestedCode: PartialCompilationResult,
	stepContextItemExpr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult
): PartialCompilationResult {
	const bucketArg = conditionBucket ? `, "${conditionBucket}"` : '';
	const parentExpr = mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
		acceptAst(
			`domFacade.getParentNode(${contextItemExpr.code}${bucketArg})`,
			{ type: GeneratedCodeBaseType.Value },
			contextItemExpr.variables
		)
	);

	return emitSingleNodeAxis(stepContextItemExpr, parentExpr, conditionExpr, nestedCode);
}

// Emit code for an axis made up of exactly one node, that should only be
// returned once.
function emitSingleNodeAxis(
	stepContextItemExpr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult,
	conditionExpr: PartialCompilationResult,
	nestedCode: PartialCompilationResult
): PartialCompilationResult {
	const nullCheck = stepContextItemExpr;
	const conditionsWithNullCheck = emitAnd(nullCheck, conditionExpr);
	return mapPartialCompilationResult(stepContextItemExpr, (stepContextItemExpr) =>
		mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
			mapPartialCompilationResult(conditionsWithNullCheck, (conditionsWithNullCheck) =>
				mapPartialCompilationResult(nestedCode, (nestedCode) =>
					acceptAst(
						`const ${stepContextItemExpr.code} = ${contextItemExpr.code};
						${conditionsWithNullCheck.variables.join('\n')}
						if (${conditionsWithNullCheck.code}) {
							${nestedCode.variables.join('\n')}
							${nestedCode.code}
						}`,
						{ type: GeneratedCodeBaseType.Statement },
						[...stepContextItemExpr.variables, ...contextItemExpr.variables]
					)
				)
			)
		)
	);
}

export default function emitAxis(
	ast: IAST,
	conditionExpr: PartialCompilationResult,
	conditionBucket: Bucket,
	nestedCode: PartialCompilationResult,
	stepContextItemExpr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult
): [PartialCompilationResult, Bucket] {
	const axisName = astHelper.getTextContent(ast);

	switch (axisName) {
		case axisAstNodes.ATTRIBUTE:
			return [
				emitAttributeAxis(
					conditionExpr,
					conditionBucket,
					nestedCode,
					stepContextItemExpr,
					contextItemExpr
				),
				'type-1',
			];
		case axisAstNodes.CHILD:
			return [
				emitChildAxis(
					conditionExpr,
					conditionBucket,
					nestedCode,
					stepContextItemExpr,
					contextItemExpr
				),
				null,
			];
		case axisAstNodes.PARENT:
			return [
				emitParentAxis(
					conditionExpr,
					conditionBucket,
					nestedCode,
					stepContextItemExpr,
					contextItemExpr
				),
				null,
			];
		case axisAstNodes.SELF:
			return [
				emitSelfAxis(
					conditionExpr,
					conditionBucket,
					nestedCode,
					stepContextItemExpr,
					contextItemExpr
				),
				conditionBucket,
			];
		default:
			return [rejectAst(`Unsupported: the ${axisName} axis`), null];
	}
}
