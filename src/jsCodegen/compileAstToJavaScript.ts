import CompiledJavaScript, { CompiledJavaScriptResult } from '../jsCodegen/CompiledJavaScript';
import { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { emitBaseExpression } from './emitBaseExpression';
import * as runtimeLibrary from './runtimeLibrary';

const compileAstByReturnValue = {
	[ReturnType.NODES]: compileAstToReturnNodes,
	[ReturnType.BOOLEAN]: compileAstToReturnBoolean,
	[ReturnType.FIRST_NODE]: compileAstToReturnFirstNode,
};

const runtimeLibImports = `
const { NODE_TYPES, DONE_TOKEN, ready, isSubtypeOf, determinePredicateTruthValue,
		adaptSingleJavaScriptValue } = runtimeLibrary;
`;

// Return all matching nodes.
function compileAstToReturnNodes(identifier: string) {
	const transformToNodesCode = `
	const nodes = [];
	for (const node of ${identifier}(contextItem)) {
		nodes.push(node.value.node);
	}
	return nodes;`;

	return transformToNodesCode;
}

// Get effective boolean value.
function compileAstToReturnBoolean(identifier: string) {
	const transformToBooleanCode = `
	return determinePredicateTruthValue(${identifier}(contextItem));
	`;

	return transformToBooleanCode;
}

function compileAstToReturnFirstNode(identifier: string) {
	const transformToBooleanCode = `
	return ${identifier}(contextItem).next().value.value.node;
	`;

	return transformToBooleanCode;
}

const compiledXPathIdentifier = 'compiledXPathExpression';
export default function (xPathAst: IAST, returnType: ReturnType): CompiledJavaScriptResult {
	const emitReturnTypeConversion = compileAstByReturnValue[returnType];
	if (emitReturnTypeConversion === undefined) {
		return {
			isAstAccepted: false,
			reason: `Return type ${returnType} is unsupported by the JS codegen backend.`,
		};
	}

	const emittedBaseExpression = emitBaseExpression(xPathAst, compiledXPathIdentifier);
	if (emittedBaseExpression.isAstAccepted === false) {
		return emittedBaseExpression;
	}

	const emittedVariables = emittedBaseExpression.variables
		? emittedBaseExpression.variables.join('\n')
		: '';

	return {
		isAstAccepted: true,
		result: new CompiledJavaScript(
			runtimeLibImports +
				emittedVariables +
				emittedBaseExpression.code +
				emitReturnTypeConversion(compiledXPathIdentifier),
			runtimeLibrary
		),
	};
}
