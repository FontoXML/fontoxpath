import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { Bucket, intersectBuckets } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import emitStep from './emitStep';
import emitTest, { tests } from './emitTest';
import {
	acceptAst,
	FunctionIdentifier,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';
import { determinePredicateTruthValue } from './runtimeLib';

/**
 * Determines for every path step if it should emit a node or not.
 *
 * @param predicatesAst AST node for the predicate.
 * @param nestLevel The nest level within the path expression.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the steps predicates.
 */
function emitPredicates(
	predicatesAst: IAST,
	nestLevel: number,
	staticContext: CodeGenContext
): [PartialCompilationResult, Bucket] {
	let evaluatePredicateConditionCode = '';
	const functionDeclarations: string[] = [];

	if (!predicatesAst) {
		return [acceptAst(``, { type: GeneratedCodeBaseType.None }, functionDeclarations), null];
	}

	const children = astHelper.getChildren(predicatesAst, '*');
	let intersectingPredicateBucket = null;
	for (let i = 0; i < children.length; i++) {
		const predicate = children[i];
		const predicateFunctionIdentifier = `step${nestLevel}_predicate${i}`;

		const [compiledPredicate, bucket] = emitBaseExpr(
			predicate,
			predicateFunctionIdentifier,
			staticContext
		);

		if (!compiledPredicate.isAstAccepted) {
			return [compiledPredicate, null];
		}
		intersectingPredicateBucket = intersectBuckets(intersectingPredicateBucket, bucket);

		// Prepare condition used to determine if an axis should
		// return a node.
		const predicateFunctionCall = determinePredicateTruthValue(
			predicateFunctionIdentifier,
			'',
			compiledPredicate.generatedCodeType,
			`contextItem${nestLevel}`
		);

		if (!predicateFunctionCall.isAstAccepted) {
			return [predicateFunctionCall, null];
		}

		if (i === 0) {
			evaluatePredicateConditionCode += predicateFunctionCall.code;
		} else {
			evaluatePredicateConditionCode = `${evaluatePredicateConditionCode} && ${predicateFunctionCall.code}`;
		}

		functionDeclarations.push(compiledPredicate.code);
	}
	return [
		acceptAst(
			evaluatePredicateConditionCode,
			{ type: GeneratedCodeBaseType.Value },
			functionDeclarations
		),
		intersectingPredicateBucket,
	];
}

/**
 * Takes the step AST's of a path expression and turns it into runnable JavaScript code.
 *
 * @param stepsAst AST nodes of the path expression steps
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the path expression steps.
 */
function emitSteps(
	stepsAst: IAST[],
	staticContext: CodeGenContext
): [PartialCompilationResult, Bucket] {
	if (stepsAst.length === 0) {
		return [acceptAst(`yield contextItem;`, { type: GeneratedCodeBaseType.Statement }), null];
	}

	let emittedCode = '';
	const emittedVariables: string[] = [];
	let intersectingBucket: Bucket = null;
	for (let i = stepsAst.length - 1; i >= 0; i--) {
		const step = stepsAst[i];
		const nestLevel = i + 1;

		const predicatesAst = astHelper.getFirstChild(step, 'predicates');
		const [emittedPredicates, predicateBucket] = emitPredicates(
			predicatesAst,
			nestLevel,
			staticContext
		);
		if (!emittedPredicates.isAstAccepted) {
			return [emittedPredicates, null];
		}

		const axisAst = astHelper.getFirstChild(step, 'xpathAxis');
		if (axisAst) {
			const emittedStepsCode = emittedCode;
			const testAst = astHelper.getFirstChild(step, tests);
			if (!testAst) {
				return [rejectAst(`Unsupported: the test in the '${step}' step.`), null];
			}

			// Only the innermost nested step returns a value.
			const nestedCode =
				i === stepsAst.length - 1 ? `yield contextItem${nestLevel};` : emittedStepsCode;

			const [emittedTest, testBucket] = emitTest(
				testAst,
				`contextItem${nestLevel}`,
				staticContext
			);
			if (!emittedTest.isAstAccepted) {
				return [emittedTest, null];
			}

			const intersectingBucketForStep = intersectBuckets(testBucket, predicateBucket);

			const [emittedStep, stepBucket] = emitStep(
				axisAst,
				emittedTest.code,
				emittedPredicates.code,
				nestLevel,
				nestedCode,
				intersectingBucketForStep
			);
			if (!emittedStep.isAstAccepted) {
				return [emittedStep, null];
			}

			if (i === 0) {
				// For the first iteration, the bucket of the steps is actually the bucket for the whole thing
				intersectingBucket = stepBucket;
			}

			emittedVariables.push(
				...(emittedStep.variables || []),
				...(emittedPredicates.variables || [])
			);
			emittedCode = emittedStep.code;
		} else {
			return [rejectAst('Unsupported: filter expressions.'), null];
		}

		const lookups = astHelper.getChildren(step, 'lookup');
		if (lookups.length > 0) {
			return [rejectAst('Unsupported: lookups.'), null];
		}
	}
	const contextDeclaration = 'const contextItem0 = contextItem;';
	emittedCode = contextDeclaration + emittedCode;

	return [
		acceptAst(emittedCode, { type: GeneratedCodeBaseType.Statement }, emittedVariables),
		intersectingBucket,
	];
}

/**
 * Takes a path expression AST node and turns it into a javascript function.
 * Path expression can be used to locate nodes within trees and they
 * consist of a series of one or more steps.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
 *
 * @param ast AST node of the path expression
 * @param identifier Function identifier for the emitted code.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the path expression AST node.
 */
export function emitPathExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): [PartialCompilationResult, Bucket] {
	// Find the root node from the context.
	const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
	let absoluteCode = '';
	if (isAbsolute) {
		absoluteCode = `
		let documentNode = contextItem;
		while (documentNode.nodeType !== /*DOCUMENT_NODE*/${NODE_TYPES.DOCUMENT_NODE}) {
			documentNode = domFacade.getParentNode(documentNode);
			if (documentNode === null) {
				throw new Error('XPDY0050: the root node of the context node is not a document node.');
			}
		}
		contextItem = documentNode;
		`;
	}

	const [emittedSteps, bucket] = emitSteps(astHelper.getChildren(ast, 'stepExpr'), staticContext);
	if (!emittedSteps.isAstAccepted) {
		return [emittedSteps, null];
	}

	const pathExprCode = `
	function* ${identifier}(contextItem) {
		${absoluteCode}
		${emittedSteps.variables ? emittedSteps.variables.join('\n') : ''}
		${emittedSteps.code}
	}
	`;

	return [
		acceptAst(pathExprCode, {
			type: GeneratedCodeBaseType.Function,
			returnType: { type: GeneratedCodeBaseType.Iterator },
		}),
		bucket,
	];
}
