import { SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * The method to annotate the varRef node
 *
 * @param ast the ast containing the varRef
 * @param annotationContext the context in which its being annotated
 * @returns the type of the variable as SequenceType if it is contained in the context
 */
export function annotateVarRef(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	const varName = astHelper.getQName(astHelper.getFirstChild(ast, 'name'));

	const varType: SequenceType = annotationContext.getVariable(varName.localName);
	if (varType && varType.type !== ValueType.ITEM) {
		astHelper.insertAttribute(ast, 'type', varType);
	}

	if (varName.namespaceURI === null) {
		const uri = annotationContext.resolveNamespace(varName.prefix);
		if (uri !== undefined) {
			astHelper.insertAttribute(ast, 'URI', uri);
		}
	}

	return varType;
}
