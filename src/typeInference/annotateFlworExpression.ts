import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';

export function annotateFlworExpression(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): SequenceType | undefined {
	let hasForClause: boolean = false;
	for (let i = 1; i < ast.length; i++) {
		switch (ast[i][0]) {
			case 'letClause':
				annotationContext.pushScope();
				annotateLetClause(ast[i] as IAST, annotationContext, annotate);
				break;
			case 'forClause':
				// `For` expression returns sequence type (XS:ITEM)
				// TODO: Annotation not yet implemented
				// However, the variable registration of the elements in the sequence is not properly handled
				// We only registrate the variable types if they are all of the same type
				//
				hasForClause = true;
				annotationContext.pushScope();
				annotateForClause(ast[i] as IAST, ast as IAST, annotationContext, annotate);
				return { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
			case 'whereClause':
				// WIP
				annotationContext.pushScope();
				annotateWhereClause(ast[i] as IAST, annotationContext, annotate);
				break;
			case 'orderByClause':
				// WIP
				annotationContext.pushScope();
				annotateOrderByClause(ast[i] as IAST, annotationContext, annotate);
				break;
			default:
				let retType: SequenceType = annotate(ast[i] as IAST, annotationContext);
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
		return undefined;
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

	// Remove the first index which is the for Clause
	fullAstCopy.splice(0, 2);

	// set = all diffrent types in elements
	// for every type in set run annotateflworexpr

	types.forEach((sequenceType) => {
		annotationContext.insertVariable(varName, sequenceType);
		annotateFlworExpression(fullAstCopy as IAST, annotationContext, annotate);
		annotationContext.removeVariable(varName);
	});
}
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
