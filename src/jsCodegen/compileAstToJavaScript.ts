import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { emitBaseExpr } from './emitBaseExpression';
import {
	acceptAst,
	acceptFullyCompiledAst,
	JavaScriptCompiledXPathResult,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
	rejectAst,
} from './JavaScriptCompiledXPath';
import { StaticContext } from './StaticContext';

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

function emitEvaluationToFirstNode(identifier: string): PartiallyCompiledAstAccepted {
	return acceptAst(`
	return ${identifier}(contextItem).next().value.value.node
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
		default:
			return rejectAst(`Unsupported: the return type '${returnType}'.`);
	}
}

function wrapCompiledCode(code: string): string {
	return `
	return (contextItem, domFacade, runtimeLibrary) => {
		const {
			DONE_TOKEN,
			ValueType,
			XPDY0002,
			adaptSingleJavaScriptValue,
			determinePredicateTruthValue,
			isSubtypeOf,
			ready,
		} = runtimeLibrary;

		if (!contextItem) {
			throw XPDY0002("Context is needed to evaluate the given path expression.");
		}

		if (!isSubtypeOf(contextItem.type, ${ValueType.NODE})) {
			throw new Error("Context item must be subtype of node().");
		}

		contextItem = contextItem.value.node;

		${code}
	}
	`;
}

const compiledXPathIdentifier = 'compiledXPathExpression';

function compileAstToJavaScript(
	xPathAst: IAST,
	returnType: ReturnType,
	staticContext: StaticContext
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

	const wrappedCode = wrapCompiledCode(code);

	return acceptFullyCompiledAst(wrappedCode);
}

export default compileAstToJavaScript;
