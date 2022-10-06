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
import { determinePredicateTruthValue } from './runtimeLib';

const supportedFunctions: Record<
	string,
	(
		ast: IAST,
		identifier: FunctionIdentifier,
		staticContext: CodeGenContext
	) => PartialCompilationResult
> = {
	'local-name/0': emitLocalNameFunction,
	'local-name/1': emitLocalNameFunction,
	'name/0': emitNameFunction,
	'name/1': emitNameFunction,
	'not/1': emitNotFunction,
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
	const { localName, namespaceURI } = astHelper.getQName(
		astHelper.getFirstChild(ast, 'functionName')
	);

	if (namespaceURI !== staticContext.defaultFunctionNamespaceUri) {
		return rejectAst(`Unsupported function: ${localName}`);
	}

	const args = astHelper.getFirstChild(ast, 'arguments');
	const functionNameAndArity = `${localName}/${args.length - 1}`;

	if (supportedFunctions[functionNameAndArity] !== undefined) {
		return supportedFunctions[functionNameAndArity](ast, identifier, staticContext);
	}

	return rejectAst(`Unsupported function/arity: ${functionNameAndArity}`);
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

			// TODO: this (and any other function call) should check multiplicity of the actual argument
			code = `function ${identifier}(contextItem) {
				${emittedArg.variables}
				const value = ${getCompiledValueCode(emittedArg.code, emittedArg.generatedCodeType)[0]};
				const { value: childElement, done } = value.next();
				return (done ? "" : ${nameGetterFunction('childElement')});
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

function emitNotFunction(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const argument = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'arguments'), '*');
	const argExprIdentifier = identifier + 'Arg';
	const [argExpr, _] = staticContext.emitBaseExpr(argument, argExprIdentifier, staticContext);
	if (!argExpr.isAstAccepted) {
		return argExpr;
	}
	const argAsBool = determinePredicateTruthValue(
		argExprIdentifier,
		argExpr.code,
		argExpr.generatedCodeType
	);
	if (!argAsBool.isAstAccepted) {
		return argAsBool;
	}
	const code = `
	function ${identifier}(contextItem) {
		${argAsBool.variables.join('\n')}
		return !(${argAsBool.code});
	}
	`;
	return acceptAst(code, {
		type: GeneratedCodeBaseType.Function,
		returnType: { type: GeneratedCodeBaseType.Value },
	});
}
