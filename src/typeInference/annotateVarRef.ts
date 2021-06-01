import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';

export function annotateVarRef(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	// pass ast sub tree with the ast[0] as `varRef` to this function
	// ast[1] here would be the array of the variables to be returned
	// ast[1][0] always seems to be `name`?
	const varName: string = ast[1] as string;
	const varType: SequenceType = annotationContext.getVariable(varName);
	astHelper.insertAttribute(ast, 'type', varType);

	return varType;
}
