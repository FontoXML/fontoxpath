import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

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
	annotationContext: AnnotationContext
): SequenceType {
	// We need the context to lookup the function information
	if (!annotationContext || !annotationContext.staticContext) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// Get qualified function name
	const functionNameAstNode = astHelper.getFirstChild(ast, 'functionName');
	const qName: QName = astHelper.getQName(functionNameAstNode);
	const localName = qName.localName;
	const prefix = qName.prefix;

	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	// Lookup the namespace URI
	const resolvedName = annotationContext.staticContext.resolveFunctionName(
		{
			localName,
			prefix,
		},
		functionArguments.length
	);

	if (!resolvedName) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	astHelper.insertAttribute(functionNameAstNode, 'URI', resolvedName.namespaceURI);

	// Lookup the function properties (return type)
	const functionProps = annotationContext.staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		functionArguments.length
	);

	// If we did not find a returnType, we return item()*
	if (!functionProps) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	if (functionProps.returnType.type === ValueType.NONE) {
		// Special case: the `error` function. This does not really return anything ever. Do not use the return type.
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// If we found a return type, we annotate the AST with it
	if (functionProps.returnType.type !== ValueType.ITEM) {
		astHelper.insertAttribute(ast, 'type', functionProps.returnType);
	}
	return functionProps.returnType;
}
