import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { annotate } from './annotateAST';

type BinOpLookupTable = {
	[key: number]: ValueType;
};

// TODO: fix this weird hashing thing
const BINOP_LOOKUP: BinOpLookupTable = {
	[ValueType.XSINTEGER + ValueType.XSINTEGER * 1000]: ValueType.XSINTEGER,
	[ValueType.XSDECIMAL + ValueType.XSDECIMAL * 1000]: ValueType.XSDECIMAL,
	[ValueType.XSFLOAT + ValueType.XSFLOAT * 1000]: ValueType.XSFLOAT,
};

export function annotateAddOp(ast: IAST): SequenceType | undefined {
	const left = annotate(ast[1][1] as IAST);
	const right = annotate(ast[2][1] as IAST);

	if (!left || !right) {
		return undefined;
	}

	if (left.mult !== right.mult) {
		throw new Error('PANIC!');
	}

	if (
		isSubtypeOf(left.type, ValueType.XSNUMERIC) &&
		isSubtypeOf(right.type, ValueType.XSNUMERIC)
	) {
		const type = {
			type: BINOP_LOOKUP[left.type + right.type * 1000] ?? ValueType.XSDECIMAL,
			mult: left.mult,
		};
		ast.push(['type', type]);
		return type;
	}

	return undefined;
}
