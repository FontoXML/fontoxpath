import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { Bucket, intersectBuckets } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import emitAxis from './emitAxis';
import {
	emitAnd,
	emitEffectiveBooleanValue,
	mapPartialCompilationResult,
	mapPartialCompilationResultAndBucket,
} from './emitHelpers';
import emitTest, { tests } from './emitTest';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

function emitPredicate(
	predicateAst: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	const [expr, bucket] = context.emitBaseExpr(predicateAst, contextItemExpr, context);
	const type = astHelper.getAttribute(predicateAst, 'type');
	const asBool = emitEffectiveBooleanValue(expr, type, contextItemExpr, context);
	return [asBool, bucket];
}

/**
 * Determines for every path step if it should emit a node or not.
 *
 * @param predicatesAst AST node for the predicate.
 * @param nestLevel The nest level within the path expression.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the steps predicates.
 */
function emitPredicates(
	predicatesAst: IAST | null,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult | null, Bucket] {
	const predicateAsts = predicatesAst ? astHelper.getChildren(predicatesAst, '*') : [];
	return predicateAsts.reduce<[PartialCompilationResult | null, Bucket]>(
		([previousExpr, previousBucket], predicateAst) => {
			if (!previousExpr) {
				return emitPredicate(predicateAst, contextItemExpr, context);
			}
			let combinedBucket = previousBucket;
			return mapPartialCompilationResultAndBucket(previousExpr, (previousExpr) => {
				const [predicateExpr, bucket] = emitPredicate(
					predicateAst,
					contextItemExpr,
					context
				);
				combinedBucket = intersectBuckets(previousBucket, bucket);
				return [
					mapPartialCompilationResult(predicateExpr, (predicateExpr) =>
						acceptAst(
							`${previousExpr.code} && ${predicateExpr.code}`,
							{ type: GeneratedCodeBaseType.Value },
							[...previousExpr.variables, ...predicateExpr.variables]
						)
					),
					combinedBucket,
				];
			});
		},
		[null, null]
	);
}

/**
 * Takes the step AST's of a path expression and turns it into runnable JavaScript code.
 */
function emitSteps(
	stepsAst: IAST[],
	contextItemCanBeAttribute: boolean,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	if (stepsAst.length === 0) {
		return [
			mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
				acceptAst(
					`yield ${contextItemExpr.code};`,
					{ type: GeneratedCodeBaseType.Statement },
					contextItemExpr.variables
				)
			),
			null,
		];
	}

	// A step is constructed as follows:
	// for (stepContextItemExpr of axis) {
	//     test code for step, continue if no match
	//     predicates for step, continue if no match
	//     nested steps
	// }
	// This recurses over steps to build that nested structure. Once there are no more nested steps
	// this hits the case above which outputs the single yield statement.

	const [stepAst, ...restStepsAst] = stepsAst;

	const lookupAsts = astHelper.getChildren(stepAst, 'lookup');
	if (lookupAsts.length > 0) {
		return [rejectAst('Unsupported: lookups'), null];
	}
	const axisAst = astHelper.getFirstChild(stepAst, 'xpathAxis');
	if (!axisAst) {
		return [rejectAst('Unsupported: filter expressions'), null];
	}
	const testAst = astHelper.getFirstChild(stepAst, tests);
	if (!testAst) {
		return [rejectAst('Unsupported test in step'), null];
	}
	const predicatesAst = astHelper.getFirstChild(stepAst, 'predicates');

	const stepContextItemExpr = context.getNewIdentifier('contextItem');

	// TODO: may be better to annotate steps instead to narrow down types?
	const axisType = astHelper.getTextContent(axisAst);
	const stepContextItemCanBeAttribute =
		axisType === 'attribute' || (axisType === 'self' && contextItemCanBeAttribute);
	const [testExpr, testBucket] = emitTest(
		testAst,
		stepContextItemCanBeAttribute,
		stepContextItemExpr,
		context
	);

	const [predicatesExpr, predicatesBucket] = emitPredicates(
		predicatesAst,
		stepContextItemExpr,
		context
	);

	const combinedConditionExpr =
		predicatesExpr === null ? testExpr : emitAnd(testExpr, predicatesExpr);

	const combinedConditionBucket = intersectBuckets(testBucket, predicatesBucket);

	const [nestedStepsCode, _] = emitSteps(
		restStepsAst,
		stepContextItemCanBeAttribute,
		stepContextItemExpr,
		context
	);

	return emitAxis(
		axisAst,
		combinedConditionExpr,
		combinedConditionBucket,
		nestedStepsCode,
		stepContextItemExpr,
		contextItemExpr
	);
}

function emitRootExpr(
	contextItemExpr: PartialCompilationResult,
	_context: CodeGenContext
): PartialCompilationResult {
	return mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
		acceptAst(
			`(function () {
				let n = ${contextItemExpr.code};
				while (n.nodeType !== /*DOCUMENT_NODE*/${NODE_TYPES.DOCUMENT_NODE}) {
					n = domFacade.getParentNode(n);
					if (n === null) {
						throw new Error('XPDY0050: the root node of the context node is not a document node.');
					}
				}
				return n;
			})()`,
			{ type: GeneratedCodeBaseType.Value },
			contextItemExpr.variables
		)
	);
}

/**
 * Takes a path expression AST node and turns it into a javascript function.
 * Path expression can be used to locate nodes within trees and they
 * consist of a series of one or more steps.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
 */
export function emitPathExpr(
	ast: IAST,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	const contextItemExpr = context.getNewIdentifier('contextItem');
	// Find the root node from the context.
	const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
	const rootExpr = isAbsolute
		? context.getIdentifierFor(emitRootExpr(contextItemExpr, context), 'root')
		: contextItemExpr;
	const [stepsCode, bucket] = emitSteps(
		astHelper.getChildren(ast, 'stepExpr'),
		!isAbsolute,
		rootExpr,
		context
	);
	const generatorExpr = mapPartialCompilationResult(stepsCode, (stepsCode) =>
		acceptAst(
			`(function* (${contextItemExpr.code}) {
			${stepsCode.variables.join('\n')}
			${stepsCode.code}
		})`,
			{ type: GeneratedCodeBaseType.Generator },
			[]
		)
	);
	return [generatorExpr, bucket];
}
