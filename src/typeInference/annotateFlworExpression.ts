import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';
import { annotate } from './annotateAST';

export function annotateFlworExpression(
	ast: IAST,
	annotationContext: AnnotationContext
): SequenceType {
	let returnType = undefined;

	for (let i = 1; i < ast.length; i++) {
		switch (ast[i][0]) {
			case 'letClause':
				annotateLetClause(ast[i] as IAST, annotationContext);
			case 'returnClause':
				returnType = annotate(ast[i] as IAST, annotationContext);
				astHelper.insertAttribute(ast, 'type', returnType);
		}
	}

	return returnType;
}

function annotateLetClause(ast: IAST, annotationContext: AnnotationContext): void {
	const pathToVarName: string[] = ['letClauseItem', 'typedVariableBinding', 'varName'];
	const varNameNode: IAST = astHelper.followPath(ast, pathToVarName);
	const varName = varNameNode[1] as string;

	const pathToVarType: string[] = ['letClauseItem', 'letExpr'];
	const varTypeNode: IAST = astHelper.followPath(ast, pathToVarType);

	const varType: SequenceType = annotate(varTypeNode[1] as IAST, annotationContext);

	annotationContext.insertVariable(varName, varType);
}
