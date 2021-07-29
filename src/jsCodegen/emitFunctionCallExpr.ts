import ISequence from '../expressions/dataTypes/ISequence';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import Value, { SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import { FunctionProperties } from '../expressions/functions/functionRegistry';
import astHelper, { IAST } from '../parsing/astHelper';
import { ResolvedQualifiedName } from '../types/Options';
import { CodeGenContext } from './CodeGenContext';
import {
	acceptAst,
	CompiledResultType,
	getCompiledValueCode,
	IAstRejected,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
	rejectAst,
} from './JavaScriptCompiledXPath';

/**
 * A function to emit the functionCallExpression.
 * At the moment the query gets rejected when:
 * 	- The query contains a parse-json function as the sanitizing of strings messes with the input.
 * 	- The amount of arguments is bigger then 2.
 * 	- The function uses the executionparameters or one of the two contexts.
 * 	- The function is not found.
 * @param ast the ast representation of the function
 * @param identifier the identifier of this part of the query
 * @param staticContext the context in which it is evaluated.
 * @returns a partialCompilationresult which is either accepted or rejected.
 */
export function emitFunctionCallExpr(
	ast: IAST,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	// First we get the functionName and everything about the function itself.
	const functionName: QName = astHelper.getQName(astHelper.getFirstChild(ast, 'functionName'));
	const args: IAST[] = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	const localName: string = functionName.localName;
	const prefix: string = functionName.prefix;
	const resolvedName: ResolvedQualifiedName = staticContext.staticContext.resolveFunctionName(
		{
			localName,
			prefix,
		},
		args.length
	);

	if (!resolvedName) return rejectAst('Unsupported: function localName not found');

	if (resolvedName.localName === 'parse-json') {
		return rejectAst(`function ${resolvedName.localName} is not supported`);
	}

	const props: FunctionProperties = staticContext.staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		args.length
	);

	if (!props) {
		return rejectAst('the function is not found: ' + resolvedName.localName);
	}

	if (
		!String(props.callFunction).includes('_executionParameters') ||
		!String(props.callFunction).includes('_dynamicContext') ||
		!String(props.callFunction).includes('_staticContext')
	) {
		return rejectAst('We still need to find a way to integrate these parameters');
	}

	const functionArrayIndex = staticContext.functions.push(props.callFunction) - 1;

	if (args.length === 0) {
		return emitFunctionWithZeroArguments(identifier, functionArrayIndex);
	}

	const compiledArgs: PartialCompilationResult[] = compileArguments(
		args,
		staticContext,
		identifier
	);
	if (!compiledArgs[0].isAstAccepted) return compiledArgs[0];

	if (args.length === 1) {
		return emitFunctionWithOneArgument(
			identifier,
			functionArrayIndex,
			compiledArgs[0],
			props,
			args[0]
		);
	} else {
		return emitFunctionWithMultipleArguments(
			identifier,
			functionArrayIndex,
			compiledArgs,
			props,
			args
		);
	}
}

function emitFunctionWithZeroArguments(
	identifier: string,
	functionArrayIndex: number
): PartialCompilationResult {
	const functionDefenition = `
	const ${identifier}_function = builtInFunctions[${functionArrayIndex}]
	`;

	const functioncallCode = `
		let ${identifier} = ${identifier}_function(
			null, 
			null, 
			null, 
			)
		${identifier} = convertXDMReturnValue("null", ${identifier}, 0, null);
	`;

	const vars: string = [functionDefenition, functioncallCode].join('\n');

	return acceptAst(vars, CompiledResultType.Value);
}

function emitFunctionWithOneArgument(
	identifier: string,
	functionArrayIndex: number,
	compiledArg: PartiallyCompiledAstAccepted,
	props: FunctionProperties,
	arg: IAST
): PartialCompilationResult {
	const compiledValueCode = getCompiledValueCode(identifier + '_args1', compiledArg.resultType);
	const type = astHelper.getAttribute(arg, 'type').type;

	if (
		!(
			isSubtypeOf((props.argumentTypes[0] as SequenceType).type, type) ||
			isSubtypeOf(type, (props.argumentTypes[0] as SequenceType).type)
		)
	) {
		throw new Error('XPTY0004 wrong parameterType');
	}

	const functionDefenition = `
	const ${identifier}_function = builtInFunctions[${functionArrayIndex}]
	`;

	const functioncallCode = `
		const ${identifier}_helper = createSequence(${type}, ${compiledValueCode})
		let ${identifier} = ${identifier}_function(
			null, 
			null, 
			null, 
			${identifier}_helper
			)
		${identifier} = convertXDMReturnValue("null", ${identifier}, 0, null);
	`;

	const vars: string = [functionDefenition, compiledArg.code, functioncallCode].join('\n');

	return acceptAst(vars, CompiledResultType.Value);
}

function emitFunctionWithMultipleArguments(
	identifier: string,
	functionArrayIndex: number,
	compiledArgs: PartialCompilationResult[],
	props: FunctionProperties,
	args: IAST[]
): PartialCompilationResult {
	return rejectAst('Unsupported: functionExpression with more then 1 parameter');
}

export function createSequence(type: ValueType, compiledValueCode: any): ISequence {
	if (typeof compiledValueCode !== 'string' && compiledValueCode.length === 0) {
		return sequenceFactory.empty();
	} else if (compiledValueCode.next) {
		const nodes = [];
		for (const node of compiledValueCode) {
			nodes.push(node.value.node);
		}
		if (nodes.length === 0) {
			return sequenceFactory.empty();
		} else {
			return sequenceFactory.create(new Value(type, nodes));
		}
	}
	return sequenceFactory.create(new Value(type, compiledValueCode));
}

function compileArguments(
	args: IAST[],
	staticContext: CodeGenContext,
	identifier: string
): PartialCompilationResult[] {
	let failedArg: IAstRejected;
	const compiledArgs: PartialCompilationResult[] = args.map((arg) => {
		const compiledArg = staticContext.emitBaseExpr(arg, `${identifier}_args1`, staticContext);
		if (!compiledArg.isAstAccepted) {
			failedArg = compiledArg as IAstRejected;
		} else if (!astHelper.getAttribute(arg, 'type')) {
			failedArg = rejectAst('type of parameter unknown');
		}
		return compiledArg;
	});
	return failedArg ? [failedArg] : compiledArgs;
}
