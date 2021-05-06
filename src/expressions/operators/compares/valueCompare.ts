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
	valueTypeToString,
} from '../../../expressions/dataTypes/Value';
import AtomicValue from '../../dataTypes/AtomicValue';
import DynamicContext from '../../DynamicContext';

// Use partial application to get to a comparer faster
function areBothStringOrAnyURI(a: BaseType, b: BaseType) {
	return (
		(isSubtypeOf(a, BaseType.XSSTRING) || isSubtypeOf(a, BaseType.XSANYURI)) &&
		(isSubtypeOf(b, BaseType.XSSTRING) || isSubtypeOf(b, BaseType.XSANYURI))
	);
}

function generateCompareFunction(
	operator: string,
	typeA: ValueType,
	typeB: ValueType,
	dynamicContext: DynamicContext
): (valA: any, valB: any) => boolean {
	let castFunctionForValueA: (x: AtomicValue) => AtomicValue = null;
	let castFunctionForValueB: (x: AtomicValue) => AtomicValue = null;

	if (
		isSubtypeOf(typeA.kind, BaseType.XSUNTYPEDATOMIC) &&
		isSubtypeOf(typeB.kind, BaseType.XSUNTYPEDATOMIC)
	) {
		typeA = typeB = { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE };
	} else if (isSubtypeOf(typeA.kind, BaseType.XSUNTYPEDATOMIC)) {
		castFunctionForValueA = (val: AtomicValue) => castToType(val, typeB);
		typeA = typeB;
	} else if (isSubtypeOf(typeB.kind, BaseType.XSUNTYPEDATOMIC)) {
		castFunctionForValueB = (val: AtomicValue) => castToType(val, typeA);
		typeB = typeA;
	}

	function applyCastFunctions(valA: AtomicValue, valB: AtomicValue) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valA) : valA,
			castB: castFunctionForValueB ? castFunctionForValueB(valB) : valB,
		};
	}

	if (isSubtypeOf(typeA.kind, BaseType.XSQNAME) && isSubtypeOf(typeB.kind, BaseType.XSQNAME)) {
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

	function areBothSubtypeOf(type: BaseType) {
		return isSubtypeOf(typeA.kind, type) && isSubtypeOf(typeB.kind, type);
	}

	if (
		areBothSubtypeOf(BaseType.XSBOOLEAN) ||
		areBothSubtypeOf(BaseType.XSSTRING) ||
		areBothSubtypeOf(BaseType.XSNUMERIC) ||
		areBothSubtypeOf(BaseType.XSANYURI) ||
		areBothSubtypeOf(BaseType.XSHEXBINARY) ||
		areBothSubtypeOf(BaseType.XSBASE64BINARY) ||
		areBothStringOrAnyURI(typeA.kind, typeB.kind)
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
		areBothSubtypeOf(BaseType.XSDATETIME) ||
		areBothSubtypeOf(BaseType.XSDATE) ||
		areBothSubtypeOf(BaseType.XSTIME)
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
		areBothSubtypeOf(BaseType.XSGYEARMONTH) ||
		areBothSubtypeOf(BaseType.XSGYEAR) ||
		areBothSubtypeOf(BaseType.XSGMONTHDAY) ||
		areBothSubtypeOf(BaseType.XSGMONTH) ||
		areBothSubtypeOf(BaseType.XSGDAY)
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

	if (areBothSubtypeOf(BaseType.XSYEARMONTHDURATION)) {
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

	if (areBothSubtypeOf(BaseType.XSDAYTIMEDURATION)) {
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

	if (areBothSubtypeOf(BaseType.XSDURATION)) {
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

	throw new Error(`XPTY0004: ${operator} not available for ${valueTypeToString(typeA)} and ${valueTypeToString(typeB)}`);
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
