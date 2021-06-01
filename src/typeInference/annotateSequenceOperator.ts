import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Inserts an item* type to the AST, as sequence operator can contain multiple different ITEM types.
 * The actual types are stores in the children nodes.
 * @param ast the AST to be annotated.
 * @returns `SequenceType` of type ITEM with multiplicity of `ZERO_OR_MORE` or undefined in case we have an empty sequence.
 */
export function annotateSequenceOperator(ast: IAST, length: number): SequenceType {
	if (length === 0) {
		// return undefined;
		const itemReturn = {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
		astHelper.insertAttribute(ast, 'type', itemReturn);
		return itemReturn;
	}
	const seqType = {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
