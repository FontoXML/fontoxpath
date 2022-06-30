import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { filterOnUniqueObjects } from './annotateFlworExpression';

/**
 * If every type of alle the elements are the same we annotate the ast with that type *.
 * else inserts an item()* type to the AST, as sequence operator can contain multiple different ITEM types.
 * If we have an empty sequence, we return a Node type.
 * @param ast the AST to be annotated.
 * @returns `SequenceType` with multiplicity of `ZERO_OR_MORE`.
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
	} else if (length === 1) {
		seqType = types[0];
	} else {
		const contatinsUndefinedOrNull = types.includes(undefined) || types.includes(null);
		if (contatinsUndefinedOrNull) {
			seqType = {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		} else {
			const uniqueTypes = filterOnUniqueObjects(types);
			if (uniqueTypes.length > 1) {
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

	if (seqType && seqType.type !== ValueType.ITEM) {
		astHelper.insertAttribute(ast, 'type', seqType);
	}

	return seqType;
}
