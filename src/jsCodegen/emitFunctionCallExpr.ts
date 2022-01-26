import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import {
	acceptAst,
	FunctionIdentifier,
	GeneratedCodeBaseType,
	getCompiledValueCode,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

const supportedFunctions: Record<
	string,
	(
		ast: IAST,
		identifier: FunctionIdentifier,
		staticContext: CodeGenContext
	) => PartialCompilationResult
> = {
	'local-name': emitLocalNameFunction,
	name: emitNameFunction,
};

function emitArgument(
	ast: IAST,
	staticContext: CodeGenContext,
	identifier: FunctionIdentifier
): PartialCompilationResult {
	const [baseExpr, _bucket] = staticContext.emitBaseExpr(ast, identifier, staticContext);

	if (!baseExpr.isAstAccepted) {
		return baseExpr;
	}

	return acceptAst(`${identifier}`, baseExpr.generatedCodeType, [baseExpr.code]);
}

export function emitFunctionCallExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const functionName = astHelper.getTextContent(astHelper.getFirstChild(ast, 'functionName'));

	if (supportedFunctions[functionName] !== undefined) {
		return supportedFunctions[functionName](ast, identifier, staticContext);
	}

	return rejectAst(`Unsupported function: ${functionName}`);
}

const contextItemCheck = `if (contextItem === undefined || contextItem === null) {
	throw new Error('XPDY0002: The function which was called depends on dynamic context, which is absent.');
}`;

function createLocalNameGetter(itemName: string) {
	return `(${itemName}.localName || ${itemName}.target || '')`;
}

function createNameGetter(itemName: string) {
	return `(((${itemName}.prefix || '').length !== 0 ? ${itemName}.prefix + ':' : '')
		+ (${itemName}.localName || ${itemName}.target || ''))`;
}

function emitSpecificNameFunction(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext,
	nameGetterFunction: (itemName: string) => string,
	functionName: string
): PartialCompilationResult {
	const argsAst = astHelper.getFirstChild(ast, 'arguments');
	let code = '';
	if (argsAst.length === 1) {
		// No args
		code = `function ${identifier}(contextItem) {
			${contextItemCheck}
			return ${nameGetterFunction('contextItem')};
		}`;
	} else if (argsAst.length === 2) {
		// One arg
		const innerAst = argsAst[1] as IAST;
		const emittedArg = emitArgument(innerAst, staticContext, 'arg');
		// Special handling if context item is passed in
		if (innerAst[0] === 'contextItemExpr') {
			code = `function ${identifier}(contextItem) {
				${contextItemCheck}
				return ${nameGetterFunction('contextItem')};
			}`;
		} else {
			if (!emittedArg.isAstAccepted) {
				return emittedArg;
			}

			code = `function ${identifier}(contextItem) {
				${emittedArg.variables}
				const value = ${getCompiledValueCode(emittedArg.code, emittedArg.generatedCodeType)[0]};
				const childElement = value.next().value;
				return (value.done ? "" : ${nameGetterFunction('childElement')});
			}`;
		}
	} else {
		// Two or more args
		return rejectAst(`Incorrect arg count for ${functionName} function`);
	}

	return acceptAst(code, {
		type: GeneratedCodeBaseType.Function,
		returnType: { type: GeneratedCodeBaseType.Value },
	});
}

function emitNameFunction(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return emitSpecificNameFunction(ast, identifier, staticContext, createNameGetter, 'name()');
}

function emitLocalNameFunction(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return emitSpecificNameFunction(
		ast,
		identifier,
		staticContext,
		createLocalNameGetter,
		'local-name()'
	);
}
