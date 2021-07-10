import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import {
	acceptAst,
	acceptFullyCompiledAst,
	JavaScriptCompiledXPathResult,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
	rejectAst,
} from './JavaScriptCompiledXPath';

// Return all matching nodes.
function emitEvaluationToNodes(identifier: string): PartiallyCompiledAstAccepted {
	return acceptAst(`
	const nodes = [];
	for (const node of ${identifier}(contextItem)) {
		nodes.push(node.value.node);
	}
	return nodes;
	`);
}

// Get effective boolean value.
function emitEvaluationToBoolean(identifier: string): PartiallyCompiledAstAccepted {
	return acceptAst(`
	return determinePredicateTruthValue(${identifier}(contextItem));
	`);
}

// Strings can just be returned as is so lets do that
function emitEvaluationToString(identifier: string): PartiallyCompiledAstAccepted {
	return acceptAst(`
	return ${identifier}(contextItem);
	`);
}

function emitEvaluationToNumber(identifier: string): PartiallyCompiledAstAccepted {
	return acceptAst(`
	return ${identifier}(contextItem);
	`);
}

function emitEvaluationToFirstNode(identifier: string): PartiallyCompiledAstAccepted {
	return acceptAst(`
	const firstResult = ${identifier}(contextItem).next();
	if (!firstResult.done) {
		return firstResult.value.value.node
	}
	return null;
	`);
}

function emitReturnTypeConversion(
	identifier: string,
	returnType: ReturnType
): PartialCompilationResult {
	switch (returnType) {
		case ReturnType.FIRST_NODE:
			return emitEvaluationToFirstNode(identifier);
		case ReturnType.NODES:
			return emitEvaluationToNodes(identifier);
		case ReturnType.BOOLEAN:
			return emitEvaluationToBoolean(identifier);
		case ReturnType.STRING:
			return emitEvaluationToString(identifier);
		case ReturnType.NUMBER:
			return emitEvaluationToNumber(identifier);
		default:
			return rejectAst(`Unsupported: the return type '${returnType}'.`);
	}
}

function wrapCompiledCode(code: string, shouldUseContextItem: boolean): string {
	let finalCode = `
	return (contextItem, domFacade, runtimeLib) => {
		const {
			DONE_TOKEN,
			ValueType,
			XPDY0002,
			adaptSingleJavaScriptValue,
			determinePredicateTruthValue,
			isSubtypeOf,
			ready,
		} = runtimeLib;`;

	if (shouldUseContextItem) {
		finalCode += `
		if (!contextItem) {
			throw XPDY0002("Context is needed to evaluate the given path expression.");
		}

		if (!isSubtypeOf(contextItem.type, ${ValueType.NODE})) {
			throw new Error("Context item must be subtype of node().");
		}

		contextItem = contextItem.value.node;`;
	}

	finalCode += code + `}`;

	return finalCode;
}

const compiledXPathIdentifier = 'compiledXPathExpression';

function compileAstToJavaScript(
	xPathAst: IAST,
	returnType: ReturnType,
	staticContext: CodeGenContext
): JavaScriptCompiledXPathResult {
	const returnTypeConversionCode = emitReturnTypeConversion(compiledXPathIdentifier, returnType);
	if (returnTypeConversionCode.isAstAccepted === false) {
		return returnTypeConversionCode;
	}

	const mainModule = astHelper.getFirstChild(xPathAst, 'mainModule');
	if (!mainModule) {
		return rejectAst(`Unsupported: Can not execute a library module.`);
	}

	const prolog = astHelper.getFirstChild(mainModule, 'prolog');
	if (prolog) {
		return rejectAst(`Unsupported: XQuery.`);
	}

	const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);

	const compiledBaseExpr = emitBaseExpr(
		queryBodyContents,
		compiledXPathIdentifier,
		staticContext
	);
	if (compiledBaseExpr.isAstAccepted === false) {
		return compiledBaseExpr;
	}

	const emittedVariables = compiledBaseExpr.variables
		? compiledBaseExpr.variables.join('\n')
		: '';

	const code = emittedVariables + compiledBaseExpr.code + returnTypeConversionCode.code;

	const requiresContext = checkForContextItemInExpression(xPathAst);

	const wrappedCode = wrapCompiledCode(code, requiresContext);

	return acceptFullyCompiledAst(wrappedCode);
}

// This function is used to check if a query requires a context.
// This implementation is temporary and will be removed when codegen gets combined with the annotation.
//
// TODO: replace this with context info from the annotation step
function checkForContextItemInExpression(ast: IAST): boolean {
	const children = astHelper.getChildren(ast, '*');
	if (ast[0] === 'pathExpr') {
		return true;
	}
	for (const child of children) {
		if (checkForContextItemInExpression(child)) {
			return true;
		}
	}
	return false;
}

export default compileAstToJavaScript;
