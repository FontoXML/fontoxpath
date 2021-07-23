import { FunctionProperties } from '../expressions/functions/functionRegistry';
import QName from '../expressions/dataTypes/valueTypes/QName';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import {
	acceptAst,
	CompiledResultType,
	getCompiledValueCode,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';
import { DONE_TOKEN, ready } from 'src/expressions/util/iterators';
import ISequence from 'src/expressions/dataTypes/ISequence';

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

	const compiledArgs: PartialCompilationResult = staticContext.emitBaseExpr(
		args[0],
		`${identifier}_args1`,
		staticContext
	);

	if (!compiledArgs.isAstAccepted) {
		return compiledArgs;
	}

	const functionDefenition: string = `const ${identifier}_function = ${props.callFunction.toString()}`
		.split('sequenceFactory_1.default')
		.join('sequenceFactory')
		.split('zipSingleton_1.default')
		.join('zipSingleton')
		.split('createAtomicValue_1.default')
		.join('createAtomicValue')
		.split('Value_1')
		.join('Value')
		.split('Value.ValueType')
		.join('ValueType')
		.split('callFunction')
		.join('function callFunction');

	if (functionDefenition.includes('native code')) {
		return rejectAst(`Unsupported: function: ${props.localName}`);
	}
	let functioncallCode;

	functioncallCode = `
		const ${identifier} = ${identifier}_function(null, null, null, ${convertToSequence}(
			${getCompiledValueCode(identifier + '_args1', compiledArgs.resultType)}
		)).value.next().value.value;
	`;

	let vars = [functionDefenition];
	vars.push(compiledArgs.code);

	return acceptAst(vars.join('\n') + '\n' + functioncallCode, CompiledResultType.Value);
}

const convertToSequence = `((toAtomize) => {
	let hasReturned = false;
	return atomize(
			{ 
				value: {
					next: () => {
						if (hasReturned) {
							return DONE_TOKEN;
						}
						hasReturned = true;
						return ready({value: toAtomize, type: 19});
					},
					[Symbol.iterator]() { return this; }
				}
			}, 
		{}
	);
	;
})`;
