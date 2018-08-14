import castToType from '../../dataTypes/castToType';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';

import {
	equal as dateTimeEqual,
	lessThan as dateTimeLessThan,
	greaterThan as dateTimeGreaterThan
} from '../../dataTypes/valueTypes/DateTime';
import {
	lessThan as yearMonthDurationLessThan,
	greaterThan as yearMonthDurationGreaterThan
} from '../../dataTypes/valueTypes/YearMonthDuration';
import {
	lessThan as dayTimeDurationLessThan,
	greaterThan as dayTimeDurationGreaterThan
} from '../../dataTypes/valueTypes/DayTimeDuration';

import DynamicContext from '../../DynamicContext';
import Value from '../../dataTypes/Value';
import AtomicValue from '../../dataTypes/AtomicValue';

// Use partial application to get to a comparer faster
function areBothStringOrAnyURI (a, b) {
	return (isSubtypeOf(a, 'xs:string') || isSubtypeOf(a, 'xs:anyURI')) &&
		(isSubtypeOf(b, 'xs:string') || isSubtypeOf(b, 'xs:anyURI'));
}

function generateCompareFunction (operator, typeA, typeB, dynamicContext) {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (isSubtypeOf(typeA, 'xs:untypedAtomic') && isSubtypeOf(typeB, 'xs:untypedAtomic')) {
		typeA = typeB = 'xs:string';
	}
	else if (isSubtypeOf(typeA, 'xs:untypedAtomic')) {
		castFunctionForValueA = val => castToType(val, typeB);
		typeA = typeB;
	}
	else if (isSubtypeOf(typeB, 'xs:untypedAtomic')) {
		castFunctionForValueB = val => castToType(val, typeA);
		typeB = typeA;
	}

	function applyCastFunctions (valA, valB) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valA) : valA,
			castB: castFunctionForValueB ? castFunctionForValueB(valB) : valB
		};
	}

	if (isSubtypeOf(typeA, 'xs:QName') && isSubtypeOf(typeB, 'xs:QName')) {
		if (operator === 'eq') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value.namespaceURI === castB.value.namespaceURI && castA.value.localPart === castB.value.localPart;
			};
		}
		if (operator === 'ne') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value.namespaceURI !== castB.value.namespaceURI || castA.value.localPart !== castB.value.localPart;
			};
		}
		throw new Error('XPTY0004: Only the "eq" and "ne" comparison is defined for xs:QName');
	}

	function areBothSubtypeOf (type) {
		return isSubtypeOf(typeA, type) && isSubtypeOf(typeB, type);
	}

	if (areBothSubtypeOf('xs:boolean') ||
		areBothSubtypeOf('xs:string') ||
		areBothSubtypeOf('xs:numeric') ||
		areBothSubtypeOf('xs:anyURI') ||
		areBothSubtypeOf('xs:hexBinary') ||
		areBothSubtypeOf('xs:base64Binary') ||
		areBothStringOrAnyURI(typeA, typeB)) {
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value === castB.value;
				};
			case 'ne':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value !== castB.value;
				};
			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value < castB.value;
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value <= castB.value;
				};
			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value > castB.value;
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value >= castB.value;
				};
		}
	}

	if (areBothSubtypeOf('xs:dateTime') ||
		areBothSubtypeOf('xs:date') ||
		areBothSubtypeOf('xs:time')) {
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};
			case 'ne':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};

			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeLessThan(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone()) ||
						dateTimeLessThan(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};

			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeGreaterThan(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone()) ||
						dateTimeGreaterThan(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};
		}
	}

	if (areBothSubtypeOf('xs:gYearMonth') ||
		areBothSubtypeOf('xs:gYear') ||
		areBothSubtypeOf('xs:gMonthDay') ||
		areBothSubtypeOf('xs:gMonth') ||
		areBothSubtypeOf('xs:gDay')) {
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};
			case 'ne':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone());
				};
		}
	}

	if (areBothSubtypeOf('xs:yearMonthDuration')) {
		switch (operator) {
			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return yearMonthDurationLessThan(castA.value, castB.value);
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						yearMonthDurationLessThan(castA.value, castB.value);
				};

			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return yearMonthDurationGreaterThan(castA.value, castB.value);
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						yearMonthDurationGreaterThan(castA.value, castB.value);
				};
		}
	}

	if (areBothSubtypeOf('xs:dayTimeDuration')) {
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value);
				};
			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dayTimeDurationLessThan(castA.value, castB.value);
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						dayTimeDurationLessThan(castA.value, castB.value);
				};
			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return dayTimeDurationGreaterThan(castA.value, castB.value);
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						dayTimeDurationGreaterThan(castA.value, castB.value);
				};
		}
	}

	if (areBothSubtypeOf('xs:duration')) {
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value);
				};
			case 'ne':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !castA.value.equals(castB.value);
				};
		}
	}

	throw new Error(`XPTY0004: ${operator} not available for ${typeA} and ${typeB}`);
}

const comparatorsByTypingKey = Object.create(null);

/**
 * @param  {string}           operator
 * @param  {!AtomicValue}     valueA
 * @param  {!AtomicValue}     valueB
 * @param  {DynamicContext}  dynamicContext
 */
export default function valueCompare (operator, valueA, valueB, dynamicContext) {
	// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
	const typingKey = `${valueA.type}~${valueB.type}~${operator}`;
	let prefabComparator = comparatorsByTypingKey[typingKey];
	if (!prefabComparator) {
		prefabComparator = comparatorsByTypingKey[typingKey] = generateCompareFunction(operator, valueA.type, valueB.type, dynamicContext);
	}

	return prefabComparator(valueA, valueB);
}
