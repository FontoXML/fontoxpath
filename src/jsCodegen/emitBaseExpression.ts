import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitGeneralCompare, emitValueCompare } from './emitCompare';
import emitStep from './emitStep';
import emitTest, { tests } from './emitTest';
import escapeJavaScriptString from './escapeJavaScriptString';
import {
	acceptAst,
	FunctionIdentifier,
	getCompiledValueCode,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

/**
 * The currently supported expressions for code generation.
 */
const baseExprAstNodes = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
	STRING_LIT_EXPR: 'stringConstantExpr',
};

const baseExpressions = Object.values(baseExprAstNodes);

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
): PartialCompilationResult {
	let evaluatePredicateConditionCode = '';
	const functionDeclarations: string[] = [];

	if (!predicatesAst) {
		return acceptAst(``, false, functionDeclarations);
	}

	const children = astHelper.getChildren(predicatesAst, '*');
	for (let i = 0; i < children.length; i++) {
		const predicate = children[i];
		const predicateFunctionIdentifier = `step${nestLevel}_predicate${i}`;

		// Prepare condition used to determine if an axis should
		// return a node.
		const predicateFunctionCall = `determinePredicateTruthValue(${getCompiledValueCode(
			predicateFunctionIdentifier,
			true,
			`contextItem${nestLevel}`
		)})`;
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
	return acceptAst(evaluatePredicateConditionCode, true, functionDeclarations);
}

/**
 * Takes the step AST's of a path expression and turns it into runnable JavaScript code.
 *
 * @param stepsAst AST nodes of the path expression steps
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the path expression steps.
 */
function emitSteps(stepsAst: IAST[], staticContext: CodeGenContext): PartialCompilationResult {
	if (stepsAst.length === 0) {
		return acceptAst(
			`
			if (!hasReturned) {
				hasReturned = true;
				return ready(adaptSingleJavaScriptValue(contextItem, domFacade));
			}
			`,
			false,
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

	return acceptAst(emittedCode, true, emittedVariables);
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
function emitPathExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
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

	return acceptAst(pathExprCode, true);
}

const FIRST_OPERAND = 'firstOperand';
const SECOND_OPERAND = 'secondOperand';

/**
 * Retrieves the first or second operand for an operator AST node and wraps
 * it in a function.
 *
 * @param ast Base AST node for which get either the first or second operand.
 * @param identifier Function identifier for the emitted code.
 * @param operandKind Indicates if it's the first or second operand for an operator.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the operand.
 */
function emitOperand(
	ast: IAST,
	identifier: FunctionIdentifier,
	operandKind: 'firstOperand' | 'secondOperand',
	staticContext: CodeGenContext,
	targetType?: ValueType
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
	if (targetType === ValueType.XSBOOLEAN) {
		return acceptAst(
			`determinePredicateTruthValue(${getCompiledValueCode(
				baseExprIdentifier,
				baseExpr.isFunction
			)})`,
			false,
			[baseExpr.code]
		);
	}
	return acceptAst(`${baseExprIdentifier}`, baseExpr.isFunction, [baseExpr.code]);
}

/**
 * Helper function to compile an and expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns Wrapped and expression.
 */
function emitAndExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, staticContext, '&&');
}

/**
 * Helper function to compile an or expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns Wrapped or expression.
 */
function emitOrExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, staticContext, '||');
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
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext,
	logicalExprOperator: '&&' | '||'
): PartialCompilationResult {
	const firstExpr = emitOperand(
		ast,
		identifier,
		FIRST_OPERAND,
		staticContext,
		ValueType.XSBOOLEAN
	);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(
		ast,
		identifier,
		SECOND_OPERAND,
		staticContext,
		ValueType.XSBOOLEAN
	);
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	const logicalOpCode = `
	function ${identifier}(contextItem) {
		${firstExpr.variables.join('\n')}
		${secondExpr.variables.join('\n')}
		return ${firstExpr.code} ${logicalExprOperator} ${secondExpr.code}
	}
	`;
	return acceptAst(logicalOpCode, true);
}

/**
 * Compiles compare expressions to a JavaScript function.
 *
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @param compareType The exact operator that will be compiled
 * @returns Wrapped compare expression.
 */
function emitCompareExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext,
	compareType: string
): PartialCompilationResult {
	const firstExpr = emitOperand(ast, identifier, FIRST_OPERAND, staticContext);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(ast, identifier, SECOND_OPERAND, staticContext);
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	switch (compareType) {
		// valueCompare
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
			return emitValueCompare(
				ast,
				compareType,
				firstExpr,
				secondExpr,
				identifier,
				staticContext
			);
		// generalCompare
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
			return emitGeneralCompare(
				ast,
				compareType,
				firstExpr,
				secondExpr,
				identifier,
				staticContext
			);
		// nodeCompare
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
		default:
			return rejectAst('Unsupported compare type');
	}
}

/**
 * Create a JavaScript function that returns the string literal.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-StringLiteral
 *
 * @param ast The string literal AST node
 * @param identifier The function wrapper identifier
 * @returns Wrapped string literal function
 */
function emitStringLiteralExpression(
	ast: IAST,
	identifier: FunctionIdentifier
): PartialCompilationResult {
	let text = astHelper.getFirstChild(ast, 'value')[1] as string;
	text = escapeJavaScriptString(text);
	return acceptAst(`const ${identifier} = ${text};`, false);
}

/**
 * Compile AST to base expression wrapped in a function named as the given identifier.
 *
 * @param ast The AST node to compile into a function.
 * @param identifier The function identifier.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns If the AST node's expression is supported for compilation, a wrapped JavaScript function.
 * If unsupported, a wrapped error message.
 */
export function emitBaseExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
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
			return emitStringLiteralExpression(ast, identifier);
		// generalCompare
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
		// valueCompare
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
		// nodeCompare
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
			return emitCompareExpr(ast, identifier, staticContext, name);
		default:
			return rejectAst(`Unsupported: the base expression '${name}'.`);
	}
}
