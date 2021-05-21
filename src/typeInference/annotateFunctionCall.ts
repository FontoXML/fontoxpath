import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';

export function annotateFunctionCall(
	ast: IAST,
	annotationContext: AnnotationContext
): SequenceType | undefined {
	if (!annotationContext) return undefined;

	const functionName = astHelper.getFirstChild(ast, 'functionName')[2];
	const functionPrefix = astHelper.getFirstChild(ast, 'functionName')[1];
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	const resolvedName = annotationContext.staticContext.resolveFunctionName(
		{
			localName: functionName as string,
			prefix: functionPrefix['prefix'] as string,
		},
		functionArguments.length
	);

	if (!resolvedName) return undefined;

	const functionProps = annotationContext.staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		functionArguments.length
	);

	if (!functionProps) return undefined;

	astHelper.insertAttribute(ast, 'type', functionProps.returnType);
	return functionProps.returnType;
}
