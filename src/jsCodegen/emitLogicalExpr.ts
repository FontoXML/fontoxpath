import { Bucket, intersectBuckets } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitEffectiveBooleanValue, mapPartialCompilationResult } from './emitHelpers';
import { emitOperand } from './emitOperand';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
} from './JavaScriptCompiledXPath';

/**
 * Helper function to compile an and expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
 */
export function emitAndExpr(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	return emitLogicalExpr(ast, '&&', contextItemExpr, context);
}

/**
 * Helper function to compile an or expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
 */
export function emitOrExpr(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	return emitLogicalExpr(ast, '||', contextItemExpr, context);
}

/**
 * Compiles the and and or logical expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#id-logical-expressions
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @param logicalExprOperator The exact operator that will be compiled. Can be either && or ||.
 * @returns Wrapped logical expression.
 */
function emitLogicalExpr(
	ast: IAST,
	logicalExprOperator: '&&' | '||',
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	const [firstExpr, firstBucket] = emitOperand(ast, 'firstOperand', contextItemExpr, context);
	const firstType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type'
	);
	const firstAsBool = emitEffectiveBooleanValue(firstExpr, firstType, contextItemExpr, context);
	const [secondExpr, secondBucket] = emitOperand(ast, 'secondOperand', contextItemExpr, context);
	const logicalOpExpr = mapPartialCompilationResult(firstAsBool, (firstAsBool) => {
		const secondType = astHelper.getAttribute(
			astHelper.followPath(ast, ['firstOperand', '*']),
			'type'
		);
		const secondAsBool = emitEffectiveBooleanValue(
			secondExpr,
			secondType,
			contextItemExpr,
			context
		);
		return mapPartialCompilationResult(secondAsBool, (secondAsBool) =>
			acceptAst(
				`(${firstAsBool.code} ${logicalExprOperator} ${secondAsBool.code})`,
				{ type: GeneratedCodeBaseType.Value },
				[...firstAsBool.variables, ...secondAsBool.variables]
			)
		);
	});

	const bucket =
		logicalExprOperator === '&&'
			? intersectBuckets(firstBucket, secondBucket)
			: firstBucket === secondBucket
			? firstBucket
			: null;

	return [logicalOpExpr, bucket];
}
