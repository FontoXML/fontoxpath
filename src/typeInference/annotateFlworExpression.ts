import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';

export function annotateFlworExpression(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): SequenceType | undefined {
	annotationContext.pushScope();

	for (let i = 1; i < ast.length; i++) {
		switch (ast[i][0]) {
			case 'letClause':
				annotateLetClause(ast[i] as IAST, annotationContext, annotate);
				break;
			default:
				const retType: SequenceType = annotate(ast[i] as IAST, annotationContext);
				astHelper.insertAttribute(ast, 'type', retType);

				annotationContext.popScope();
				return retType;
		}
	}

	annotationContext.popScope();
	return undefined;
}

function annotateLetClause(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): void {
	const pathToVarName: string[] = ['letClauseItem', 'typedVariableBinding', 'varName'];
	const varNameNode: IAST = astHelper.followPath(ast, pathToVarName);
	const varName = varNameNode[1] as string;

	const pathToVarType: string[] = ['letClauseItem', 'letExpr'];
	const varTypeNode: IAST = astHelper.followPath(ast, pathToVarType);

	const varType: SequenceType = annotate(varTypeNode[1] as IAST, annotationContext);

	annotationContext.insertVariable(varName, varType);
}

export function annotateVarRef(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	// pass ast sub tree with the ast[0] as `varRef` to this function
	// ast[1] here would be the array of the variables to be returned
	// ast[1][0] always seems to be `name`?
	const varName: string = ast[1] as string;
	const varType: SequenceType = annotationContext.getVariable(varName);
	astHelper.insertAttribute(ast, 'type', varType);

	return varType;
}
