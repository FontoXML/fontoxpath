import StaticContext from '../expressions/StaticContext';
import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotate the arrowExpr by extracting the function info from the static context
 * and inserting the return type to the AST as new attribute `type`.
 *
 * @param ast the AST to be annotated.
 * @param staticContext from witch the function info is extracted.
 * @returns the inferred type or `undefined` when function properties cannot be inferred.
 */
export function annotateArrowExpr(
	ast: IAST,
	staticContext: StaticContext
): SequenceType | undefined {
    // We need the context to lookup the function information
    if (!staticContext) return undefined;

    const func = astHelper.getFirstChild(ast, 'EQName');

    // There may be no name for the function
    if (!func) {
        return undefined;
    }

    // Sometimes there is no prefix given, hence we need to check for that case and give an empty prefix
    let functionName;
    let functionPrefix;
    if (func.length === 3) {
        functionName = func[2];
        functionPrefix = func[1];
    }
    else {
        functionName = func[1];
        functionPrefix = '';
    }

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
