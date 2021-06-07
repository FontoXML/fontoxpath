import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Inserting the node type of multiplicity zero or more to the ast;
 * as the path expr evaluates to a node.
 *
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotatePathExpr(ast: IAST): SequenceType {
	let seqType;
	const children = astHelper.getChildren(ast, 'stepExpr');
	const lastChild = children[children.length - 1];
	if (children && lastChild) {
		if (astHelper.followPath(lastChild, ['filterExpr'])) {
			seqType = astHelper.getAttribute(
				astHelper.followPath(lastChild, ['filterExpr', '*']),
				'type'
			) as SequenceType;
		}
		if (astHelper.followPath(lastChild, ['xpathAxis'])) {
			seqType = {
				type: ValueType.NODE,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		}
	}
	if (seqType) console.log(seqType);
	if (!seqType) {
		seqType = {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}
	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
