import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateFunctionCall(
	ast: IAST,
	staticContext: StaticContext
): SequenceType | undefined {
	if (!staticContext) return undefined;

	const functionName = astHelper.getFirstChild(ast, 'functionName')[2];
	const functionPrefix = astHelper.getFirstChild(ast, 'functionName')[1];
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	const resolvedName = staticContext.resolveFunctionName(
		{
			localName: functionName as string,
			prefix: functionPrefix['prefix'] as string,
		},
		functionArguments.length
	);

	if (!resolvedName) return undefined;

	const functionProps = staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		functionArguments.length
	);

	if (!functionProps) return undefined;

	astHelper.insertAttribute(ast, 'type', functionProps.returnType);
	return functionProps.returnType;
}
