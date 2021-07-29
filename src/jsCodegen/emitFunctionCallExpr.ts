import { fnAvg } from '../expressions/functions/builtInFunctions_sequences';
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
	IAstAccepted,
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

	// Check if the function uses any of these three parameters.
	// If so reject the query.
	if (
		!String(props.callFunction).includes('_executionParameters') ||
		!String(props.callFunction).includes('_dynamicContext') ||
		!String(props.callFunction).includes('_staticContext')
	) {
		return rejectAst('We still need to find a way to integrate these parameters');
	}

	// Push the function into the functionArray.
	const functionArrayIndex = staticContext.functions.push(props.callFunction) - 1;
	const functionDefinition = `
	const ${identifier}_function = builtInFunctions[${functionArrayIndex}]`;

	if (args.length === 0) {
		// If the function has 0 arguments.
		return emitFunctionWithZeroArguments(identifier, functionDefinition);
	}

	// Compile all the arguments.
	const compiledArgs: PartialCompilationResult[] = compileArguments(
		args,
		staticContext,
		identifier
	);
	if (!compiledArgs[0].isAstAccepted) return compiledArgs[0];

	if (args.length === 1) {
		// If the function has 1 argument.
		return emitFunctionWithOneArgument(
			identifier,
			compiledArgs[0],
			props,
			args[0],
			functionDefinition
		);
	} else {
		// If the function has multiple arguments.
		return emitFunctionWithMultipleArguments(
			identifier,
			functionArrayIndex,
			compiledArgs as PartiallyCompiledAstAccepted[],
			props,
			args,
			functionDefinition
		);
	}
}

/**
 * A function to emit a function with zero arguments.
 * @param identifier The identifier of the functionCallExpression.
 * @param functionDefinition The code for the definition of the function
 * @returns A PartialCompilation result representation of the generated code.
 */
function emitFunctionWithZeroArguments(
	identifier: string,
	functionDefinition: string
): PartialCompilationResult {
	const functioncallCode = `
		let ${identifier} = ${identifier}_function(
			null, 
			null, 
			null, 
			)
		${identifier} = convertXDMReturnValue("null", ${identifier}, 0, null);
	`;

	const vars: string = [functionDefinition, functioncallCode].join('\n');

	return acceptAst(vars, CompiledResultType.Value);
}

/**
 * A function to emit a function with one argument.
 * @param identifier The identifier of the functionCallExpression.
 * @param compiledArgs An array of PartialCompilationResult representations of the arguments.
 * @param props The properties of the function.
 * @param args An array of IAST representations of the arguments.
 * @param functionDefinition The code for the definition of the function.
 * @returns A PartialCompilation result representation of the generated code.
 */
function emitFunctionWithOneArgument(
	identifier: string,
	compiledArg: PartiallyCompiledAstAccepted,
	props: FunctionProperties,
	arg: IAST,
	functionDefinition: string
): PartialCompilationResult {
	const compiledValueCode = getCompiledValueCode(identifier + '_arg1', compiledArg.resultType);
	const type = astHelper.getAttribute(arg, 'type').type;

	if (
		!(
			isSubtypeOf((props.argumentTypes[0] as SequenceType).type, type) ||
			isSubtypeOf(type, (props.argumentTypes[0] as SequenceType).type)
		)
	) {
		throw new Error('XPTY0004 wrong parameterType');
	}

	const functioncallCode = `
		const ${identifier} = convertXDMReturnValue(
			"null", 
			${identifier}_function(
				null, 
				null, 
				null, 
				createSequence(${type}, ${compiledValueCode})
			),
			0,
			null);
	`;

	const vars: string = [functionDefinition, compiledArg.code, functioncallCode].join('\n');

	return acceptAst(vars, CompiledResultType.Value);
}

/**
 * A function to emit a function with multiple arguments.
 * @param identifier The identifier of the functionCallExpression.
 * @param functionArrayIndex The index of the callfunction in the array of functions.
 * @param compiledArgs An array of PartialCompilationResult representations of the arguments.
 * @param props The properties of the function.
 * @param args An array of IAST representations of the arguments.
 * @param functionDefinition The code for the definition of the function.
 * @returns A PartialCompilation result representation of the generated code.
 */
function emitFunctionWithMultipleArguments(
	identifier: string,
	functionArrayIndex: number,
	compiledArgs: PartiallyCompiledAstAccepted[],
	props: FunctionProperties,
	args: IAST[],
	functionDefinition: string
): PartialCompilationResult {
	const compiledValueCodes: string[] = compiledArgs.map(
		(compiledArg: PartiallyCompiledAstAccepted, index: number) =>
			getCompiledValueCode(
				identifier + '_arg' + (index + 1),
				(compiledArg as PartiallyCompiledAstAccepted).resultType
			)
	);
	const types: ValueType[] = args.map((arg) => astHelper.getAttribute(arg, 'type').type);

	let i = 0;
	for (const type of types) {
		if (
			!(
				isSubtypeOf((props.argumentTypes[i] as SequenceType).type, type) ||
				isSubtypeOf(type, (props.argumentTypes[i] as SequenceType).type)
			)
		) {
			throw new Error('XPTY0004 wrong parameterType');
		}
		i++;
	}

	let argumentsString: string = '';
	for (let index = 0; index < compiledValueCodes.length - 1; index++) {
		argumentsString += `createSequence(${types[index]}, ${compiledValueCodes[index]}),\n`;
	}
	argumentsString += `createSequence(${types[compiledValueCodes.length - 1]}, ${
		compiledValueCodes[compiledValueCodes.length - 1]
	})`;

	const functioncallCode = `
	const ${identifier} = convertXDMReturnValue(
		"null", 
		${identifier}_function(
			null, 
			null, 
			null, 
			${argumentsString}
		),
		0,
		null);
	`;

	const vars: string = [
		functionDefinition,
		compiledArgs.map((arg) => arg.code).join('\n'),
		functioncallCode,
	].join('\n');

	return acceptAst(vars, CompiledResultType.Value);
}

/**
 * A function to create a sequence out of the javascript values.
 * @param type The type of the value.
 * @param compiledValueCode The value.
 * @returns An ISequence representation of the value.
 */
export function createSequence(type: ValueType, compiledValueCode: any): ISequence {
	// If the argument is a sequence and not an empty string return an emty sequence.
	if (typeof compiledValueCode !== 'string' && compiledValueCode.length === 0) {
		return sequenceFactory.empty();
	} else if (typeof compiledValueCode !== 'string' && compiledValueCode.length > 1) {
		const values = [];
		for (const value of compiledValueCode) {
			values.push(new Value(type, value));
		}
		return sequenceFactory.create(values);
		// If the argument is an iterator we create the sequence by taking the nodevalue for each node.
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

/**
 * A function to compile all the arguments,
 * if one of the arguments could not be compiled it will be the only argument returned.
 * @param args An ast representation of each of the arguments.
 * @param staticContext The staticContext in which it is evaluated
 * @param identifier The identifier for the functionCall.
 * @returns The compiled arguments.
 */
function compileArguments(
	args: IAST[],
	staticContext: CodeGenContext,
	identifier: string
): PartialCompilationResult[] {
	let failedArg: IAstRejected;
	let argIdentifier: number = 0;
	const compiledArgs: PartialCompilationResult[] = args.map((arg) => {
		argIdentifier++;
		const compiledArg = staticContext.emitBaseExpr(
			arg,
			`${identifier}_arg${argIdentifier}`,
			staticContext
		);
		if (!compiledArg.isAstAccepted) {
			failedArg = compiledArg as IAstRejected;
		} else if (!astHelper.getAttribute(arg, 'type')) {
			failedArg = rejectAst('type of parameter unknown');
		}
		return compiledArg;
	});
	return failedArg ? [failedArg] : compiledArgs;
}
