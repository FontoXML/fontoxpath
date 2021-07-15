import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import {
	acceptAst,
	acceptFullyCompiledAst,
	getCompiledValueCode,
	JavaScriptCompiledXPathResult,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
	rejectAst,
} from './JavaScriptCompiledXPath';

// Return all matching nodes.
function emitEvaluationToNodes(
	identifier: string,
	isFunction: boolean
): PartiallyCompiledAstAccepted {
	return acceptAst(
		`
	const nodes = [];
	for (const node of ${getCompiledValueCode(identifier, isFunction)}) {
		nodes.push(node.value.node);
	}
	return nodes;
	`,
		false
	);
}

// Get effective boolean value.
function emitEvaluationToBoolean(
	identifier: string,
	isFunction: boolean
): PartiallyCompiledAstAccepted {
	return acceptAst(
		`
	return determinePredicateTruthValue(${getCompiledValueCode(identifier, isFunction)});
	`,
		false
	);
}

// Strings can just be returned as is so lets do that
function emitEvaluationToString(
	identifier: string,
	isFunction: boolean
): PartiallyCompiledAstAccepted {
	return acceptAst(
		`
	return ${getCompiledValueCode(identifier, isFunction)};
	`,
		false
	);
}

function emitEvaluationToFirstNode(
	identifier: string,
	isFunction: boolean
): PartiallyCompiledAstAccepted {
	return acceptAst(
		`
	const firstResult = ${getCompiledValueCode(identifier, isFunction)}.next();
	if (!firstResult.done) {
		return firstResult.value.value.node
	}
	return null;
	`,
		false
	);
}

function emitReturnTypeConversion(
	identifier: string,
	returnType: ReturnType,
	isFunction: boolean
): PartialCompilationResult {
	switch (returnType) {
		case ReturnType.FIRST_NODE:
			return emitEvaluationToFirstNode(identifier, isFunction);
		case ReturnType.NODES:
			return emitEvaluationToNodes(identifier, isFunction);
		case ReturnType.BOOLEAN:
			return emitEvaluationToBoolean(identifier, isFunction);
		case ReturnType.STRING:
			return emitEvaluationToString(identifier, isFunction);
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

	const returnTypeConversionCode = emitReturnTypeConversion(
		compiledXPathIdentifier,
		returnType,
		compiledBaseExpr.isFunction
	);

	if (returnTypeConversionCode.isAstAccepted === false) {
		return returnTypeConversionCode;
	}

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
