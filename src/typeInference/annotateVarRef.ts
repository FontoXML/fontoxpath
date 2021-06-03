import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * The method to annotate the varRef node
 * @param ast the ast containing the varRef
 * @param annotationContext the context in which its being annotated
 * @returns the type of the variable as SequenceType if it is contained in the context
 */
export function annotateVarRef(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	const varName: string = (ast[1] as IAST)[1] as string;
	const varType: SequenceType = annotationContext.getVariable(varName);
	if (varType) {
		astHelper.insertAttribute(ast, 'type', varType);
	}

	return varType;
}
