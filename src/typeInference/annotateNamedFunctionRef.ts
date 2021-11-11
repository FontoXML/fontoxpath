import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from '../typeInference/AnnotationContext';

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
	annotationContext: AnnotationContext
): SequenceType {
	// Can't find info about the function without the context.
	if (!annotationContext || !annotationContext.staticContext) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// Get qualified function name
	const qName: QName = astHelper.getQName(astHelper.getFirstChild(ast, 'functionName'));
	let localName = qName.localName;
	let namespaceURI = qName.namespaceURI;
	const prefix = qName.prefix;

	const arity: number = Number(
		astHelper.followPath(ast, ['integerConstantExpr', 'value'])[1] as string
	);

	// If there is no namespace URI, resolve the function name
	if (!namespaceURI) {
		const functionName = annotationContext.staticContext.resolveFunctionName(
			{ localName, prefix },
			arity
		);

		if (!functionName) {
			return {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		}

		localName = functionName.localName;
		namespaceURI = functionName.namespaceURI;
	}

	// With all components there, look up the function properties
	const functionProperties =
		annotationContext.staticContext.lookupFunction(namespaceURI, localName, arity) || null;

	// If there are no function properties, there is no type inference
	if (!functionProperties) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	// Insert the type info into the AST and return
	if (
		functionProperties.returnType.type !== ValueType.ITEM &&
		functionProperties.returnType.type !== ValueType.NONE
	) {
		astHelper.insertAttribute(ast, 'type', functionProperties.returnType);
	}
	return functionProperties.returnType;
}
