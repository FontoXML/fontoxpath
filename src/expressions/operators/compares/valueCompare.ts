import castToType from '../../dataTypes/castToType';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';

import {
	equal as dateTimeEqual,
	greaterThan as dateTimeGreaterThan,
	lessThan as dateTimeLessThan,
} from '../../dataTypes/valueTypes/DateTime';
import {
	greaterThan as dayTimeDurationGreaterThan,
	lessThan as dayTimeDurationLessThan,
} from '../../dataTypes/valueTypes/DayTimeDuration';
import {
	greaterThan as yearMonthDurationGreaterThan,
	lessThan as yearMonthDurationLessThan,
} from '../../dataTypes/valueTypes/YearMonthDuration';

import {
	BaseType,
	ValueType,
	SequenceType,
	valueTypeHash,
} from '../../../expressions/dataTypes/Value';
import AtomicValue from '../../dataTypes/AtomicValue';
import DynamicContext from '../../DynamicContext';

// Use partial application to get to a comparer faster
function areBothStringOrAnyURI(a, b) {
	return (
		(isSubtypeOf(a, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
			isSubtypeOf(a, { kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE })) &&
		(isSubtypeOf(b, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
			isSubtypeOf(b, { kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }))
	);
}

function generateCompareFunction(
	operator: string,
	typeA: ValueType,
	typeB: ValueType,
	dynamicContext: DynamicContext
): (valA: any, valB: any) => boolean {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (
		isSubtypeOf(typeA, { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) &&
		isSubtypeOf(typeB, { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		typeA = typeB = { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE };
	} else if (
		isSubtypeOf(typeA, { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		castFunctionForValueA = (val) => castToType(val, typeB);
		typeA = typeB;
	} else if (
		isSubtypeOf(typeB, { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		castFunctionForValueB = (val) => castToType(val, typeA);
		typeB = typeA;
	}

	function applyCastFunctions(valA, valB) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valA) : valA,
			castB: castFunctionForValueB ? castFunctionForValueB(valB) : valB,
		};
	}

	if (
		isSubtypeOf(typeA, { kind: BaseType.XSQNAME, seqType: SequenceType.EXACTLY_ONE }) &&
		isSubtypeOf(typeB, { kind: BaseType.XSQNAME, seqType: SequenceType.EXACTLY_ONE })
	) {
		if (operator === 'eqOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					castA.value.namespaceURI === castB.value.namespaceURI &&
					castA.value.localName === castB.value.localName
				);
			};
		}
		if (operator === 'neOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					castA.value.namespaceURI !== castB.value.namespaceURI ||
					castA.value.localName !== castB.value.localName
				);
			};
		}
		throw new Error('XPTY0004: Only the "eq" and "ne" comparison is defined for xs:QName');
	}

	function areBothSubtypeOf(type: ValueType) {
		return isSubtypeOf(typeA, type) && isSubtypeOf(typeB, type);
	}

	if (
		areBothSubtypeOf({ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSNUMERIC, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothStringOrAnyURI(typeA, typeB)
	) {
		switch (operator) {
			case 'eqOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value === castB.value;
				};
			case 'neOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value !== castB.value;
				};
			case 'ltOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value < castB.value;
				};
			case 'leOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value <= castB.value;
				};
			case 'gtOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value > castB.value;
				};
			case 'geOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value >= castB.value;
				};
		}
	}

	if (
		areBothSubtypeOf({ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE })
	) {
		switch (operator) {
			case 'eqOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeEqual(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone()
					);
				};
			case 'neOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !dateTimeEqual(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone()
					);
				};

			case 'ltOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeLessThan(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone()
					);
				};
			case 'leOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return (
						dateTimeEqual(
							castA.value,
							castB.value,
							dynamicContext.getImplicitTimezone()
						) ||
						dateTimeLessThan(
							castA.value,
							castB.value,
							dynamicContext.getImplicitTimezone()
						)
					);
				};

			case 'gtOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeGreaterThan(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone()
					);
				};
			case 'geOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return (
						dateTimeEqual(
							castA.value,
							castB.value,
							dynamicContext.getImplicitTimezone()
						) ||
						dateTimeGreaterThan(
							castA.value,
							castB.value,
							dynamicContext.getImplicitTimezone()
						)
					);
				};
		}
	}

	if (
		areBothSubtypeOf({ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }) ||
		areBothSubtypeOf({ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE })
	) {
		switch (operator) {
			case 'eqOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeEqual(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone()
					);
				};
			case 'neOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !dateTimeEqual(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone()
					);
				};
		}
	}

	if (
		areBothSubtypeOf({ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE })
	) {
		switch (operator) {
			case 'ltOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return yearMonthDurationLessThan(castA.value, castB.value);
				};
			case 'leOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return (
						castA.value.equals(castB.value) ||
						yearMonthDurationLessThan(castA.value, castB.value)
					);
				};

			case 'gtOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return yearMonthDurationGreaterThan(castA.value, castB.value);
				};
			case 'geOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return (
						castA.value.equals(castB.value) ||
						yearMonthDurationGreaterThan(castA.value, castB.value)
					);
				};
		}
	}

	if (areBothSubtypeOf({ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		switch (operator) {
			case 'eqOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value);
				};
			case 'ltOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dayTimeDurationLessThan(castA.value, castB.value);
				};
			case 'leOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return (
						castA.value.equals(castB.value) ||
						dayTimeDurationLessThan(castA.value, castB.value)
					);
				};
			case 'gtOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dayTimeDurationGreaterThan(castA.value, castB.value);
				};
			case 'geOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return (
						castA.value.equals(castB.value) ||
						dayTimeDurationGreaterThan(castA.value, castB.value)
					);
				};
		}
	}

	if (areBothSubtypeOf({ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		switch (operator) {
			case 'eqOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value);
				};
			case 'neOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !castA.value.equals(castB.value);
				};
		}
	}

	throw new Error(`XPTY0004: ${operator} not available for ${typeA} and ${typeB}`);
}

const comparatorsByTypingKey = Object.create(null);

export default function (
	operator: string,
	valueA: AtomicValue,
	valueB: AtomicValue,
	dynamicContext: DynamicContext
): boolean {
	// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
	// TODO: Find a more errorproof solution, hash collisions can occur here
	const typingKey = `${valueTypeHash(valueA.type)}~${valueTypeHash(valueB.type)}~${operator}`;
	let prefabComparator = comparatorsByTypingKey[typingKey];
	if (!prefabComparator) {
		prefabComparator = comparatorsByTypingKey[typingKey] = generateCompareFunction(
			operator,
			valueA.type,
			valueB.type,
			dynamicContext
		);
	}

	return prefabComparator(valueA, valueB);
}
