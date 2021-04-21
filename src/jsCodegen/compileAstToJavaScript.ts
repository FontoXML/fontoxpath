import CompiledJavaScript from '../jsCodegen/CompiledJavaScript';
import { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { emitBaseExpression } from './emitBaseExpression';
import * as runtimeLibrary from './runtimeLibrary';

const compileAstByReturnValue = {
	[ReturnType.NODES]: compileAstToReturnNodes,
	[ReturnType.BOOLEAN]: compileAstToReturnBoolean,
};

const runtimeLibImports = `
const { NODE_TYPES, DONE_TOKEN, ready, isSubtypeOf, determinePredicateTruthValue } = runtimeLibrary;
`;
const compiledXPathIdentifier = 'compiledXPathExpression';

// Return all matching nodes.
function compileAstToReturnNodes(ast: IAST) {
	const transformToNodesCode = `
	const nodes = [];
	for (const node of ${compiledXPathIdentifier}(contextItem)) {
		nodes.push(node.value.node);
	}
	return nodes;`;

	return emitBaseExpression(ast, compiledXPathIdentifier) + transformToNodesCode;
}

// Get effective boolean value.
function compileAstToReturnBoolean(ast: IAST) {
	const transformToBooleanCode = `
	return determinePredicateTruthValue(${compiledXPathIdentifier}(contextItem));
	`;

	return emitBaseExpression(ast, compiledXPathIdentifier) + transformToBooleanCode;
}

export default function (xPathAst: IAST, returnType: ReturnType): CompiledJavaScript {
	const compile = compileAstByReturnValue[returnType];

	if (compile === undefined) {
		throw new Error(`Unsupported return type: ${returnType}`);
	}

	return new CompiledJavaScript(runtimeLibImports + compile(xPathAst), runtimeLibrary);
}
