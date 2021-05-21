import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateFunctionCall(
	ast: IAST,
	staticContext: StaticContext
): SequenceType | undefined {
	// We need the context to lookup the function information
	if (!staticContext) return undefined;

	const functionName = astHelper.getFirstChild(ast, 'functionName')[2];
	const functionPrefix = astHelper.getFirstChild(ast, 'functionName')[1];
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	// Lookup the namespace URI
	const resolvedName = staticContext.resolveFunctionName(
		{
			localName: functionName as string,
			prefix: functionPrefix['prefix'] as string,
		},
		functionArguments.length
	);

	if (!resolvedName) return undefined;

	// Lookup the function properties (return type)
	const functionProps = staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		functionArguments.length
	);

	if (!functionProps) return undefined;

	astHelper.insertAttribute(ast, 'type', functionProps.returnType);
	return functionProps.returnType;
}
