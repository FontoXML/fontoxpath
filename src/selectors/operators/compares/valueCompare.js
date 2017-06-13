import castToType from '../../dataTypes/castToType';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';

import DateTime from '../../dataTypes/valueTypes/DateTime';
import YearMonthDuration from '../../dataTypes/valueTypes/YearMonthDuration';
import DayTimeDuration from '../../dataTypes/valueTypes/DayTimeDuration';

// Use partial application to get to a comparer faster
function bothAreStringOrAnyURI (a, b) {
	return (isSubtypeOf(a, 'xs:string') || isSubtypeOf(a, 'xs:anyURI')) &&
		(isSubtypeOf(b, 'xs:string') || isSubtypeOf(b, 'xs:anyURI'));
}

function generateCompareFunction (operator, typeA, typeB, dynamicContext) {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	function applyCastFunctions (valA, valB) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valA) : valA,
			castB: castFunctionForValueB ? castFunctionForValueB(valB) : valB
		};
	}

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

	if (isSubtypeOf(typeA, 'xs:dateTime') ||
		isSubtypeOf(typeA, 'xs:date') ||
		isSubtypeOf(typeA, 'xs:time')) {
		if ((isSubtypeOf(typeA, 'xs:date') && !isSubtypeOf(typeB, 'xs:date')) ||
			(isSubtypeOf(typeA, 'xs:dateTime') && !isSubtypeOf(typeB, 'xs:dateTime')) ||
			(isSubtypeOf(typeA, 'xs:time') && !isSubtypeOf(typeB, 'xs:time'))) {
			throw new Error(`XPTY0004: Operator ${operator} is not available for ${typeA} and ${typeB}`);
		}
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DateTime.equal(castA.value, castB.value, dynamicContext.implicitTimezone);
				};
			case 'ne':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !DateTime.equal(castA.value, castB.value, dynamicContext.implicitTimezone);
				};

			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DateTime.lessThan(castA.value, castB.value, dynamicContext.implicitTimezone);
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DateTime.equal(castA.value, castB.value, dynamicContext.implicitTimezone) ||
						DateTime.lessThan(castA.value, castB.value, dynamicContext.implicitTimezone);
				};

			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DateTime.greaterThan(castA.value, castB.value, dynamicContext.implicitTimezone);
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DateTime.equal(castA.value, castB.value, dynamicContext.implicitTimezone) ||
						DateTime.greaterThan(castA.value, castB.value, dynamicContext.implicitTimezone);
				};
		}
	}

	if (isSubtypeOf(typeA, 'xs:gYearMonth') ||
		isSubtypeOf(typeA, 'xs:gYear') ||
		isSubtypeOf(typeA, 'xs:gMonthDay') ||
		isSubtypeOf(typeA, 'xs:gMonth') ||
		isSubtypeOf(typeA, 'xs:gDay')) {
		switch (operator) {
			case 'eq':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DateTime.equal(castA.value, castB.value, dynamicContext.implicitTimezone);
				};
			case 'ne':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return !DateTime.equal(castA.value, castB.value, dynamicContext.implicitTimezone);
				};
		}
	}

	if (typeA !== typeB) {
		if (!bothAreStringOrAnyURI(typeA, typeB) &&
			!(isSubtypeOf(typeA, 'xs:numeric') && isSubtypeOf(typeB, 'xs:numeric'))) {
			throw new Error('XPTY0004: Values to compare are not of the same type');
		}
	}

	if (isSubtypeOf(typeA, 'xs:yearMonthDuration')) {
		switch (operator) {
			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return YearMonthDuration.lessThan(castA.value, castB.value);
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						YearMonthDuration.lessThan(castA.value, castB.value);
				};

			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return YearMonthDuration.greaterThan(castA.value, castB.value);
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						YearMonthDuration.greaterThan(castA.value, castB.value);
				};
		}
	}

	if (isSubtypeOf(typeA, 'xs:dayTimeDuration')) {
		switch (operator) {
			case 'lt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DayTimeDuration.lessThan(castA.value, castB.value);
				};
			case 'le':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						DayTimeDuration.lessThan(castA.value, castB.value);
				};

			case 'gt':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return DayTimeDuration.greaterThan(castA.value, castB.value);
				};
			case 'ge':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return castA.value.equals(castB.value) ||
						DayTimeDuration.greaterThan(castA.value, castB.value);
				};
		}
	}

	if (isSubtypeOf(typeA, 'xs:duration')) {
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

	if (isSubtypeOf(typeA, 'xs:boolean') ||
		isSubtypeOf(typeA, 'xs:string') ||
		isSubtypeOf(typeA, 'xs:numeric') ||
		isSubtypeOf(typeA, 'xs:anyURI') ||
		isSubtypeOf(typeA, 'xs:hexBinary') ||
		isSubtypeOf(typeA, 'xs:base64Binary')) {
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

	throw new Error(`XPTY0004: ${operator} not available for ${typeA} and ${typeB}`);
}

const comparatorsByTypingKey = Object.create(null);

/**
 * @param  {string}                       operator
 * @param  {../../dataTypes/AtomicValue}  valueA
 * @param  {../../dataTypes/AtomicValue}  valueB
 * @param  {../../DynamicContext}         dynamicContext
 * @return {boolean}
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
