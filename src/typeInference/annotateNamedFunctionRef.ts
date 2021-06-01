import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotate named function references by extracting the function info from the static context
 * and inserting the return type to the AST as new attribute `type`.
 *
 * @param ast the AST to be annotated.
 * @param staticContext from witch the function info is extracted.
 * @returns the inferred type or `undefined` when the named function reference type cannot be inferred.
 */
export function annotateNamedFunctionRef(ast: IAST, staticContext: StaticContext): SequenceType {
	const itemReturn = {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};
	// Can't find info about the function without the context.
	if (!staticContext) {
		astHelper.insertAttribute(ast, 'type', itemReturn);
		return itemReturn;
	}

	// Get qualified function name
	const functionQName = astHelper.getQName(astHelper.getFirstChild(ast, 'functionName'));

	// Spice the components up
	let localName = functionQName[0];
	let namespaceURI = functionQName[1];
	const prefix = functionQName[2];

	const arity = astHelper.getFirstChild(ast, 'integerConstantExpr')[1][1];

	// If there is no namespace URI, resolve the function name
	if (!namespaceURI) {
		const functionName = staticContext.resolveFunctionName({ localName, prefix }, arity);

		if (!functionName) {
			astHelper.insertAttribute(ast, 'type', itemReturn);
			return itemReturn;
		}

		localName = functionName.localName;
		namespaceURI = functionName.namespaceURI;
	}

	// With all components there, look up the function properties
	const functionProperties = staticContext.lookupFunction(namespaceURI, localName, arity) || null;

	// If there are no function properties, there is no type inference
	if (!functionProperties) {
		astHelper.insertAttribute(ast, 'type', itemReturn);
		return itemReturn;
	}

	// Insert the type info into the AST and return
	astHelper.insertAttribute(ast, 'type', functionProperties.returnType);
	return functionProperties.returnType;
}
