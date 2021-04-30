import astHelper, { IAST } from '../parsing/astHelper';
import { axisEmittersByAxis } from './emitAxis';
import { acceptAst, EmittedJavaScript, rejectAst } from './EmittedJavaScript';
import emitTest, { kindTestNames } from './emitTest';

const baseExpressionAstNames = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
};

const baseExpressions = Object.values(baseExpressionAstNames);

const baseEmittersByExpression = {
	[baseExpressionAstNames.PATH_EXPR]: emitPathExpression,
	[baseExpressionAstNames.AND_OP]: emitAndExpression,
	[baseExpressionAstNames.OR_OP]: emitOrExpression,
};

function emitPredicates(predicatesAst: IAST, nestLevel: number): EmittedJavaScript {
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
		const predicateFunctionCall = `determinePredicateTruthValue(${predicateFunctionIdentifier}({type: 'node()', value: {node: contextItem${nestLevel}}}))`;
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

function emitSteps(stepsAst: IAST[]): EmittedJavaScript {
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
			const testAst = astHelper.getFirstChild(step, kindTestNames);

			// Only the innermost nested step returns a value.
			const nestedCode =
				i === stepsAst.length - 1
					? `i${nestLevel}++;\nreturn ready(adaptSingleJavaScriptValue(contextItem${nestLevel}, domFacade));`
					: `${emittedStepsCode}\ni${nestLevel}++;`;

			const emittedTest = emitTest(testAst, `contextItem${nestLevel}`);
			if (!emittedTest.isAstAccepted) {
				return emittedTest;
			}

			const emitAxis = axisEmittersByAxis[axis];
			if (emitAxis === undefined) {
				return rejectAst(`Unsupported: the ${axis} axis.`);
			}

			const emittedStep = emitAxis(
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
			return rejectAst('Unsupported: Filter expressions');
		}

		const lookups = astHelper.getChildren(step, 'lookup');
		if (lookups.length > 0) {
			return rejectAst('Unsupported: Lookups');
		}
	}
	const contextDeclaration = 'const contextItem0 = contextItem.value.node;';
	emittedSteps.code = contextDeclaration + emittedSteps.code;

	return acceptAst(emittedSteps.code, emittedSteps.variables);
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitPathExpression(ast: IAST, identifier: string): EmittedJavaScript {
	const emittedSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'));
	if (!emittedSteps.isAstAccepted) {
		return emittedSteps;
	}

	const pathExpressionCode = `
	function ${identifier}(contextItem) {
		if (!isSubtypeOf(contextItem.type, "node()")) {
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
): EmittedJavaScript {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const expressionAst = astHelper.getFirstChild(operand, baseExpressions);

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
function emitAndExpression(ast: IAST, identifier: string): EmittedJavaScript {
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
function emitOrExpression(ast: IAST, identifier: string): EmittedJavaScript {
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

export function emitBaseExpression(ast: IAST, identifier: string): EmittedJavaScript {
	const name = ast[0];
	const baseExpressionToEmit = baseEmittersByExpression[name];
	if (baseExpressionToEmit === undefined) {
		return rejectAst(`Unsupported: base expression ${name}`);
	}
	return baseExpressionToEmit(ast, identifier);
}
