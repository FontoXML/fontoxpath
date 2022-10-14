import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { Bucket, intersectBuckets } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import emitAxis, { axisAstNodes } from './emitAxis';
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
 */
function emitPredicates(
	predicatesAst: IAST | null,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult | null, Bucket] {
	const predicateAsts = predicatesAst ? astHelper.getChildren(predicatesAst, '*') : [];
	const [combinedPredicatesExpr, bucket] = predicateAsts.reduce<
		[PartialCompilationResult | null, Bucket]
	>(
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

	return [
		// Make predicate variables evaluate lazily so the test is always checked first
		combinedPredicatesExpr
			? mapPartialCompilationResult(combinedPredicatesExpr, (combinedPredicatesExpr) =>
					acceptAst(
						`(function () {
							${combinedPredicatesExpr.variables.join('\n')}
							return ${combinedPredicatesExpr.code};
						})()`,
						{ type: GeneratedCodeBaseType.Value },
						[]
					)
			  )
			: null,
		bucket,
	];
}

/**
 * Takes the step AST's of a path expression and turns it into runnable JavaScript code.
 */
function emitSteps(
	stepAsts: IAST[],
	contextItemCanBeAttribute: boolean,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	if (stepAsts.length === 0) {
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

	const [stepAst, ...restStepAsts] = stepAsts;

	const lookupAsts = astHelper.getChildren(stepAst, 'lookup');
	if (lookupAsts.length > 0) {
		return [rejectAst('Unsupported: lookups'), null];
	}

	// Every step introduces a context item for its test and predicates
	const stepContextItemExpr = context.getNewIdentifier('contextItem');

	const predicatesAst = astHelper.getFirstChild(stepAst, 'predicates');
	const [predicatesExpr, predicatesBucket] = emitPredicates(
		predicatesAst,
		stepContextItemExpr,
		context
	);

	const axisAst = astHelper.getFirstChild(stepAst, 'xpathAxis');
	if (axisAst) {
		const testAst = astHelper.getFirstChild(stepAst, tests);
		if (!testAst) {
			return [rejectAst('Unsupported test in step'), null];
		}

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

		const combinedConditionExpr =
			predicatesExpr === null ? testExpr : emitAnd(testExpr, predicatesExpr);

		const combinedConditionBucket = intersectBuckets(testBucket, predicatesBucket);

		const [nestedStepsCode, _] = emitSteps(
			restStepAsts,
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

	// step may contain a filterExpr instead
	const filterExprAst = astHelper.followPath(stepAst, ['filterExpr', '*']);
	if (!filterExprAst) {
		return [rejectAst('Unsupported: unknown step type'), null];
	}

	// Compile the expression
	const [filterExpr, filterBucket] = context.emitBaseExpr(
		filterExprAst,
		contextItemExpr,
		context
	);
	// Assign it to the stepContextItem variable
	const filterExprAsStepContextItemExpr = mapPartialCompilationResult(filterExpr, (filterExpr) =>
		acceptAst(
			`const ${stepContextItemExpr.code} = ${filterExpr.code};`,
			{ type: GeneratedCodeBaseType.Statement },
			[...stepContextItemExpr.variables, ...filterExpr.variables]
		)
	);

	// If there are following steps, the result of the expression must be a node
	const filterExprWithCheck =
		restStepAsts.length === 0
			? filterExprAsStepContextItemExpr
			: mapPartialCompilationResult(
					filterExprAsStepContextItemExpr,
					(filterExprAsStepContextItemExpr) =>
						acceptAst(
							`${filterExprAsStepContextItemExpr.code}
							if (${stepContextItemExpr.code} !== null && !${stepContextItemExpr.code}.nodeType) {
								throw new Error('XPTY0019: The result of E1 in a path expression E1/E2 should evaluate to a sequence of nodes.');
							}`,
							{ type: GeneratedCodeBaseType.Statement },
							filterExprAsStepContextItemExpr.variables
						)
			  );

	return mapPartialCompilationResultAndBucket(filterExprWithCheck, (filterExprWithCheck) => {
		// Compile nested steps
		const [nestedStepsCode, _] = emitSteps(restStepAsts, true, stepContextItemExpr, context);

		const nestedCode =
			predicatesExpr === null
				? nestedStepsCode
				: mapPartialCompilationResult(predicatesExpr, (predicatesExpr) =>
						mapPartialCompilationResult(nestedStepsCode, (nestedStepsCode) =>
							acceptAst(
								`if (${predicatesExpr.code}) {
									${nestedStepsCode.variables.join('\n')}
									${nestedStepsCode.code}
								}`,
								{ type: GeneratedCodeBaseType.Statement },
								predicatesExpr.variables
							)
						)
				  );

		// Combine
		return [
			mapPartialCompilationResult(nestedCode, (nestedCode) =>
				acceptAst(
					`${filterExprWithCheck.code}
					${nestedCode.variables.join('\n')}
					${nestedCode.code}`,
					{ type: GeneratedCodeBaseType.Statement },
					filterExprWithCheck.variables
				)
			),
			filterBucket,
		];
	});
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

function emitSingleSelfPathExpr(
	stepAst: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	return mapPartialCompilationResultAndBucket(contextItemExpr, (contextItemExpr) => {
		const lookupAsts = astHelper.getChildren(stepAst, 'lookup');
		if (lookupAsts.length > 0) {
			return [rejectAst('Unsupported: lookups'), null];
		}
		const predicatesAst = astHelper.getFirstChild(stepAst, 'predicates');
		const [predicatesExpr, predicatesBucket] = emitPredicates(
			predicatesAst,
			contextItemExpr,
			context
		);
		const testAst = astHelper.getFirstChild(stepAst, tests);
		if (!testAst) {
			return [rejectAst('Unsupported test in step'), null];
		}
		const [testExpr, testBucket] = emitTest(testAst, true, contextItemExpr, context);
		const combinedConditionExpr =
			predicatesExpr === null ? testExpr : emitAnd(testExpr, predicatesExpr);
		const combinedConditionBucket = intersectBuckets(testBucket, predicatesBucket);

		return [
			mapPartialCompilationResult(combinedConditionExpr, (combinedConditionExpr) =>
				acceptAst(
					`((${combinedConditionExpr.code}) ? ${contextItemExpr.code} : null)`,
					{ type: GeneratedCodeBaseType.Value },
					[...contextItemExpr.variables, ...combinedConditionExpr.variables]
				)
			),
			combinedConditionBucket,
		];
	});
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
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	// Optimized code for single-self-axis paths, which are used a lot in selectors and don't need
	// a generator as they only test the context node
	const stepAsts = astHelper.getChildren(ast, 'stepExpr');
	if (stepAsts.length === 1) {
		const axisAst = astHelper.getFirstChild(stepAsts[0], 'xpathAxis');
		if (axisAst && astHelper.getTextContent(axisAst) === axisAstNodes.SELF) {
			return emitSingleSelfPathExpr(stepAsts[0], contextItemExpr, context);
		}
	}

	// Other paths compile into a generator which is parameterized over contextItemExpr
	const contextItemArgExpr = context.getNewIdentifier('contextItem');
	// Find the root node from the context.
	const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
	const rootExpr = isAbsolute
		? context.getIdentifierFor(emitRootExpr(contextItemArgExpr, context), 'root')
		: contextItemArgExpr;
	const [stepsCode, bucket] = emitSteps(stepAsts, !isAbsolute, rootExpr, context);
	const generatorExpr = mapPartialCompilationResult(stepsCode, (stepsCode) =>
		acceptAst(
			`(function* (${contextItemArgExpr.code}) {
			${stepsCode.variables.join('\n')}
			${stepsCode.code}
		})`,
			{ type: GeneratedCodeBaseType.Generator },
			[]
		)
	);
	return [generatorExpr, bucket];
}
