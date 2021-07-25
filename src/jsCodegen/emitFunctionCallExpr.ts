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
	PartialCompilationResult,
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

	if (args.length !== 1) {
		return rejectAst('Unsupported: functionExpression not defined');
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
	const compiledArgs: PartialCompilationResult = staticContext.emitBaseExpr(
		args[0],
		`${identifier}_args1`,
		staticContext
	);

	if (!astHelper.getAttribute(args[0], 'type')) {
		return rejectAst('type not known');
	}

	if (!compiledArgs.isAstAccepted) {
		return compiledArgs;
	}

	const functionArrayIndex = staticContext.functions.push(props.callFunction);

	const CompiledValueCode = getCompiledValueCode(identifier + '_args1', compiledArgs.resultType);
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
	const ${identifier}_function = builtInFunctions[${functionArrayIndex - 1}]
	`;

	const functioncallCode = `
		let ${identifier} = ${identifier}_function(
			null, 
			null, 
			null, 
			sequenceFactory.create(new Value(${type}, ${CompiledValueCode}))
			)
		${identifier} = convertXDMReturnValue("null", ${identifier}, 0, null);
	`;

	let vars = [functionDefenition, compiledArgs.code];

	return acceptAst(vars.join('\n') + '\n' + functioncallCode, CompiledResultType.Value);
}
