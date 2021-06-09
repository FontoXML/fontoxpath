import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * The type of the pathExpr is the type of the last step,
 * The type of a stepExpr is the type of the last expression in that step
 * if this is an axis we know it to return a NODE()*
 * if this is a filterExpression we can return the type of the filterExpression
 * otherwise we can assume it is a lookup and just default to item()*
 *
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotatePathExpr(ast: IAST): SequenceType {
	const steps = astHelper.getChildren(ast, 'stepExpr');
	if (!steps) {
		return undefined;
	}
	let retType;
	for (const step of steps) {
		retType = annotateStep(step);
	}
	astHelper.insertAttribute(ast, 'type', retType);
	return retType;
}

function annotateStep(step: IAST): SequenceType {
	let seqType;
	if (!step) {
		return undefined;
	}
	const children = astHelper.getChildren(step, '*');
	const lastChild = children[children.length - 1];
	switch (lastChild[0]) {
		case 'filterExpr': {
			seqType = astHelper.getAttribute(astHelper.followPath(lastChild, ['*']), 'type');
			break;
		}
		case 'xpathAxis':
		case 'attributeTest':
		case 'anyElementTest':
		case 'piTest':
		case 'documentTest':
		case 'elementTest':
		case 'commentTest':
		case 'namespaceTest':
		case 'anyKindTest':
		case 'textTest':
		case 'anyFunctionTest':
		case 'typedFunctionTest':
		case 'schemaAttributeTest':
		case 'atomicType':
		case 'anyItemType':
		case 'parenthesizedItemType':
		case 'typedMapTest':
		case 'typedArrayTest':
		case 'nameTest':
		case 'Wildcard': {
			seqType = {
				type: ValueType.NODE,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
			break;
		}

		case 'predicate':
		case 'predicates': {
			seqType = {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
			break;
		}
		case 'lookup': {
			seqType = {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
			break;
		}
		default:
			seqType = {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
			return seqType;
	}
	astHelper.insertAttribute(step, 'type', seqType);
	return seqType;
}
