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

const parseFunction = `
function assertValidCodePoint (codePoint) {
	if ((codePoint >= 0x1 && codePoint <= 0xD7FF) ||
		(codePoint >= 0xE000 && codePoint <= 0xFFFD) ||
		(codePoint >= 0x10000 && codePoint <= 0x10FFFF)) {
			return;
	}
	throwError(\"XQST0090\", \"The character reference \" + codePoint + \" (\"  + codePoint.toString(16) + \") does not reference a valid codePoint.\");
}

function parseCharacterReferences (input) {
    return input
        .replace(\/(&[^;]+);\/g, function (match) {
            if (\/^&#x\/.test(match)) {
                var codePoint = parseInt(match.slice(3, -1), 16);
                assertValidCodePoint(codePoint);
                return String.fromCodePoint(codePoint);\
            }
            if (\/^&#\/.test(match)) {
                var codePoint = parseInt(match.slice(2, -1), 10);
                assertValidCodePoint(codePoint);
                return String.fromCodePoint(codePoint);
            }
            switch (match) {
                case \'&lt;\':
                    return \'<\';
                case \'&gt;\':
                    return \'>\';
                case \'&amp;\':
                    return \'&\';
                case \'&quot;\':
                    return String.fromCharCode(34);
                case \'&apos;\':
                    return String.fromCharCode(39);
                }
                throwError(\"XPST0003\", \"Unknown character reference: \\\"\" + match + \"\\\"\");
    });
}`;

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
		default:
			return rejectAst(`Unsupported: the return type '${returnType}'.`);
	}
}

function wrapCompiledCode(code: string, shouldUseContextItem: boolean): string {
	let finalCode =
		parseFunction +
		'\n' +
		`
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
