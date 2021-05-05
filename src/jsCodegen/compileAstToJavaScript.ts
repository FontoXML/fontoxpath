import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CompiledJavaScriptResult, rejectAst } from './CompiledJavaScript';
import { emitBaseExpression } from './emitBaseExpression';

const emittersByReturnType = {
	[ReturnType.NODES]: compileAstToReturnNodes,
	[ReturnType.BOOLEAN]: compileAstToReturnBoolean,
	[ReturnType.FIRST_NODE]: compileAstToReturnFirstNode,
};

const runtimeLibImports = `
const { DONE_TOKEN, ready, isSubtypeOf, determinePredicateTruthValue,
		adaptSingleJavaScriptValue } = runtimeLibrary;
`;

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
export default function (xPathAst: IAST, returnType: ReturnType): CompiledJavaScriptResult {
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

	return {
		isAstAccepted: true,
		code:
			runtimeLibImports +
			emittedVariables +
			emittedBaseExpression.code +
			compileJavaScriptFunction(compiledXPathIdentifier),
	};
}
