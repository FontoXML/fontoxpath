import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import { FunctionProperties } from '../expressions/functions/functionRegistry';
import astHelper, { IAST } from '../parsing/astHelper';
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

export function emitFunctionCallExpr(
	ast: IAST,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const functionName: QName = astHelper.getQName(astHelper.getFirstChild(ast, 'functionName'));
	const args: IAST[] = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	const localName = functionName.localName;
	const prefix = functionName.prefix;
	const resolvedName = staticContext.staticContext.resolveFunctionName(
		{
			localName,
			prefix,
		},
		args.length
	);

	if (!resolvedName) return rejectAst('Unsupported: function localName not found');

	const props: FunctionProperties = staticContext.staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		args.length
	);

	if (resolvedName.localName === 'parse-json') {
		return rejectAst(`function ${resolvedName.localName} is not supported`);
	}

	if (args.length !== 1 && args.length !== 0) {
		return rejectAst('Unsupported: functionExpression with more then 1 parameter');
	}

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
		return emitFunctionWithZeroArguments(ast, identifier, staticContext, functionArrayIndex);
	}

	const compiledArgs: PartialCompilationResult[] = compileArguments(
		args,
		staticContext,
		identifier
	);
	if (!compiledArgs[0].isAstAccepted) return compiledArgs[0];

	const CompiledValueCode = getCompiledValueCode(
		identifier + '_args1',
		(compiledArgs[0] as PartiallyCompiledAstAccepted).resultType
	);
	const type = astHelper.getAttribute(args[0], 'type').type;

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
		const ${identifier}_helper = ${createSequence(type, CompiledValueCode)}
		let ${identifier} = ${identifier}_function(
			null, 
			null, 
			null, 
			${identifier}_helper()
			)
		${identifier} = convertXDMReturnValue("null", ${identifier}, 0, null);
	`;

	let vars = [
		functionDefenition,
		(compiledArgs[0] as PartiallyCompiledAstAccepted).code,
		functioncallCode,
	];

	return acceptAst(vars.join('\n'), CompiledResultType.Value);
}

function emitFunctionWithZeroArguments(
	ast: IAST,
	identifier: string,
	staticContext: CodeGenContext,
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

	let vars = [functionDefenition, functioncallCode];

	return acceptAst(vars.join('\n'), CompiledResultType.Value);
}

function createSequence(type: ValueType, CompiledValueCode: string) {
	return `() => {
		if(typeof ${CompiledValueCode} !== 'string' && ${CompiledValueCode}.length === 0) {
			return sequenceFactory.empty()
		} else if(${CompiledValueCode}.next) {
			const nodes = [];
			for (const node of ${CompiledValueCode}) {
				nodes.push(node.value.node);
			}
			if(nodes.length === 0) {
				return sequenceFactory.empty();
			} else {
				return sequenceFactory.create(new Value(${type}, nodes));
			}			
		}
		return sequenceFactory.create(new Value(${type}, ${CompiledValueCode}))
	}`;
}

function compileArguments(
	args: IAST[],
	staticContext: CodeGenContext,
	identifier: string
): PartialCompilationResult[] {
	let failedArg: IAstRejected = undefined;
	const compiledArgs: PartialCompilationResult[] = args.map((arg) => {
		const compiledArg = staticContext.emitBaseExpr(arg, `${identifier}_args1`, staticContext);
		if (!compiledArg.isAstAccepted) {
			failedArg = compiledArg as IAstRejected;
		} else if (!astHelper.getAttribute(arg, 'type')) {
			failedArg = rejectAst('type of parameter unknown');
		}
		return compiledArg;
	});
	if (failedArg) return [failedArg];
	return compiledArgs;
}
