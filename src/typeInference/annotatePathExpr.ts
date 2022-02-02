import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * The type of the pathExpr is the type of the last step,
 * The type of a stepExpr is the type of the last expression in that step
 * if this is an axis we know it to return a NODE()*
 * if this is a filterExpression we can return the type of the filterExpression
 * otherwise we can assume it is a lookup and just default to item()*
 *
 * @param ast - the AST to be annotated.
 * @param annotationContext - The annotation context at this point
 * @returns the inferred SequenceType
 */
export function annotatePathExpr(ast: IAST, annotationContext: AnnotationContext): SequenceType {
	const steps = astHelper.getChildren(ast, 'stepExpr');
	if (!steps) {
		return { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
	}
	let retType;
	for (const step of steps) {
		annotateStep(step, annotationContext);
		retType = astHelper.getAttribute(step, 'type');
	}

	if (retType && retType.type !== ValueType.ITEM) {
		astHelper.insertAttribute(ast, 'type', retType);
	}

	return retType;
}

function annotateXPathAxis(axis: string): SequenceType {
	switch (axis) {
		// Forward axis
		case 'attribute': {
			return {
				type: ValueType.ATTRIBUTE,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		}
		case 'child':
		case 'decendant':
		case 'self':
		case 'descendant-or-self':
		case 'following-sibling':
		case 'following':
		case 'namespace':
		// Reverse axis
		case 'parent':
		case 'ancestor':
		case 'preceding-sibling':
		case 'preceding':
		case 'ancestor-or-self': {
			return {
				type: ValueType.NODE,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		}
	}
}

function annotateStep(step: IAST, annotationContext: AnnotationContext): SequenceType {
	let seqType;
	const item = { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
	if (!step) {
		return item;
	}
	const children = astHelper.getChildren(step, '*');
	for (const substep of children) {
		switch (substep[0]) {
			case 'filterExpr':
				seqType = astHelper.getAttribute(astHelper.followPath(substep, ['*']), 'type');
				break;
			case 'xpathAxis':
				seqType = annotateXPathAxis(substep[1] as string);
				break;
			case 'nameTest': {
				// Nametest: resolve the namespace URI and save it
				const qName: QName = astHelper.getQName(substep);
				if (qName.namespaceURI) {
					// Already resolved, no need
					break;
				}
				astHelper.insertAttribute(
					substep,
					'URI',
					annotationContext.resolveNamespace(qName.prefix)
				);
				break;
			}
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
			case 'Wildcard':
			case 'predicate':
			case 'predicates':
			case 'lookup':
		}
	}

	if (seqType && seqType.type !== ValueType.ITEM) {
		astHelper.insertAttribute(step, 'type', seqType);
	}

	return seqType;
}
