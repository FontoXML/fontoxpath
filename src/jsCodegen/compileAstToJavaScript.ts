import { ValueType } from '../expressions/dataTypes/Value';
import CompiledJavaScript from '../jsCodegen/CompiledJavaScript';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import * as runtimeLibrary from './runtimeLibrary';

const kindTestNodeNames = {
	TEXT_TEST: 'textTest',
	ELEMENT_TEST: 'elementTest',
	NAME_TEST: 'nameTest',
	WILDCARD: 'Wildcard',
};

const axisNodeNames = {
	CHILD: 'child',
	SELF: 'self',
	PARENT: 'parent',
};

const baseExpressionNames = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
};

const baseExpressions = Object.values(baseExpressionNames);

const testEmittersByNodeName = {
	[kindTestNodeNames.TEXT_TEST]: emitTextTest,
	[kindTestNodeNames.NAME_TEST]: emitNameTest,
	[kindTestNodeNames.ELEMENT_TEST]: emitElementTest,
	[kindTestNodeNames.WILDCARD]: emitWildcard,
};

const typesByNodeName = {
	[kindTestNodeNames.TEXT_TEST]: 'text()',
	[kindTestNodeNames.NAME_TEST]: 'element()',
	[kindTestNodeNames.ELEMENT_TEST]: 'element()',
	[kindTestNodeNames.WILDCARD]: 'element()',
};

const stepEmittersByAxis = {
	[axisNodeNames.CHILD]: emitChildAxis,
	[axisNodeNames.SELF]: emitSelfAxis,
	[axisNodeNames.PARENT]: emitParentAxis,
};

const baseEmittersByExpression = {
	[baseExpressionNames.PATH_EXPR]: emitLazyPathExpression,
	[baseExpressionNames.AND_OP]: emitAndExpression,
	[baseExpressionNames.OR_OP]: emitOrExpression,
};

const compileAstByReturnValue = {
	[ReturnType.NODES]: compileAstToReturnNodes,
	[ReturnType.BOOLEAN]: compileAstToReturnBoolean,
};

// The child axis contains the children of the context node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ForwardAxis
//
// returns node()'s.
// https://www.w3.org/TR/xpath-datamodel-31/#dm-children
function emitChildAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string
): { code: string; scopedVariables: [string] } {
	const indexReset = nestLevel !== 1 ? `i${nestLevel} = 0;` : ``;

	const predicateConditionCode = emitFormattedConditionCode(predicates);

	const childAxisCode = `
	const childNodes${nestLevel} = domFacade.getChildNodes(contextItem${nestLevel - 1});
	while (i${nestLevel} < childNodes${nestLevel}.length) {
		const contextItem${nestLevel} = childNodes${nestLevel}[i${nestLevel}];
		if (!(${test} ${predicateConditionCode})) {
			i${nestLevel}++;
			continue;
		}
		${nestedCode}
	}
	${indexReset}
	`;

	return { code: childAxisCode, scopedVariables: [`let i${nestLevel} = 0;`] };
}

// self::para selects the context node if it is a para element, and otherwise
// returns an empty sequence
function emitSelfAxis(test: string, predicates: string, nestLevel: number, nestedCode: string) {
	const selfContextNodeCode = `
	const contextItem${nestLevel} = contextItem${nestLevel - 1};
	`;

	return emitOneNodeAxis(test, predicates, nestLevel, nestedCode, selfContextNodeCode);
}

// parent::node() selects the parent of the context node. If the context node is
// an attribute node, this expression returns the element node (if any) to which
// the attribute node is attached.
function emitParentAxis(test: string, predicates: string, nestLevel: number, nestedCode: string) {
	const contextNodeCode = `
	const contextItem${nestLevel} = domFacade.getParentNode(contextItem${nestLevel - 1});
	`;

	return emitOneNodeAxis(test, predicates, nestLevel, nestedCode, contextNodeCode);
}

function emitFormattedConditionCode(condition: string) {
	return condition.length !== 0 ? `&& ${condition}` : '';
}

// Emit code for an axis made up of exactly one node, that should only be
// returned once.
function emitOneNodeAxis(
	test: string,
	predicates: string,
	nestLevel: number,
	nestedCode: string,
	contextNodeCode: string
): { code: string; scopedVariables: [string] } {
	const testEvaluatationCode = emitFormattedConditionCode(test);
	const predicateEvaluationCode = emitFormattedConditionCode(predicates);

	return {
		code: `
		${contextNodeCode}
		if (i${nestLevel} == 0 ${testEvaluatationCode} ${predicateEvaluationCode}) {
			${nestedCode}
		}
		`,
		scopedVariables: [`let i${nestLevel} = 0;`],
	};
}

function determineTypeFromTest(testAst: IAST): ValueType {
	const testType = testAst[0];
	const type = typesByNodeName[testType] as ValueType;

	if (type === undefined) {
		throw new Error(`Unsupported test type: ${testAst[0]}`);
	}
	return type;
}

function emitSteps(rawSteps) {
	if (rawSteps.length === 0) {
		return {
			scopedVariables: ['let returned = false;'],
			code: `
			if (!returned) {
				returned = true;
				return ready({ type: "text()", value: { node: contextItem0 }});
			}
			`,
		};
	}

	const compiledSteps = rawSteps.reduceRight(
		({ scopedVariables: variables, code }, step: IAST, index: number) => {
			const axisAst = astHelper.getFirstChild(step, ['xpathAxis']);
			const predicatesAst = astHelper.getFirstChild(step, 'predicates');

			const testAst = astHelper.getFirstChild(step, [
				'textTest',
				'elementTest',
				'nameTest',
				'Wildcard',
			]);
			const nestLevel = index + 1;

			let predicateEvaluationCondition = '';
			if (predicatesAst) {
				const predicateIdentifiers = [];
				const children = astHelper.getChildren(predicatesAst, '*');
				for (let i = 0; i < children.length; i++) {
					const predicate = children[i];
					const predicateFunctionIdentifier = `predicateExpression_step${nestLevel}_predicate${index}`;

					// Prepare condition used to determine if an axis should
					// return a node.
					const predicateFunctionCall = `determinePredicateTruthValue(${predicateFunctionIdentifier}({type: 'node()', value: {node: contextItem${nestLevel}}}))`;
					if (i === predicateIdentifiers.length) {
						predicateEvaluationCondition += predicateFunctionCall;
					} else if (i === 0) {
						predicateEvaluationCondition += predicateFunctionCall;
					} else {
						predicateEvaluationCondition = `${predicateEvaluationCondition} && ${predicateFunctionCall}`;
					}

					// Instantiate functions representing the predicate.
					const compiledPredicateFunction = compileToLazyCode(
						predicate,
						predicateFunctionIdentifier
					);
					variables.push(compiledPredicateFunction);
				}
			}

			if (axisAst) {
				const axis = astHelper.getTextContent(axisAst);

				let nestedCode: string;
				if (index === rawSteps.length - 1) {
					const returnType = determineTypeFromTest(testAst);
					nestedCode = `i${nestLevel}++;\nreturn ready({ type: "${returnType}", value: { node: contextItem${nestLevel} }});`;
				} else {
					// Otherwise, just go further down the tree.
					nestedCode = `${code}\ni${nestLevel}++;`;
				}

				const test = emitTest(testAst, `contextItem${nestLevel}`);

				const emitter = stepEmittersByAxis[axis];
				if (emitter === undefined) {
					throw new Error(`Unsupported: the ${axis} axis.`);
				}
				const emittedStep = emitter(
					test,
					predicateEvaluationCondition,
					nestLevel,
					nestedCode
				);
				variables.push(...emittedStep.scopedVariables);
				code = emittedStep.code;
			} else {
				throw new Error('Unsupported: no axis AST.');
			}

			const lookups = astHelper.getChildren(step, 'lookup');
			if (lookups.length > 0) {
				throw new Error('Unsupported: lookups.');
			}

			return { scopedVariables: variables, code };
		},
		{ scopedVariables: [], code: '' }
	);

	return compiledSteps;
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitLazyPathExpression(ast: IAST, identifier: string): string {
	const compiledSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'));

	const pathExpr = `
	function ${identifier}(contextItem) {
		if (!isSubtypeOf(contextItem.type, "node()")) {
			throw new Error("Context item must be subtype of node().");
		}
		${compiledSteps.scopedVariables.join('\n')}
		const next = () => {
			const contextItem0 = contextItem.value.node;
			${compiledSteps.code}
			return DONE_TOKEN;
		};
		return {
			next,
			[Symbol.iterator]() { return this; }
		};
	}
	`;

	return pathExpr;
}

const firstOp = 'firstOperand';
const secondOp = 'secondOperand';

function emitCompiledOperand(ast: IAST, identifier: string, operandKind: string) {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const expressionAst = astHelper.getFirstChild(operand, baseExpressions);

	const expressionIdentifier = identifier + operandKind;

	const compiledExpression = compileToLazyCode(expressionAst, expressionIdentifier);

	return {
		fnCall: `determinePredicateTruthValue(${expressionIdentifier}(contextItem))`,
		code: compiledExpression,
	};
}

function emitCompiledOperands(ast: IAST, identifier: string) {
	return [
		emitCompiledOperand(ast, identifier, firstOp),
		emitCompiledOperand(ast, identifier, secondOp),
	];
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
function emitAndExpression(ast: IAST, identifier: string): string {
	const [firstCompiledExpression, secondCompiledExpression] = emitCompiledOperands(
		ast,
		identifier
	);

	const andOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.code}
		${secondCompiledExpression.code}
		return ${firstCompiledExpression.fnCall} && ${secondCompiledExpression.fnCall}
	}
	`;
	return andOpCode;
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
function emitOrExpression(ast: IAST, identifier: string): string {
	const [firstCompiledExpression, secondCompiledExpression] = emitCompiledOperands(
		ast,
		identifier
	);

	const orOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.code}
		${secondCompiledExpression.code}
		return ${firstCompiledExpression.fnCall} || ${secondCompiledExpression.fnCall}
	}
	`;
	return orOpCode;
}

// text() matches any text node.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
function emitTextTest(_ast: IAST, identifier: string) {
	return `${identifier}.nodeType === NODE_TYPES.TEXT_NODE`;
}

// element() and element(*) match any single element node, regardless of its name or type annotation.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementTest
function emitElementTest(ast: IAST, identifier: string) {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	const isElementCode = `${identifier}.nodeType === NODE_TYPES.ELEMENT_NODE`;
	if (!elementName || star) {
		return isElementCode;
	}
	const qName = astHelper.getQName(astHelper.getFirstChild(elementName, 'QName'));
	return `${isElementCode} && ${identifier}.localName === "${qName.localName}"`;
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
function emitNameTest(ast: IAST, identifier: string) {
	const qName = astHelper.getQName(ast);
	if (qName.namespaceURI === '') {
		throw new Error("Unsupported: empty namespaceURI's");
	}

	return `${identifier}.nodeType === NODE_TYPES.ELEMENT_NODE && ${identifier}.localName === "${qName.localName}"`;
}

// select all element children of the context node
// for example: child::*.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-Wildcard
function emitWildcard(ast: IAST, identifier: string): string {
	if (astHelper.getChildren(ast, 'Wildcard').length !== 0) {
		throw new Error('Unsupported: the provided wildcard');
	}
	return emitElementTest(ast, identifier);
}

function emitTest(ast: IAST, identifier: string): string {
	const test = ast[0];
	const emittedTest = testEmittersByNodeName[test](ast, identifier);

	if (emittedTest === undefined) {
		throw new Error('This test is not supported');
	}
	return emittedTest;
}

function compileToLazyCode(ast: IAST, identifier: string): string {
	const name = ast[0];
	const emitBaseExpression = baseEmittersByExpression[name];
	if (emitBaseExpression === undefined) {
		throw new Error(`Unsupported: base expression ${name}`);
	}
	return emitBaseExpression(ast, identifier);
}

const runtimeLibImports = `
const { NODE_TYPES, DONE_TOKEN, ready, isSubtypeOf, determinePredicateTruthValue } = runtimeLibrary;
`;
const compiledXPathIdentifier = 'compiledExpression';

// Return all matching nodes.
function compileAstToReturnNodes(ast: IAST) {
	const transformToNodesCode = `
	const nodes = [];
	for (const node of ${compiledXPathIdentifier}(contextItem)) {
		nodes.push(node.value.node);
	}
	return nodes;`;

	return compileToLazyCode(ast, compiledXPathIdentifier) + transformToNodesCode;
}

// Get effective boolean value.
function compileAstToReturnBoolean(ast: IAST) {
	const transformToBooleanCode = `
	return determinePredicateTruthValue(${compiledXPathIdentifier}(contextItem));
	`;

	return compileToLazyCode(ast, compiledXPathIdentifier) + transformToBooleanCode;
}

export default function (xPathAst: IAST, returnType: ReturnType): CompiledJavaScript {
	const compile = compileAstByReturnValue[returnType];

	if (compile === undefined) {
		throw new Error(`Unsupported return type: ${returnType}`);
	}

	return new CompiledJavaScript(runtimeLibImports + compile(xPathAst), runtimeLibrary);
}
