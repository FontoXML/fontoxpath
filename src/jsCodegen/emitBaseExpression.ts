import astHelper, { IAST } from '../parsing/astHelper';
import { CompilationOptions } from './CompilationOptions';
import emitStep from './emitStep';
import emitTest, { tests } from './emitTest';
import { acceptAst, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

const baseExprAstNodes = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
};

const baseExpressions = Object.values(baseExprAstNodes);

function emitPredicates(
	predicatesAst: IAST,
	nestLevel: number,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	let evaluatePredicateConditionCode = '';
	const functionDeclarations = [];

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
			compilationOptions
		);
		if (compiledPredicate.isAstAccepted) {
			functionDeclarations.push(compiledPredicate.code);
		} else {
			return compiledPredicate;
		}
	}
	return acceptAst(evaluatePredicateConditionCode, functionDeclarations);
}

function emitSteps(
	stepsAst: IAST[],
	compilationOptions: CompilationOptions
): PartialCompilationResult {
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

	const emittedSteps = { variables: [], code: '' };
	for (let i = stepsAst.length - 1; i >= 0; i--) {
		const step = stepsAst[i];
		const nestLevel = i + 1;

		const predicatesAst = astHelper.getFirstChild(step, 'predicates');
		const emittedPredicates = emitPredicates(predicatesAst, nestLevel, compilationOptions);
		if (!emittedPredicates.isAstAccepted) {
			return emittedPredicates;
		}

		const axisAst = astHelper.getFirstChild(step, 'xpathAxis');
		if (axisAst) {
			const emittedStepsCode = emittedSteps.code;
			const testAst = astHelper.getFirstChild(step, tests);
			if (!testAst) {
				return rejectAst(`Unsupported: the step '${step}'.`);
			}

			// Only the innermost nested step returns a value.
			const nestedCode =
				i === stepsAst.length - 1
					? `i${nestLevel}++;\nreturn ready(adaptSingleJavaScriptValue(contextItem${nestLevel}, domFacade));`
					: `${emittedStepsCode}\ni${nestLevel}++;`;

			const emittedTest = emitTest(testAst, `contextItem${nestLevel}`, compilationOptions);
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

			emittedSteps.variables.push(...emittedStep.variables, ...emittedPredicates.variables);
			emittedSteps.code = emittedStep.code;
		} else {
			return rejectAst('Unsupported: filter expressions.');
		}

		const lookups = astHelper.getChildren(step, 'lookup');
		if (lookups.length > 0) {
			return rejectAst('Unsupported: lookups.');
		}
	}
	const contextDeclaration = 'const contextItem0 = contextItem;';
	emittedSteps.code = contextDeclaration + emittedSteps.code;

	return acceptAst(emittedSteps.code, emittedSteps.variables);
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitPathExpr(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	const emittedSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'), compilationOptions);
	if (!emittedSteps.isAstAccepted) {
		return emittedSteps;
	}

	const pathExprCode = `
	function ${identifier}(contextItem) {
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
	identifier: string,
	operandKind: 'firstOperand' | 'secondOperand',
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const exprAst = astHelper.getFirstChild(operand, baseExpressions);
	if (!exprAst) {
		return rejectAst('Unsupported: a base expression used with an operand.');
	}

	const baseExprIdentifier = identifier + operandKind;

	const baseExpr = emitBaseExpr(exprAst, baseExprIdentifier, compilationOptions);
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
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, compilationOptions, '&&');
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
function emitOrExpr(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, compilationOptions, '||');
}

function emitLogicalExpr(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions,
	logicalExprOperator: '&&' | '||'
) {
	const firstExpr = emitOperand(ast, identifier, firstOperandIdentifier, compilationOptions);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(ast, identifier, secondOperandIdentifier, compilationOptions);
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

export function emitBaseExpr(
	ast: IAST,
	identifier: string,
	compilationOptions: CompilationOptions
): PartialCompilationResult {
	const name = ast[0];

	switch (name) {
		case baseExprAstNodes.PATH_EXPR:
			return emitPathExpr(ast, identifier, compilationOptions);
		case baseExprAstNodes.AND_OP:
			return emitAndExpr(ast, identifier, compilationOptions);
		case baseExprAstNodes.OR_OP:
			return emitOrExpr(ast, identifier, compilationOptions);
		default:
			return rejectAst(`Unsupported: the base expression '${name}'.`);
	}
}
