import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpr';
import {
	emitAtomizedValue,
	emitConversionToValue,
	emitEffectiveBooleanValue,
	mapPartialCompilationResult,
} from './emitHelpers';
import {
	acceptAst,
	acceptFullyCompiledAst,
	GeneratedCodeBaseType,
	JavaScriptCompiledXPathResult,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

// Return all matching nodes.
function emitEvaluationToFirstNode(
	expr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	if (expr.isAstAccepted && expr.generatedCodeType.type !== GeneratedCodeBaseType.Generator) {
		return rejectAst(
			'Can not evaluate to first node if expression does not compile to a generator'
		);
	}
	return emitConversionToValue(expr, contextItemExpr, context);
}

function emitEvaluationToNodes(
	expr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	if (expr.isAstAccepted && expr.generatedCodeType.type !== GeneratedCodeBaseType.Generator) {
		return rejectAst('Can not evaluate to nodes if expression does not compile to a generator');
	}

	return mapPartialCompilationResult(context.getIdentifierFor(expr, 'nodes'), (expr) =>
		mapPartialCompilationResult(
			context.getIdentifierFor(contextItemExpr, 'contextItem'),
			(contextItemExpr) =>
				acceptAst(
					`Array.from(${expr.code}(${contextItemExpr.code}))`,
					{ type: GeneratedCodeBaseType.Value },
					[...expr.variables, ...contextItemExpr.variables]
				)
		)
	);
}

function emitEvaluationToBoolean(
	expr: PartialCompilationResult,
	astType: SequenceType,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	// TODO: conversion not necessary if the type is already xs:boolean (not "xs:boolean?"!)
	// or should that happen in emitEffectiveBooleanValue?
	return emitEffectiveBooleanValue(expr, astType, contextItemExpr, context);
}

// Strings can just be returned as is so lets do that
function emitEvaluationToString(
	expr: PartialCompilationResult,
	astType: SequenceType,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const value = emitConversionToValue(expr, contextItemExpr, context);
	const atomized = emitAtomizedValue(value, astType, context);
	return mapPartialCompilationResult(atomized, (atomized) =>
		acceptAst(
			`${atomized.code} ?? ''`,
			{ type: GeneratedCodeBaseType.Value },
			atomized.variables
		)
	);
}

function emitReturnTypeConversion(
	expr: PartialCompilationResult,
	returnType: ReturnType,
	astType: SequenceType,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	switch (returnType) {
		case ReturnType.FIRST_NODE:
			return emitEvaluationToFirstNode(expr, contextItemExpr, context);
		case ReturnType.NODES:
			return emitEvaluationToNodes(expr, contextItemExpr, context);
		case ReturnType.BOOLEAN:
			return emitEvaluationToBoolean(expr, astType, contextItemExpr, context);
		case ReturnType.STRING:
			return emitEvaluationToString(expr, astType, contextItemExpr, context);
		default:
			return rejectAst(`Unsupported: the return type '${returnType}'.`);
	}
}

function wrapCompiledCode(code: string, shouldUseContextItem: boolean): string {
	let finalCode = `
	return (contextItem, domFacade, runtimeLib) => {
		const {
			XPDY0002,
		} = runtimeLib;`;

	if (shouldUseContextItem) {
		finalCode += `
		if (!contextItem) {
			throw XPDY0002("Context is needed to evaluate the given path expression.");
		}

		if (!contextItem.nodeType) {
			throw new Error("Context item must be subtype of node().");
		}
		`;
	}

	finalCode += code + `}`;
	finalCode += '\n//# sourceURL=generated.js';
	return finalCode;
}

const compiledXPathIdentifier = 'compiledXPathExpression';

function compileAstToJavaScript(
	xPathAst: IAST,
	returnType: ReturnType,
	context: CodeGenContext
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

	const contextItemExpr = context.getVarInScope('contextItem');
	const [compiledBaseExpr, _bucket] = emitBaseExpr(queryBodyContents, contextItemExpr, context);

	const queryType = astHelper.getAttribute(queryBodyContents, 'type');
	const compiledReturnValue = emitReturnTypeConversion(
		compiledBaseExpr,
		returnType,
		queryType,
		contextItemExpr,
		context
	);

	// Convert partial compilation into a fully-compiled expression
	if (!compiledReturnValue.isAstAccepted) {
		return compiledReturnValue;
	}
	const code = `
		${compiledReturnValue.variables.join('\n')}
		return ${compiledReturnValue.code};`;
	const requiresContext = checkForContextItemInExpression(xPathAst);
	const wrappedCode = wrapCompiledCode(code, requiresContext);

	return acceptFullyCompiledAst(wrappedCode);
}

// This function is used to check if a query requires a context.
// This implementation is temporary and will be removed when codegen gets combined with the annotation.
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
