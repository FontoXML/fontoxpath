import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { filterOnUniqueObjects } from './annotateFlworExpression';

/**
 * Inserts an item()* type to the AST, as sequence operator can contain multiple different ITEM types.
 * If we have an empty sequence, we return a Node type.
 * @param ast the AST to be annotated.
 * @returns `SequenceType` of type ITEM with multiplicity of `ZERO_OR_MORE` or NODE in case we have an empty sequence.
 */
export function annotateSequenceOperator(
	ast: IAST,
	length: number,
	elems: IAST[],
	types: SequenceType[]
): SequenceType {
	let seqType;

	if (length === 0) {
		// We have an empty sequence here
		seqType = {
			type: ValueType.NODE,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	} else {
		const contatinsUndefined = types.includes(undefined);
		if (contatinsUndefined) {
			seqType = {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		} else {
			const uniqueTypes = filterOnUniqueObjects(types);
			if (uniqueTypes.length > 1 && !contatinsUndefined) {
				seqType = {
					type: ValueType.ITEM,
					mult: SequenceMultiplicity.ZERO_OR_MORE,
				};
			} else {
				seqType = {
					type: uniqueTypes[0].type,
					mult: SequenceMultiplicity.ZERO_OR_MORE,
				};
			}
		}
	}

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
