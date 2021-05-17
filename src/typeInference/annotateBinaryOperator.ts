import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { insertAttribute } from './annotateAST';

type BinOpLookupTable = {
	[key: number]: ValueType;
};

// TODO: fix this weird hashing thing
const BINOP_LOOKUP: BinOpLookupTable = {
	[ValueType.XSINTEGER + ValueType.XSINTEGER * 1000]: ValueType.XSINTEGER,
	[ValueType.XSDECIMAL + ValueType.XSDECIMAL * 1000]: ValueType.XSDECIMAL,
	[ValueType.XSFLOAT + ValueType.XSFLOAT * 1000]: ValueType.XSFLOAT,
};

export function annotateAddOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
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
			type: BINOP_LOOKUP[left.type + right.type * 1000] || ValueType.XSDECIMAL,
			mult: left.mult,
		};
		insertAttribute(ast, type);
		return type;
	}

	if (
		left.type === ValueType.XSYEARMONTHDURATION &&
		right.type === ValueType.XSYEARMONTHDURATION
	) {
		const yearMonthDurationSequenceType = {
			type: ValueType.XSYEARMONTHDURATION,
			mult: left.mult,
		};
		insertAttribute(ast, yearMonthDurationSequenceType);
		return yearMonthDurationSequenceType;
	}

	if (
		isSubtypeOf(left.type, ValueType.XSNUMERIC) &&
		right.type === ValueType.XSYEARMONTHDURATION
	) {
		const yearMonthDurationSequenceType = {
			type: ValueType.XSYEARMONTHDURATION,
			mult: left.mult,
		};
		insertAttribute(ast, yearMonthDurationSequenceType);
		return yearMonthDurationSequenceType;
	}

	if (
		left.type === ValueType.XSYEARMONTHDURATION &&
		isSubtypeOf(right.type, ValueType.XSNUMERIC)
	) {
		const yearMonthDurationSequenceType = {
			type: ValueType.XSYEARMONTHDURATION,
			mult: left.mult,
		};

		insertAttribute(ast, yearMonthDurationSequenceType);
		return yearMonthDurationSequenceType;
	}

	if (left.type === ValueType.XSDAYTIMEDURATION && right.type === ValueType.XSDAYTIMEDURATION) {
		const dayTimeDurationSequenceType = {
			type: ValueType.XSDAYTIMEDURATION,
			mult: left.mult,
		};

		insertAttribute(ast, dayTimeDurationSequenceType);
		return dayTimeDurationSequenceType;
	}

	if (
		(isSubtypeOf(left.type, ValueType.XSDATETIME) &&
			right.type === ValueType.XSYEARMONTHDURATION) ||
		(isSubtypeOf(left.type, ValueType.XSDATETIME) && right.type === ValueType.XSDAYTIMEDURATION)
	) {
		const dayTimeSequenceType = {
			type: ValueType.XSDATETIME,
			mult: left.mult,
		};

		insertAttribute(ast, dayTimeSequenceType);
		return dayTimeSequenceType;
	}

	if (
		(isSubtypeOf(left.type, ValueType.XSDATE) &&
			right.type === ValueType.XSYEARMONTHDURATION) ||
		(isSubtypeOf(left.type, ValueType.XSDATE) && right.type === ValueType.XSDAYTIMEDURATION)
	) {
		const dateSequenceType = {
			type: ValueType.XSDATE,
			mult: left.mult,
		};

		insertAttribute(ast, dateSequenceType);
		return dateSequenceType;
	}

	if (left.type === ValueType.XSTIME && right.type === ValueType.XSDAYTIMEDURATION) {
		const timeSequenceType = {
			type: ValueType.XSTIME,
			mult: left.mult,
		};

		insertAttribute(ast, timeSequenceType);
		return timeSequenceType;
	}

	if (
		(right.type === ValueType.XSYEARMONTHDURATION &&
			isSubtypeOf(left.type, ValueType.XSDATETIME)) ||
		(right.type === ValueType.XSDAYTIMEDURATION && isSubtypeOf(left.type, ValueType.XSDATETIME))
	) {
		const dayTimeSequenceType = {
			type: ValueType.XSDATETIME,
			mult: left.mult,
		};

		insertAttribute(ast, dayTimeSequenceType);
		return dayTimeSequenceType;
	}

	if (
		(right.type === ValueType.XSDAYTIMEDURATION && left.type === ValueType.XSDATE) ||
		(right.type === ValueType.XSYEARMONTHDURATION && left.type === ValueType.XSDATE)
	) {
		const dateSequenceType = {
			type: ValueType.XSDATE,
			mult: left.mult,
		};

		insertAttribute(ast, dateSequenceType);
		return dateSequenceType;
	}

	if (right.type === ValueType.XSDAYTIMEDURATION && left.type === ValueType.XSTIME) {
		const timeSequenceType = {
			type: ValueType.XSTIME,
			mult: left.mult,
		};

		insertAttribute(ast, timeSequenceType);
		return timeSequenceType;
	}

	return undefined;
}
