import { NODE_TYPES } from '../domFacade/ConcreteNode';
import astHelper, { IAST } from '../parsing/astHelper';
import emitStep from './emitStep';
import emitTest, { tests } from './emitTest';
import escapeJavaScriptString from './escapeJavaScriptString';
import {
	acceptAst,
	FunctionIdentifier,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';
import { StaticContext } from './StaticContext';

const baseExprAstNodes = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
	STRING_LIT_EXPR: 'stringConstantExpr',
};

const baseExpressions = Object.values(baseExprAstNodes);

function emitPredicates(
	predicatesAst: IAST,
	nestLevel: number,
	staticContext: StaticContext
): PartialCompilationResult {
	let evaluatePredicateConditionCode = '';
	const functionDeclarations: string[] = [];

	if (!predicatesAst) {
		return acceptAst(evaluatePredicateConditionCode, functionDeclarations);
	}

	const children = astHelper.getChildren(predicatesAst, '*');
	for (let i = 0; i < children.length; i++) {
		const predicate = children[i];
		const predicateFunctionIdentifier = `step${nestLevel}_predicate${i}`;

		// Prepare condition used to determine if an axis should
		// return a node.
		const predicateFunctionCall = `determinePredicateTruthValue(${predicateFunctionIdentifier}(contextItem${nestLevel}))`;
		if (i === 0) {
			evaluatePredicateConditionCode += predicateFunctionCall;
		} else {
			evaluatePredicateConditionCode = `${evaluatePredicateConditionCode} && ${predicateFunctionCall}`;
		}

		const compiledPredicate = emitBaseExpr(
			predicate,
			predicateFunctionIdentifier,
			staticContext
		);
		if (compiledPredicate.isAstAccepted) {
			functionDeclarations.push(compiledPredicate.code);
		} else {
			return compiledPredicate;
		}
	}
	return acceptAst(evaluatePredicateConditionCode, functionDeclarations);
}

function emitSteps(stepsAst: IAST[], staticContext: StaticContext): PartialCompilationResult {
	if (stepsAst.length === 0) {
		return acceptAst(
			`
			if (!hasReturned) {
				hasReturned = true;
				return ready(adaptSingleJavaScriptValue(contextItem, domFacade));
			}
			`,
			['let hasReturned = false;']
		);
	}

	let emittedCode = '';
	const emittedVariables: string[] = [];
	for (let i = stepsAst.length - 1; i >= 0; i--) {
		const step = stepsAst[i];
		const nestLevel = i + 1;

		const predicatesAst = astHelper.getFirstChild(step, 'predicates');
		const emittedPredicates = emitPredicates(predicatesAst, nestLevel, staticContext);
		if (!emittedPredicates.isAstAccepted) {
			return emittedPredicates;
		}

		const axisAst = astHelper.getFirstChild(step, 'xpathAxis');
		if (axisAst) {
			const emittedStepsCode = emittedCode;
			const testAst = astHelper.getFirstChild(step, tests);
			if (!testAst) {
				return rejectAst(`Unsupported: the test in the '${step}' step.`);
			}

			// Only the innermost nested step returns a value.
			const nestedCode =
				i === stepsAst.length - 1
					? `i${nestLevel}++;\nreturn ready(adaptSingleJavaScriptValue(contextItem${nestLevel}, domFacade));`
					: `${emittedStepsCode}\ni${nestLevel}++;`;

			const emittedTest = emitTest(testAst, `contextItem${nestLevel}`, staticContext);
			if (!emittedTest.isAstAccepted) {
				return emittedTest;
			}

			const emittedStep = emitStep(
				axisAst,
				emittedTest.code,
				emittedPredicates.code,
				nestLevel,
				nestedCode
			);
			if (!emittedStep.isAstAccepted) {
				return emittedStep;
			}

			emittedVariables.push(...emittedStep.variables, ...emittedPredicates.variables);
			emittedCode = emittedStep.code;
		} else {
			return rejectAst('Unsupported: filter expressions.');
		}

		const lookups = astHelper.getChildren(step, 'lookup');
		if (lookups.length > 0) {
			return rejectAst('Unsupported: lookups.');
		}
	}
	const contextDeclaration = 'const contextItem0 = contextItem;';
	emittedCode = contextDeclaration + emittedCode;

	return acceptAst(emittedCode, emittedVariables);
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitPathExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: StaticContext
): PartialCompilationResult {
	// Find the root node from the context.
	const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
	let absoluteCode = '';
	if (isAbsolute) {
		absoluteCode = `
		let documentNode = contextItem;
		while (documentNode.nodeType !== ${NODE_TYPES.DOCUMENT_NODE}) {
			documentNode = domFacade.getParentNode(documentNode);
			if (documentNode === null) {
				throw new Error('XPDY0050: the root node of the context node is not a document node.');
			}
		}
		contextItem = documentNode;
		`;
	}

	const emittedSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'), staticContext);
	if (!emittedSteps.isAstAccepted) {
		return emittedSteps;
	}

	const pathExprCode = `
	function ${identifier}(contextItem) {
		${absoluteCode}
		${emittedSteps.variables.join('\n')}
		const next = () => {
			${emittedSteps.code}
			return DONE_TOKEN;
		};
		return {
			next,
			[Symbol.iterator]() { return this; }
		};
	}
	`;

	return acceptAst(pathExprCode);
}

const firstOperandIdentifier = 'firstOperand';
const secondOperandIdentifier = 'secondOperand';

function emitOperand(
	ast: IAST,
	identifier: FunctionIdentifier,
	operandKind: 'firstOperand' | 'secondOperand',
	staticContext: StaticContext
): PartialCompilationResult {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const exprAst = astHelper.getFirstChild(operand, baseExpressions);
	if (!exprAst) {
		return rejectAst('Unsupported: a base expression used with an operand.');
	}

	const baseExprIdentifier = identifier + operandKind;

	const baseExpr = emitBaseExpr(exprAst, baseExprIdentifier, staticContext);
	if (!baseExpr.isAstAccepted) {
		return baseExpr;
	}

	return acceptAst(`determinePredicateTruthValue(${baseExprIdentifier}(contextItem))`, [
		baseExpr.code,
	]);
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
function emitAndExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: StaticContext
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, staticContext, '&&');
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
function emitOrExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: StaticContext
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, staticContext, '||');
}

function emitLogicalExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: StaticContext,
	logicalExprOperator: '&&' | '||'
): PartialCompilationResult {
	const firstExpr = emitOperand(ast, identifier, firstOperandIdentifier, staticContext);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(ast, identifier, secondOperandIdentifier, staticContext);
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	const andOpCode = `
	function ${identifier}(contextItem) {
		${firstExpr.variables.join('\n')}
		${secondExpr.variables.join('\n')}
		return ${firstExpr.code} ${logicalExprOperator} ${secondExpr.code}
	}
	`;
	return acceptAst(andOpCode);
}

function emitStringLiteralExpression(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: StaticContext
): PartialCompilationResult {
	let text = astHelper.getFirstChild(ast, 'value')[1] as string;
	text = escapeJavaScriptString(text);
	return acceptAst(`
	function ${identifier}(contextItem) {
		return '${text}';
	}
	`);
}

// Compile AST to base expression contained in a function named as the given
// identifier.
export function emitBaseExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: StaticContext
): PartialCompilationResult {
	const name = ast[0];

	switch (name) {
		case baseExprAstNodes.PATH_EXPR:
			return emitPathExpr(ast, identifier, staticContext);
		case baseExprAstNodes.AND_OP:
			return emitAndExpr(ast, identifier, staticContext);
		case baseExprAstNodes.OR_OP:
			return emitOrExpr(ast, identifier, staticContext);
		case baseExprAstNodes.STRING_LIT_EXPR:
			return emitStringLiteralExpression(ast, identifier, staticContext);
		default:
			return rejectAst(`Unsupported: the base expression '${name}'.`);
	}
}
