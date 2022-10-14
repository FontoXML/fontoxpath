import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { doesTypeAllowMultiple } from '../expressions/dataTypes/typeHelpers';
import {
	EllipsisType,
	ParameterType,
	SequenceType,
	ValueType,
	valueTypeToString,
} from '../expressions/dataTypes/Value';
import { getFunctionByArity } from '../expressions/functions/functionRegistry';
import { BUILT_IN_NAMESPACE_URIS } from '../expressions/staticallyKnownNamespaces';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import {
	emitConversionToFirstNode,
	emitConversionToString,
	emitConversionToValue,
	emitEffectiveBooleanValue,
	mapPartialCompilationResult,
} from './emitHelpers';
import escapeJavaScriptString from './escapeJavaScriptString';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

const supportedFunctions: Record<
	string,
	(
		ast: IAST,
		contextItemExpr: PartialCompilationResult,
		context: CodeGenContext
	) => PartialCompilationResult
> = {
	'local-name#0': emitLocalNameFunction,
	'local-name#1': emitLocalNameFunction,
	'name#0': emitNameFunction,
	'name#1': emitNameFunction,
	'not#1': emitNotFunction,
};

// Built-in function allow list
// Namespaces not mentioned here are assumed to be custom functions, which are more limited in what
// they require (no static / dynamic context) and should be safe if their return and argument types
// are supported.
const supportedBuiltinFunctions: Record<string, string[]> = {
	[BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI]: ['version#0'],
	['']: ['true#0', 'false#0', 'root#1', 'path#1'],
};

function emitFunctionArgumentConversion(
	argAst: IAST,
	requestedType: SequenceType,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const [argExpr, _] = context.emitBaseExpr(argAst, contextItemExpr, context);
	const actualType = astHelper.getAttribute(argAst, 'type');
	if (doesTypeAllowMultiple(requestedType)) {
		return rejectAst('Not supported: sequence arguments with multiple items');
	}

	// TODO: emit runtime check that the actual sequence doesn't contain more than one item

	if (isSubtypeOf(requestedType.type, ValueType.NODE)) {
		return emitConversionToFirstNode(argExpr, actualType, contextItemExpr, context);
	}

	switch (requestedType.type) {
		case ValueType.ITEM:
			return emitConversionToValue(argExpr, contextItemExpr, context);

		case ValueType.XSBOOLEAN:
			return emitEffectiveBooleanValue(argExpr, actualType, contextItemExpr, context);

		case ValueType.XSSTRING:
			return emitConversionToString(argExpr, actualType, contextItemExpr, context);
	}

	return rejectAst(
		`Argument types not supported: ${
			actualType ? valueTypeToString(actualType.type) : 'unknown'
		} -> ${valueTypeToString(requestedType.type)}`
	);
}

function emitFunctionArgumentsConversion(
	argAsts: IAST[],
	argTypes: ParameterType[],
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	if (
		argAsts.length !== argTypes.length ||
		argTypes.some((type) => type === EllipsisType.ELLIPSIS)
	) {
		return rejectAst('Not supported: variadic function or mismatch in argument count');
	}

	if (argAsts.length === 0) {
		return acceptAst('', { type: GeneratedCodeBaseType.Value }, []);
	}
	const [argAst, ...restArgAsts] = argAsts;
	const [type, ...restTypes] = argTypes;
	const argExpr = context.getIdentifierFor(
		emitFunctionArgumentConversion(
			argAst,
			// We checked for ELLIPSIS earlier, so all argument types are normal SequenceTypes
			type as SequenceType,
			contextItemExpr,
			context
		),
		'arg'
	);
	if (restArgAsts.length === 0) {
		return argExpr;
	}

	// Recurse and combine all arguments
	return mapPartialCompilationResult(argExpr, (argExpr) => {
		const argsExpr = emitFunctionArgumentsConversion(
			restArgAsts,
			restTypes,
			contextItemExpr,
			context
		);
		return mapPartialCompilationResult(argsExpr, (argsExpr) =>
			acceptAst(`${argExpr.code}, ${argsExpr.code}`, { type: GeneratedCodeBaseType.Value }, [
				...argExpr.variables,
				...argsExpr.variables,
			])
		);
	});
}

function emitFunctionReturnTypeConversion(
	callFunctionExpr: PartialCompilationResult,
	returnType: SequenceType,
	context: CodeGenContext
) {
	return mapPartialCompilationResult(
		context.getIdentifierFor(callFunctionExpr),
		(callFunctionExpr) => {
			// We support (zero or) one string, node or boolean
			if (
				!doesTypeAllowMultiple(returnType) &&
				([ValueType.XSBOOLEAN, ValueType.XSSTRING].includes(returnType.type) ||
					isSubtypeOf(returnType.type, ValueType.NODE))
			) {
				// Singleton string or empty sequence, handled by runtimeLib
				return callFunctionExpr;
			}
			return rejectAst(
				`Function return type ${valueTypeToString(returnType.type)} not supported`
			);
		}
	);
}

export function emitFunctionCallExpr(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const { localName, namespaceURI } = astHelper.getQName(
		astHelper.getFirstChild(ast, 'functionName')
	);

	const argAsts = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');
	const arity = argAsts.length;
	const functionNameAndArity = `${localName}#${arity}`;

	// First check if we have a codegen-specific implementation
	const isDefaultFunctionNamespace = namespaceURI === context.defaultFunctionNamespaceUri;
	if (isDefaultFunctionNamespace) {
		const emitFunctionCall = supportedFunctions[functionNameAndArity];
		if (emitFunctionCall !== undefined) {
			return emitFunctionCall(ast, contextItemExpr, context);
		}
	}

	// Check allowlist
	const allowlist = supportedBuiltinFunctions[isDefaultFunctionNamespace ? '' : namespaceURI];
	if (allowlist) {
		// Function is built-in and must be allowed explicitly to be considered safe for codegen
		if (!allowlist.includes(functionNameAndArity)) {
			return rejectAst(
				`Not supported: built-in function not on allow list: ${functionNameAndArity}`
			);
		}
	}

	// Then check registered functions
	const functionProperties = getFunctionByArity(namespaceURI, localName, arity);
	if (!functionProperties) {
		return rejectAst(`Unknown function / arity: ${functionNameAndArity}`);
	}

	// Should never happen, but let's check anyway
	if (functionProperties.isUpdating) {
		return rejectAst('Not supported: updating functions');
	}

	const argsExpr = emitFunctionArgumentsConversion(
		argAsts,
		functionProperties.argumentTypes,
		contextItemExpr,
		context
	);

	const callFunction = mapPartialCompilationResult(argsExpr, (argsExpr) =>
		acceptAst(
			`runtimeLib.callFunction(domFacade, ${escapeJavaScriptString(
				namespaceURI
			)}, ${escapeJavaScriptString(localName)}, [${argsExpr.code}], options)`,
			{ type: GeneratedCodeBaseType.Value },
			argsExpr.variables
		)
	);
	return emitFunctionReturnTypeConversion(callFunction, functionProperties.returnType, context);
}

function emitContextItemCheck(
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	return mapPartialCompilationResult(
		context.getIdentifierFor(contextItemExpr, 'contextItem'),
		(contextItemExpr) =>
			acceptAst(contextItemExpr.code, { type: GeneratedCodeBaseType.Value }, [
				...contextItemExpr.variables,
				`if (${contextItemExpr.code} === undefined || ${contextItemExpr.code} === null) {
					throw errXPDY0002('The function which was called depends on dynamic context, which is absent.');
				}`,
			])
	);
}

function emitSpecificNameFunction(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext,
	nameGetterFunction: (itemName: string) => string
): PartialCompilationResult {
	const argumentAst = astHelper.followPath(ast, ['arguments', '*']);
	let argExpr: PartialCompilationResult;
	// Handle explicit context item arg as the no-arguments version
	if (!argumentAst || argumentAst[0] === 'contextItemExpr') {
		// No args or '.' as arg - use the context item
		argExpr = emitContextItemCheck(contextItemExpr, context);
	} else {
		// One arg, should be a node
		const argType = astHelper.getAttribute(argumentAst, 'type');
		if (!argType || !isSubtypeOf(argType.type, ValueType.NODE)) {
			return rejectAst('name function only implemented if arg is a node');
		}

		const [expr, _] = context.emitBaseExpr(argumentAst, contextItemExpr, context);
		argExpr = expr;
	}

	// TODO: this (and any other function call) should check multiplicity of the actual argument
	const argAsValue = emitConversionToValue(argExpr, contextItemExpr, context);
	return mapPartialCompilationResult(context.getIdentifierFor(argAsValue, 'arg'), (argAsValue) =>
		acceptAst(
			`(${argAsValue.code} ? ${nameGetterFunction(argAsValue.code)} : '')`,
			{ type: GeneratedCodeBaseType.Value },
			argAsValue.variables
		)
	);
}

function emitNameFunction(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	return emitSpecificNameFunction(
		ast,
		contextItemExpr,
		context,
		(identifier) =>
			`(((${identifier}.prefix || '').length !== 0 ? ${identifier}.prefix + ':' : '')
		+ (${identifier}.localName || ${identifier}.target || ''))`
	);
}

function emitLocalNameFunction(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	return emitSpecificNameFunction(
		ast,
		contextItemExpr,
		context,
		(identifier) => `(${identifier}.localName || ${identifier}.target || '')`
	);
}

function emitNotFunction(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const argumentAst = astHelper.followPath(ast, ['arguments', '*']);
	const argType = astHelper.getAttribute(argumentAst, 'type');
	const [argExpr, _] = context.emitBaseExpr(argumentAst, contextItemExpr, context);
	const argAsBool = emitEffectiveBooleanValue(argExpr, argType, contextItemExpr, context);
	return mapPartialCompilationResult(argAsBool, (argAsBool) =>
		acceptAst(`!${argAsBool.code}`, { type: GeneratedCodeBaseType.Value }, argAsBool.variables)
	);
}
