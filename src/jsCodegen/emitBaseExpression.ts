import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { axisEmittersByAstNodeName } from './emitAxis';
import emitTest, { testAstNodes } from './emitTest';
import { acceptAst, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

const baseExpressionAstNodeNames = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
};

const baseExpressionAstNodes = Object.values(baseExpressionAstNodeNames);

const baseExpressionEmittersByAstNodeName = {
	[baseExpressionAstNodeNames.PATH_EXPR]: emitPathExpression,
	[baseExpressionAstNodeNames.AND_OP]: emitAndExpression,
	[baseExpressionAstNodeNames.OR_OP]: emitOrExpression,
};

function emitPredicates(predicatesAst: IAST, nestLevel: number): PartialCompilationResult {
	let evaluatePredicateConditionCode = '';
	const functionDeclarations = [];

	if (!predicatesAst) {
		return acceptAst(evaluatePredicateConditionCode, functionDeclarations);
	}

	const children = astHelper.getChildren(predicatesAst, '*');
	for (let i = 0; i < children.length; i++) {
		const predicate = children[i];
		const predicateFunctionIdentifier = `predicateExpression_step${nestLevel}_predicate${i}`;

		// Prepare condition used to determine if an axis should
		// return a node.
		const predicateFunctionCall = `determinePredicateTruthValue(${predicateFunctionIdentifier}({type: ${ValueType.NODE}, value: {node: contextItem${nestLevel}}}))`;
		if (i === 0) {
			evaluatePredicateConditionCode += predicateFunctionCall;
		} else {
			evaluatePredicateConditionCode = `${evaluatePredicateConditionCode} && ${predicateFunctionCall}`;
		}

		const compiledPredicate = emitBaseExpression(predicate, predicateFunctionIdentifier);
		if (compiledPredicate.isAstAccepted) {
			functionDeclarations.push(compiledPredicate.code);
		} else {
			return compiledPredicate;
		}
	}
	return acceptAst(evaluatePredicateConditionCode, functionDeclarations);
}

function emitSteps(stepsAst: IAST[]): PartialCompilationResult {
	if (stepsAst.length === 0) {
		return acceptAst(
			`
			if (!hasReturned) {
				hasReturned = true;
				return ready(contextItem);
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
		const emittedPredicates = emitPredicates(predicatesAst, nestLevel);
		if (!emittedPredicates.isAstAccepted) {
			return emittedPredicates;
		}

		const axisAst = astHelper.getFirstChild(step, ['xpathAxis']);
		if (axisAst) {
			const axis = astHelper.getTextContent(axisAst);

			const emittedStepsCode = emittedSteps.code;
			const testAst = astHelper.getFirstChild(step, testAstNodes);
			if (!testAst) {
				return rejectAst(`Unsupported: the step '${step}'.`);
			}

			// Only the innermost nested step returns a value.
			const nestedCode =
				i === stepsAst.length - 1
					? `i${nestLevel}++;\nreturn ready(adaptSingleJavaScriptValue(contextItem${nestLevel}, domFacade));`
					: `${emittedStepsCode}\ni${nestLevel}++;`;

			const emittedTest = emitTest(testAst, `contextItem${nestLevel}`);
			if (!emittedTest.isAstAccepted) {
				return emittedTest;
			}

			const emitAxis = axisEmittersByAstNodeName[axis];
			if (!emitAxis) {
				return rejectAst(`Unsupported: the axis '${axis}'.`);
			}

			const emittedStep = emitAxis(
				emittedTest.code,
				emittedPredicates.code,
				nestLevel,
				nestedCode
			);

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
	const contextDeclaration = 'const contextItem0 = contextItem.value.node;';
	emittedSteps.code = contextDeclaration + emittedSteps.code;

	return acceptAst(emittedSteps.code, emittedSteps.variables);
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitPathExpression(ast: IAST, identifier: string): PartialCompilationResult {
	const emittedSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'));
	if (!emittedSteps.isAstAccepted) {
		return emittedSteps;
	}

	const pathExpressionCode = `
	function ${identifier}(contextItem) {
		if (!contextItem) {
			throw XPDY0002("Context is needed to evaluate a given path expression.");
		}

		if (!isSubtypeOf(contextItem.type, ${ValueType.NODE})) {
			throw new Error("Context item must be subtype of node().");
		}
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

	return acceptAst(pathExpressionCode);
}

const firstOperandIdentifier = 'firstOperand';
const secondOperandIdentifier = 'secondOperand';

function emitCompiledOperand(
	ast: IAST,
	identifier: string,
	operandKind: string
): PartialCompilationResult {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const expressionAst = astHelper.getFirstChild(operand, baseExpressionAstNodes);

	if (!expressionAst) {
		return rejectAst('Unsupported: a base expression used with an operand.');
	}

	const expressionIdentifier = identifier + operandKind;

	const compiledExpression = emitBaseExpression(expressionAst, expressionIdentifier);
	if (!compiledExpression.isAstAccepted) {
		return compiledExpression;
	}

	return acceptAst(`determinePredicateTruthValue(${expressionIdentifier}(contextItem))`, [
		compiledExpression.code,
	]);
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
function emitAndExpression(ast: IAST, identifier: string): PartialCompilationResult {
	const firstCompiledExpression = emitCompiledOperand(ast, identifier, firstOperandIdentifier);
	if (!firstCompiledExpression.isAstAccepted) {
		return firstCompiledExpression;
	}

	const secondCompiledExpression = emitCompiledOperand(ast, identifier, secondOperandIdentifier);
	if (!secondCompiledExpression.isAstAccepted) {
		return secondCompiledExpression;
	}

	const andOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.variables.join('\n')}
		${secondCompiledExpression.variables.join('\n')}
		return ${firstCompiledExpression.code} && ${secondCompiledExpression.code}
	}
	`;
	return acceptAst(andOpCode);
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
function emitOrExpression(ast: IAST, identifier: string): PartialCompilationResult {
	const firstCompiledExpression = emitCompiledOperand(ast, identifier, firstOperandIdentifier);
	if (!firstCompiledExpression.isAstAccepted) {
		return firstCompiledExpression;
	}

	const secondCompiledExpression = emitCompiledOperand(ast, identifier, secondOperandIdentifier);
	if (!secondCompiledExpression.isAstAccepted) {
		return secondCompiledExpression;
	}

	const orOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.variables.join('\n')}
		${secondCompiledExpression.variables.join('\n')}
		return ${firstCompiledExpression.code} || ${secondCompiledExpression.code}
	}
	`;
	return acceptAst(orOpCode);
}

export function emitBaseExpression(ast: IAST, identifier: string): PartialCompilationResult {
	const name = ast[0];
	const emitBaseExpressionFunction = baseExpressionEmittersByAstNodeName[name];

	if (!emitBaseExpressionFunction) {
		return rejectAst(`Unsupported: the base expression '${name}'.`);
	}

	return emitBaseExpressionFunction(ast, identifier);
}
