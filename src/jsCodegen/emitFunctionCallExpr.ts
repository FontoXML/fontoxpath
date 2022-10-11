import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpr';
import {
	emitConversionToValue,
	emitEffectiveBooleanValue,
	mapPartialCompilationResult,
} from './emitHelpers';
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
	'local-name/0': emitLocalNameFunction,
	'local-name/1': emitLocalNameFunction,
	'name/0': emitNameFunction,
	'name/1': emitNameFunction,
	'not/1': emitNotFunction,
};

export function emitFunctionCallExpr(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const { localName, namespaceURI } = astHelper.getQName(
		astHelper.getFirstChild(ast, 'functionName')
	);

	if (namespaceURI !== context.defaultFunctionNamespaceUri) {
		return rejectAst(`Unsupported function: ${localName}`);
	}

	const args = astHelper.getFirstChild(ast, 'arguments');
	const functionNameAndArity = `${localName}/${args.length - 1}`;

	if (supportedFunctions[functionNameAndArity] !== undefined) {
		return supportedFunctions[functionNameAndArity](ast, contextItemExpr, context);
	}

	return rejectAst(`Unsupported function/arity: ${functionNameAndArity}`);
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
					throw new Error('XPDY0002: The function which was called depends on dynamic context, which is absent.');
				}`,
			])
	);
}

function emitSpecificNameFunction(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext,
	nameGetterFunction: (itemName: string) => string,
	functionName: string
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

		const [expr, _] = emitBaseExpr(argumentAst, contextItemExpr, context);
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
		+ (${identifier}.localName || ${identifier}.target || ''))`,
		'name()'
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
		(identifier) => `(${identifier}.localName || ${identifier}.target || '')`,
		'local-name()'
	);
}

function emitNotFunction(
	ast: IAST,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const argumentAst = astHelper.followPath(ast, ['arguments', '*']);
	const argType = astHelper.getAttribute(argumentAst, 'type');
	const [argExpr, _] = emitBaseExpr(argumentAst, contextItemExpr, context);
	const argAsBool = emitEffectiveBooleanValue(argExpr, argType, contextItemExpr, context);
	return mapPartialCompilationResult(argAsBool, (argAsBool) =>
		acceptAst(`!${argAsBool.code}`, { type: GeneratedCodeBaseType.Value }, argAsBool.variables)
	);
}
