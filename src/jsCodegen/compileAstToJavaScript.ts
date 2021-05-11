import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { emitBaseExpression } from './emitBaseExpression';
import { JavaScriptCompiledXPathResult, rejectAst } from './JavaScriptCompiledXPath';

const emittersByReturnType = {
	[ReturnType.NODES]: compileAstToReturnNodes,
	[ReturnType.BOOLEAN]: compileAstToReturnBoolean,
	[ReturnType.FIRST_NODE]: compileAstToReturnFirstNode,
};

// Return all matching nodes.
function compileAstToReturnNodes(identifier: string): string {
	const transformToNodesCode = `
	const nodes = [];
	for (const node of ${identifier}(contextItem)) {
		nodes.push(node.value.node);
	}
	return nodes;
	`;

	return transformToNodesCode;
}

// Get effective boolean value.
function compileAstToReturnBoolean(identifier: string): string {
	const transformToBooleanCode = `
	return determinePredicateTruthValue(${identifier}(contextItem));
	`;

	return transformToBooleanCode;
}

function compileAstToReturnFirstNode(identifier: string): string {
	const transformToBooleanCode = `
	return ${identifier}(contextItem).next().value.value.node;
	`;

	return transformToBooleanCode;
}

const compiledXPathIdentifier = 'compiledXPathExpression';
function compileAstToJavaScript(
	xPathAst: IAST,
	returnType: ReturnType
): JavaScriptCompiledXPathResult {
	const compileJavaScriptFunction = emittersByReturnType[returnType];
	if (!compileJavaScriptFunction) {
		return rejectAst(`Unsupported: the return type '${returnType}'.`);
	}

	const mainModule = astHelper.getFirstChild(xPathAst, 'mainModule');
	if (!mainModule) {
		return rejectAst(`Unsupported: Can not execute a library module.`);
	}

	const prolog = astHelper.getFirstChild(mainModule, 'prolog');
	const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);

	if (prolog) {
		return rejectAst(`Unsupported: XQuery.`);
	}

	const emittedBaseExpression = emitBaseExpression(queryBodyContents, compiledXPathIdentifier);
	if (emittedBaseExpression.isAstAccepted === false) {
		return emittedBaseExpression;
	}

	const emittedVariables = emittedBaseExpression.variables
		? emittedBaseExpression.variables.join('\n')
		: '';

	const code =
		emittedVariables +
		emittedBaseExpression.code +
		compileJavaScriptFunction(compiledXPathIdentifier);

	const wrappedCode = `
	return (contextItem, domFacade, runtimeLibrary) => {
		const { DONE_TOKEN, ready, isSubtypeOf, determinePredicateTruthValue,
		adaptSingleJavaScriptValue, XPDY0002, ValueType } = runtimeLibrary;

		${code}
	}
	`;

	return {
		isAstAccepted: true,
		code: wrappedCode,
	};
}

export default compileAstToJavaScript;
