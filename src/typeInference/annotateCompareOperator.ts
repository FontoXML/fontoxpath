import Value, {
	SequenceType,
	ValueType,
	SequenceMultiplicity,
} from 'src/expressions/dataTypes/Value';
import { IAST } from 'src/parsing/astHelper';

export function annotateGeneralCompare(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (!left || !right) return undefined;

	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	return seqType;
}

export function annotateValueCompare(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (!left || !right) return undefined;

	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	return seqType;
}

export function annotateNodeCompare(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (!left || !right) return undefined;

	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	return seqType;
}
