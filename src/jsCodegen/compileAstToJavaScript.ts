import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import { getDataFromOperandCode } from './emitCompare';
import {
	acceptAst,
	acceptFullyCompiledAst,
	GeneratedCodeBaseType,
	GeneratedCodeType,
	getCompiledValueCode,
	JavaScriptCompiledXPathResult,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';
import { determinePredicateTruthValue } from './runtimeLib';

// Return all matching nodes.
function emitEvaluationToNodes(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartialCompilationResult {
	const [valueCode, valueCodeType] = getCompiledValueCode(identifier, generatedCodeType);
	if (valueCodeType.type !== GeneratedCodeBaseType.Iterator) {
		return rejectAst('Return type was not an iterator');
	}

	return acceptAst(`return Array.from(${valueCode});`, { type: GeneratedCodeBaseType.Statement });
}

// Get effective boolean value.
function emitEvaluationToBoolean(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartialCompilationResult {
	const generated = determinePredicateTruthValue(identifier, '', generatedCodeType);
	if (!generated.isAstAccepted) {
		return generated;
	}
	return acceptAst(`return ${generated.code};`, { type: GeneratedCodeBaseType.Statement });
}

// Strings can just be returned as is so lets do that
function emitEvaluationToString(
	identifier: string,
	generatedCodeType: GeneratedCodeType,
	astType: ValueType
): PartialCompilationResult {
	if (astType === undefined) {
		return rejectAst("Full AST wasn't annotated so we cannot correctly emit a string return");
	}
	if (!isSubtypeOf(astType, ValueType.XSSTRING) && !isSubtypeOf(astType, ValueType.ATTRIBUTE)) {
		return rejectAst(
			'Not implemented: returning anything but strings and attributes from codegen'
		);
	}

	const [valueCode, valueCodeType] = getCompiledValueCode(identifier, generatedCodeType);

	const valueDataCode = getDataFromOperandCode(valueCode, valueCodeType.type, astType);
	// Note that `getDataFromOperandCode` can return null for empty strings. Stringify these cases
	return acceptAst(`return ${valueDataCode} || '';`, { type: GeneratedCodeBaseType.Statement });
}

function emitEvaluationToFirstNode(
	identifier: string,
	generatedCodeType: GeneratedCodeType
): PartialCompilationResult {
	const [valueCode, valueCodeType] = getCompiledValueCode(identifier, generatedCodeType);
	if (valueCodeType.type !== GeneratedCodeBaseType.Iterator) {
		throw new Error('Trying access generated code as an iterator while this is not the case.');
	}

	return acceptAst(
		`
	const firstResult = ${valueCode}.next();
	if (!firstResult.done) {
		return firstResult.value
	}
	return null;
	`,
		{ type: GeneratedCodeBaseType.Statement }
	);
}

function emitReturnTypeConversion(
	identifier: string,
	returnType: ReturnType,
	generatedCodeType: GeneratedCodeType,
	astType: ValueType
): PartialCompilationResult {
	switch (returnType) {
		case ReturnType.FIRST_NODE:
			return emitEvaluationToFirstNode(identifier, generatedCodeType);
		case ReturnType.NODES:
			return emitEvaluationToNodes(identifier, generatedCodeType);
		case ReturnType.BOOLEAN:
			return emitEvaluationToBoolean(identifier, generatedCodeType);
		case ReturnType.STRING:
			return emitEvaluationToString(identifier, generatedCodeType, astType);
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

	const [compiledBaseExpr, _bucket] = emitBaseExpr(
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

	const queryType = astHelper.getAttribute(queryBodyContents, 'type');

	const returnTypeConversionCode = emitReturnTypeConversion(
		compiledXPathIdentifier,
		returnType,
		compiledBaseExpr.generatedCodeType,
		queryType ? queryType.type : undefined
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
