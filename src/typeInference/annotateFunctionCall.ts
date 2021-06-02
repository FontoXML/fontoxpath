import { SequenceType } from '../expressions/dataTypes/Value';
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
	argumentTypes: SequenceType[],
	context: AnnotationContext
): SequenceType | undefined {
	// We need the context to lookup the function information
	if (!context.staticContext) return undefined;

	const func = astHelper.getFirstChild(ast, 'functionName');
	let functionName: string;
	let functionPrefix: string;
	if (func.length === 3) {
		functionName = func[2] as string;
		functionPrefix = func[1] as string;
	} else {
		functionName = func[1] as string;
		functionPrefix = '';
	}
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	// Lookup the namespace URI
	const resolvedName = context.staticContext.resolveFunctionName(
		{
			localName: functionName,
			prefix: functionPrefix,
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
