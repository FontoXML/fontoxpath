import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * Annotate the arrowExpr by extracting the function info from the static context
 * and inserting the return type to the AST as new attribute `type`.
 *
 * @param ast the AST to be annotated.
 * @param staticContext from witch the function info is extracted.
 * @returns the inferred type or `undefined` when function properties cannot be inferred.
 */
export function annotateArrowExpr(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	// We need the context to lookup the function information
	if (!annotationContext || !annotationContext.staticContext) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	const func = astHelper.getFirstChild(ast, 'EQName');

	// There may be no name for the function
	if (!func) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// Get qualified function name
	const qName: QName = astHelper.getQName(func);
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

	// If we did not find the function, we return item()*
	if (!resolvedName) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// Lookup the function properties (return type)
	const functionProps = annotationContext.staticContext.lookupFunction(
		resolvedName.namespaceURI,
		resolvedName.localName,
		// Since this is an arrowExpr, we add one for the implicit argument
		functionArguments.length + 1
	);

	// If we did not find the returnType, we return item()*
	if (!functionProps) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// If we found a returnType, we annotate the AST with it
	if (functionProps.returnType.type !== ValueType.ITEM) {
		astHelper.insertAttribute(ast, 'type', functionProps.returnType);
	}
	return functionProps.returnType;
}
