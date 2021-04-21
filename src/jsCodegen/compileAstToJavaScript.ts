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

const compiledXPathIdentifier = 'compiledXPathExpression';
export default function (xPathAst: IAST, returnType: ReturnType): CompiledJavaScript {
	const compileExpression = compileAstByReturnValue[returnType];
	if (compileExpression === undefined) {
		throw new Error(`Unsupported return type: ${returnType}`);
	}

	const compiledBaseExpression = emitBaseExpression(xPathAst, compiledXPathIdentifier);
	const variables = compiledBaseExpression.variables.join("\n");

	return new CompiledJavaScript(runtimeLibImports + variables + compiledBaseExpression.code + compileExpression(compiledXPathIdentifier), runtimeLibrary);
}
