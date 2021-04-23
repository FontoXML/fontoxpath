import astHelper, { IAST } from '../parsing/astHelper';
import { EmittedJavaScriptCode } from './CompiledJavaScript';
import { stepEmittersByAxis } from './emitAxes';
import emitTest, { determineTypeFromTest, kindTestNames } from './emitTest';

const baseExpressionNames = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
	EQUAL_OP: 'equalOp',
};

const baseExpressions = Object.values(baseExpressionNames);

const baseEmittersByExpression = {
	[baseExpressionNames.PATH_EXPR]: emitPathExpression,
	[baseExpressionNames.AND_OP]: emitAndExpression,
	[baseExpressionNames.OR_OP]: emitOrExpression,
};

function emitPredicates(predicatesAst: IAST, nestLevel: number): EmittedJavaScriptCode {
	let evaluatePredicateConditionCode = '';
	const functionDeclarations = [];

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

		functionDeclarations.push(compiledPredicate.code);
	}
	return { variables: functionDeclarations, code: evaluatePredicateConditionCode };
}

function emitSteps(stepsAst: IAST[]): EmittedJavaScriptCode {
	if (stepsAst.length === 0) {
		return {
			variables: ['let hasReturned = false;'],
			code: `
			if (!hasReturned) {
				hasReturned = true;
				return ready(contextItem);
			}
			`,
		};
	}

	const initialCompiledSteps: EmittedJavaScriptCode = { variables: [], code: '' };

	const compiledSteps = stepsAst.reduceRight(
		(
			{ variables, code: accumulatedStepsCode }: EmittedJavaScriptCode,
			step: IAST,
			index: number
		) => {
			const nestLevel = index + 1;

			const predicatesAst = astHelper.getFirstChild(step, 'predicates');
			const predicates = predicatesAst ? emitPredicates(predicatesAst, nestLevel) : undefined;

			const axisAst = astHelper.getFirstChild(step, ['xpathAxis']);
			if (axisAst) {
				const axis = astHelper.getTextContent(axisAst);

				let nestedCode: string;
				const testAst = astHelper.getFirstChild(step, kindTestNames);
				if (index === stepsAst.length - 1) {
					const returnType = determineTypeFromTest(testAst);
					nestedCode = `i${nestLevel}++;\nreturn ready({ type: "${returnType}", value: { node: contextItem${nestLevel} }});`;
				} else {
					nestedCode = `${accumulatedStepsCode}\ni${nestLevel}++;`;
				}

				const testCode = emitTest(testAst, `contextItem${nestLevel}`);

				const emitStep = stepEmittersByAxis[axis];

				if (emitStep === undefined) {
					throw new Error(`Unsupported: the ${axis} axis.`);
				}

				const emittedStep = emitStep(
					testCode,
					predicates ? predicates.code : '',
					nestLevel,
					nestedCode
				);

				variables.push(
					...emittedStep.variables,
					...(predicates ? predicates.variables : [])
				);
				accumulatedStepsCode = emittedStep.code;
			} else {
				throw new Error('Unsupported: no axis AST.');
			}

			const lookups = astHelper.getChildren(step, 'lookup');
			if (lookups.length > 0) {
				throw new Error('Unsupported: lookups.');
			}

			return { variables, code: accumulatedStepsCode };
		},
		initialCompiledSteps
	) as EmittedJavaScriptCode;

	compiledSteps.code = 'const contextItem0 = contextItem.value.node;' + compiledSteps.code;

	return compiledSteps;
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitPathExpression(ast: IAST, identifier: string): EmittedJavaScriptCode {
	const compiledSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'));

	const pathExpressionCode = `
	function ${identifier}(contextItem) {
		if (!isSubtypeOf(contextItem.type, "node()")) {
			throw new Error("Context item must be subtype of node().");
		}
		${compiledSteps.variables.join('\n')}
		const next = () => {
			${compiledSteps.code}
			return DONE_TOKEN;
		};
		return {
			next,
			[Symbol.iterator]() { return this; }
		};
	}
	`;

	return { code: pathExpressionCode, variables: [] };
}

const firstOp = 'firstOperand';
const secondOp = 'secondOperand';

function emitCompiledOperand(
	ast: IAST,
	identifier: string,
	operandKind: string
): EmittedJavaScriptCode {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const expressionAst = astHelper.getFirstChild(operand, baseExpressions);

	const expressionIdentifier = identifier + operandKind;

	const compiledExpression = emitBaseExpression(expressionAst, expressionIdentifier);

	return {
		code: `determinePredicateTruthValue(${expressionIdentifier}(contextItem))`,
		variables: [compiledExpression.code],
	};
}

function emitCompiledOperands(ast: IAST, identifier: string) {
	return [
		emitCompiledOperand(ast, identifier, firstOp),
		emitCompiledOperand(ast, identifier, secondOp),
	];
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
function emitAndExpression(ast: IAST, identifier: string): EmittedJavaScriptCode {
	const [firstCompiledExpression, secondCompiledExpression] = emitCompiledOperands(
		ast,
		identifier
	);

	const andOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.variables.join('\n')}
		${secondCompiledExpression.variables.join('\n')}
		return ${firstCompiledExpression.code} && ${secondCompiledExpression.code}
	}
	`;
	return { code: andOpCode, variables: [] };
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
function emitOrExpression(ast: IAST, identifier: string): EmittedJavaScriptCode {
	const [firstCompiledExpression, secondCompiledExpression] = emitCompiledOperands(
		ast,
		identifier
	);

	const orOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.variables.join('\n')}
		${secondCompiledExpression.variables.join('\n')}
		return ${firstCompiledExpression.code} || ${secondCompiledExpression.code}
	}
	`;
	return { code: orOpCode, variables: [] };
}

export function emitBaseExpression(ast: IAST, identifier: string): EmittedJavaScriptCode {
	const name = ast[0];
	const baseExpressionToEmit = baseEmittersByExpression[name];
	if (baseExpressionToEmit === undefined) {
		throw new Error(`Unsupported: base expression ${name}`);
	}
	return baseExpressionToEmit(ast, identifier);
}
