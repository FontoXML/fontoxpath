import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * Annotate the function calls by extracting the function info from the static context
 * and inserting the return type to the AST as new attribute `type`.
 *
 * @param ast the AST to be annotated.
 * @param staticContext from witch the function info is extracted.
 * @returns the inferred type or `undefined` when function properties cannot be inferred.
 */
export function annotateFunctionCall(
	ast: IAST,
	context: AnnotationContext
): SequenceType | undefined {
	// We need the context to lookup the function information
	if (!context.staticContext) return undefined;

	const functionName = astHelper.getFirstChild(ast, 'functionName')[2];
	const functionPrefix = astHelper.getFirstChild(ast, 'functionName')[1];
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	// Lookup the namespace URI
	const resolvedName = context.staticContext.resolveFunctionName(
		{
			localName: functionName as string,
			prefix: functionPrefix['prefix'] as string,
		},
		functionArguments.length
	);

	if (!resolvedName) return undefined;

	// Lookup the function properties (return type)
	const functionProps = context.staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		functionArguments.length
	);

	if (!functionProps) return undefined;

	context.totalAnnotated[context.totalAnnotated.length - 1]++;
	astHelper.insertAttribute(ast, 'type', functionProps.returnType);
	return functionProps.returnType;
}
