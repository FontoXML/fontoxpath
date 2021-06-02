import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * A method to annotate the FLWORExpression.
 * @param ast The ast containing the FLWORExpression
 * @param annotationContext THe context in which it gets annotated
 * @param annotate the annotationFunction as a callback
 * @returns The type of the entire ast, it always returns a item()*
 * if the expression contains a for loop otherwise it returns what the returnClause returns.
 */
export function annotateFlworExpression(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): SequenceType | undefined {
	let hasFor = false;
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
				// We only register the variable types if they are all of the same type
				hasFor = true;
				annotationContext.pushScope();
				annotateForClause(ast[i] as IAST, annotationContext, annotate);
				break;
			}
			case 'whereClause': {
				annotationContext.pushScope();
				annotateWhereClause(ast[i] as IAST, annotationContext, annotate);
				break;
			}
			case 'orderByClause': {
				annotationContext.pushScope();
				annotateOrderByClause(ast[i] as IAST, annotationContext);
				break;
			}
			default: {
				let retType: SequenceType = annotate(ast[i] as IAST, annotationContext);
				if (hasFor) {
					retType = { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
				}
				astHelper.insertAttribute(ast, 'type', retType);
				return retType;
			}
		}
	}
	annotationContext.popScope();
	return undefined;
}

/**
 * This method annotates the LetClause of the FLWORExpression,
 * the letClause does not return anything but only introduces new variables.
 * @param ast The ast containing the letClause
 * @param annotationContext The context in which it gets annotated and in which new variables will be introduced
 * @param annotate the annotate function as a callback to annotate the children
 */
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

/**
 * A method to annotate the ForClause.
 * @param ast the ast containing the forClause
 * @param annotationContext the context in which its being annotated
 * @param annotate the annotate function as a callback to annotate the children
 */
function annotateForClause(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): void {
	const pathToTypedVariableBinding = ['forClauseItem', 'typedVariableBinding', 'varName'];
	const pathToForExpr = ['forClauseItem', 'forExpr', 'sequenceExpr'];
	// const pathToForBody = ['forClauseItem', 'for'];
	const varName = astHelper.followPath(ast, pathToTypedVariableBinding)[1] as string;

	const varTypeNode: IAST = astHelper.followPath(ast, pathToForExpr);
	if (!varTypeNode) {
		return;
	}

	// A set of all the SequenceType in the sequenceExpr
	const allTypes: SequenceType[] = astHelper
		.getChildren(varTypeNode, '*')
		.map((element) => annotate(element, annotationContext));

	// filter on unique types
	const types = filterOnUniqueObjects(allTypes);

	// if there is only 1 unique type we can add the variable to have this type.
	if (types.length === 1) {
		annotationContext.insertVariable(varName, types[0]);
	}
}

/**
 * Annotate the where clause.
 * @param ast the ast containing the whereClause
 * @param annotationContext the context in which its being annotated
 * @param annotate the annotate function as a callback to annotate the children
 * @returns always returns exactly 1 boolean
 */
function annotateWhereClause(
	ast: IAST,
	annotationContext: AnnotationContext,
	annotate: (ast: IAST, annotationContext) => SequenceType
): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	// Annotate the child nodes
	annotate(ast, annotationContext);

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}

function annotateOrderByClause(ast: IAST, annotationContext: AnnotationContext): undefined {
	return undefined;
}

/**
 * A method to filter a SequenceTypeArray to only have unique items,
 *  by filtering the items whose first index is not equal to its own.
 * @param array the array to be filtered
 * @returns the filtered array
 */
function filterOnUniqueObjects(array: SequenceType[]): SequenceType[] {
	return array.filter(
		(current, index, arrayCopy) =>
			arrayCopy.findIndex(
				(element) => element.type === current.type && element.mult === current.mult
			) === index
	);
}
