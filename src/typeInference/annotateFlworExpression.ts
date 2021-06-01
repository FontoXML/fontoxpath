import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';

export function annotateFlworExpression(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): SequenceType | undefined {
	for (let i = 1; i < ast.length; i++) {
		switch (ast[i][0]) {
			case 'letClause': {
				annotationContext.pushScope();
				annotateLetClause(ast[i] as IAST, annotationContext, annotate);
				break;
			}
			case 'forClause': {
				// `For` expression returns sequence type (XS:ITEM)
				// However, the variable registration of the elements in the sequence is not properly handled
				// We only registrate the variable types if they are all of the same type
				annotationContext.pushScope();
				annotateForClause(ast[i] as IAST, ast as IAST, annotationContext, annotate);
				annotationContext.popScope();

				const retType = { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
				astHelper.insertAttribute(ast, 'type', retType);
				return retType;
			}
			// case 'whereClause': {
			// 	// WIP
			// 	annotationContext.pushScope();
			// 	annotateWhereClause(ast[i] as IAST, annotationContext, annotate);
			// 	break;
			// }
			// case 'orderByClause': {
			// 	// WIP
			// 	annotationContext.pushScope();
			// 	annotateOrderByClause(ast[i] as IAST, annotationContext, annotate);
			// 	break;
			// }
			default: {
				let retType: SequenceType = annotate(ast[i] as IAST, annotationContext);
				astHelper.insertAttribute(ast, 'type', retType);
				return retType;
			}
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

function annotateForClause(
	ast: IAST,
	fullAst: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
) {
	const pathToTypedVariableBinding = ['forClauseItem', 'typedVariableBinding', 'varName'];
	const pathToForExpr = ['forClauseItem', 'forExpr', 'sequenceExpr'];
	// const pathToForBody = ['forClauseItem', 'for'];
	const varName = astHelper.followPath(ast, pathToTypedVariableBinding)[1] as string;

	let varTypeNode: IAST;
	try {
		varTypeNode = astHelper.followPath(ast, pathToForExpr);
	} catch {
		return;
	}

	// A set of all the SequenceType in the sequenceExpr
	const allTypes: SequenceType[] = astHelper
		.getChildren(varTypeNode, '*')
		.map((element) => annotate(element, annotationContext));
	const types = allTypes.filter(
		(current, index, array) =>
			array.findIndex(
				(element) => element.type === current.type && element.mult === current.mult
			) === index
	);

	const fullAstCopy: IAST[] = [];
	fullAst.forEach((element) => fullAstCopy.push(element as IAST));

	// Remove the first two indeces which (for clause related)
	fullAstCopy.splice(1, 1);
	if (types.length === 1) {
		annotationContext.insertVariable(varName, types[0]);
	}
	annotateFlworExpression(fullAstCopy as IAST, annotationContext, annotate);
}

/**
 * Get all the child nodes (elements in the for sequence expression), and return their unique types.
 *
 * @param varTypeNode the node that contains all children of sequenceExpr.
 * @return the unique types.
 */
// function uniqueArray(varTypeNode: IAST): SequenceType[] {
// A set of all the SequenceType in the sequenceExpr
// const allTypes: SequenceType[] = astHelper
// 	.getChildren(varTypeNode, '*')
// 	.map((element) => annotate(element, annotationContext));
// const types = allTypes.filter(
// 	(current, index, array) =>
// 		array.findIndex(
// 			(element) => element.type === current.type && element.mult === current.mult
// 		) === index
// );
// return types
// }

function annotateWhereClause(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
) {
	return undefined;
}
function annotateOrderByClause(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
) {
	return undefined;
}
