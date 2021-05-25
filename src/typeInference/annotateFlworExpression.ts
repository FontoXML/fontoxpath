import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';

export function annotateFlworExpression(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): SequenceType | undefined {
	for (let i = 1; i < ast.length; i++) {
		switch (ast[i][0]) {
			case 'letClause':
				annotateLetClause(ast[i] as IAST, annotationContext, annotate);
				break;
			case 'returnClause':
				// ast[i][1] is the varRef child node from the returnClause node
				const returnType = annotateFlworExpression(
					ast[i] as IAST,
					annotationContext,
					annotate
				);
				astHelper.insertAttribute(ast, 'type', returnType);
				return returnType;
			case 'varRef':
				return annotateReturnClause(ast[1] as IAST, annotationContext);
		}
	}

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

function annotateReturnClause(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	// pass ast sub tree with the ast[0] as `varRef` to this function
	// ast[1] here would be the array of the variables to be returned
	// ast[1][0] always seems to be `name`?
	const varName: string = ast[1][1];
	const varType: SequenceType = annotationContext.getVariable(varName);

	return varType;
}
