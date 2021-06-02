import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * Annotate named function references by extracting the function info from the static context
 * and inserting the return type to the AST as new attribute `type`.
 *
 * @param ast the AST to be annotated.
 * @param staticContext from witch the function info is extracted.
 * @returns the inferred type or `undefined` when the named function reference type cannot be inferred.
 */
export function annotateNamedFunctionRef(
	ast: IAST,
	context: AnnotationContext
): SequenceType | undefined {
	// Can't find info about the function without the context.
	if (!context.staticContext) return undefined;

	// Get qualified function name
	const functionQName = astHelper.getQName(astHelper.getFirstChild(ast, 'functionName'));

	// Spice the components up
	let localName = functionQName[0];
	let namespaceURI = functionQName[1];
	const prefix = functionQName[2];

	const arity = astHelper.getFirstChild(ast, 'integerConstantExpr')[1][1];

	// If there is no namespace URI, resolve the function name
	if (!namespaceURI) {
		const functionName = context.staticContext.resolveFunctionName(
			{ localName, prefix },
			arity
		);

		if (!functionName) {
			return undefined;
		}

		localName = functionName.localName;
		namespaceURI = functionName.namespaceURI;
	}

	// With all components there, look up the function properties
	const functionProperties =
		context.staticContext.lookupFunction(namespaceURI, localName, arity) || null;

	// If there are no function properties, there is no type inference
	if (!functionProperties) return undefined;

	// Insert the type info into the AST and return

	astHelper.insertAttribute(ast, 'type', functionProperties.returnType);
	return functionProperties.returnType;
}
