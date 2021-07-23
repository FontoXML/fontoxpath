import { assert } from 'sinon';
import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import {
	acceptAst,
	acceptFullyCompiledAst,
	GeneratedCodeBaseType,
	GeneratedCodeType,
	getCompiledValueCode,
	JavaScriptCompiledXPathResult,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
	rejectAst,
} from './JavaScriptCompiledXPath';

// Return all matching nodes.
function emitEvaluationToNodes(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartiallyCompiledAstAccepted {
	const [valueCode, valueCodeType] = getCompiledValueCode(identifier, generatedCodeType);
	if (valueCodeType !== GeneratedCodeBaseType.Iterator) {
		throw new Error('Trying access generated code as an iterator while this is not the case.');
	}

	return acceptAst(
		`
	const nodes = [];
	for (const node of ${valueCode}) {
		nodes.push(node.value.node);
	}
	return nodes;
	`,
	{ type: GeneratedCodeBaseType.Statement }
	);
}

// Get effective boolean value.
function emitEvaluationToBoolean(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartiallyCompiledAstAccepted {
	let getValue = `${getCompiledValueCode(identifier, generatedCodeType)[0]}`;
	return acceptAst(
		`
	return determinePredicateTruthValue(${getValue});
	`,
	{ type: GeneratedCodeBaseType.Statement }
	);
}

// Strings can just be returned as is so lets do that
function emitEvaluationToString(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartiallyCompiledAstAccepted {
	return acceptAst(
		`
	return ${getCompiledValueCode(identifier, generatedCodeType)[0]};
	`,
	{ type: GeneratedCodeBaseType.Statement }
	);
}

function emitEvaluationToFirstNode(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartiallyCompiledAstAccepted {
	const [valueCode, valueCodeType] = getCompiledValueCode(identifier, generatedCodeType);
	if (valueCodeType !== GeneratedCodeBaseType.Iterator) {
		throw new Error('Trying access generated code as an iterator while this is not the case.');
	}

	return acceptAst(
		`
	const firstResult = ${valueCode}.next();
	if (!firstResult.done) {
		return firstResult.value.value.node
	}
	return null;
	`,
		{ type: GeneratedCodeBaseType.Statement }
	);
}

function emitReturnTypeConversion(
	identifier: string,
	returnType: ReturnType,
	generatedCodeType: GeneratedCodeType
): PartialCompilationResult {
	switch (returnType) {
		case ReturnType.FIRST_NODE:
			return emitEvaluationToFirstNode(identifier, generatedCodeType);
		case ReturnType.NODES:
			return emitEvaluationToNodes(identifier, generatedCodeType);
		case ReturnType.BOOLEAN:
			return emitEvaluationToBoolean(identifier, generatedCodeType);
		case ReturnType.STRING:
			return emitEvaluationToString(identifier, generatedCodeType);
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
			atomize,
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

	staticContext.emitBaseExpr = emitBaseExpr;

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

	console.log(compiledBaseExpr.code);

	const returnTypeConversionCode = emitReturnTypeConversion(
		compiledXPathIdentifier,
		returnType,
		compiledBaseExpr.generatedCodeType
	);

	if (returnTypeConversionCode.isAstAccepted === false) {
		return returnTypeConversionCode;
	}
	
	console.log(returnTypeConversionCode.code);

	const code = emittedVariables + compiledBaseExpr.code + returnTypeConversionCode.code;

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
