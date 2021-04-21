import astHelper, { IAST } from '../parsing/astHelper';
import { emitBaseExpression } from './emitBaseExpression';
import emitTest, { determineTypeFromTest, kindTestNames } from './emitTest';

const axisNodeNames = {
	CHILD: 'child',
	SELF: 'self',
	PARENT: 'parent',
};

const stepEmittersByAxis = {
	[axisNodeNames.CHILD]: emitChildAxis,
	[axisNodeNames.SELF]: emitSelfAxis,
	[axisNodeNames.PARENT]: emitParentAxis,
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

function emitPredicates(predicatesAst: IAST, nestLevel: number) {
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

		functionDeclarations.push(emitBaseExpression(predicate, predicateFunctionIdentifier));
	}
	return { functionDeclarations, code: evaluatePredicateConditionCode };
}

function emitSteps(rawSteps) {
	if (rawSteps.length === 0) {
		return {
			scopedVariables: ['let hasReturned = false;'],
			code: `
			if (!hasReturned) {
				hasReturned = true;
				return ready(contextItem);
			}
			`,
		};
	}

	const compiledSteps = rawSteps.reduceRight(
		({ scopedVariables: variables, code: nestedStepCode }, step: IAST, index: number) => {
			const nestLevel = index + 1;

			const predicatesAst = astHelper.getFirstChild(step, 'predicates');
			const predicates = predicatesAst ? emitPredicates(predicatesAst, nestLevel) : undefined;

			const axisAst = astHelper.getFirstChild(step, ['xpathAxis']);
			if (axisAst) {
				const axis = astHelper.getTextContent(axisAst);

				let nestedCode: string;
				const testAst = astHelper.getFirstChild(step, kindTestNames);
				if (index === rawSteps.length - 1) {
					const returnType = determineTypeFromTest(testAst);
					// TODO: adapt JS value.
					nestedCode = `i${nestLevel}++;\nreturn ready({ type: "${returnType}", value: { node: contextItem${nestLevel} }});`;
				} else {
					// Otherwise, just go further down the tree.
					nestedCode = `${nestedStepCode}\ni${nestLevel}++;`;
				}

				const testConditionCode = emitTest(testAst, `contextItem${nestLevel}`);

				const emitter = stepEmittersByAxis[axis];
				if (emitter === undefined) {
					throw new Error(`Unsupported: the ${axis} axis.`);
				}
				const emittedStep = emitter(
					testConditionCode,
					predicates ? predicates.code : '',
					nestLevel,
					nestedCode
				);
				variables.push(
					...emittedStep.scopedVariables,
					...(predicates ? predicates.functionDeclarations : [])
				);
				nestedStepCode = emittedStep.code;
			} else {
				throw new Error('Unsupported: no axis AST.');
			}

			const lookups = astHelper.getChildren(step, 'lookup');
			if (lookups.length > 0) {
				throw new Error('Unsupported: lookups.');
			}

			return { scopedVariables: variables, code: nestedStepCode };
		},
		{ scopedVariables: [], code: '' }
	);

	compiledSteps.code = 'const contextItem0 = contextItem.value.node;' + compiledSteps.code;

	return compiledSteps;
}

// A path expression can be used to locate nodes within trees. A path expression
// consists of a series of one or more steps.
// https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
function emitPathExpression(ast: IAST, identifier: string): string {
	const compiledSteps = emitSteps(astHelper.getChildren(ast, 'stepExpr'));

	const pathExpressionCode = `
	function ${identifier}(contextItem) {
		if (!isSubtypeOf(contextItem.type, "node()")) {
			throw new Error("Context item must be subtype of node().");
		}
		${compiledSteps.scopedVariables.join('\n')}
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

	return pathExpressionCode;
}

export default emitPathExpression;
