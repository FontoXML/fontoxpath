import castToType from '../../dataTypes/castToType';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';

// Use partial application to get to a comparer faster
function bothAreStringOrAnyURI (a, b) {
	return (isSubtypeOf(a, 'xs:string') || isSubtypeOf(a, 'xs:anyURI')) &&
		(isSubtypeOf(b, 'xs:string') || isSubtypeOf(b, 'xs:anyURI'));
}

function generateCompareFunction (operator, typeA, typeB) {
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
	else if (typeA !== typeB) {
		if (!bothAreStringOrAnyURI(typeA, typeB)
			&& !(isSubtypeOf(typeA, 'xs:numeric') && isSubtypeOf(typeB, 'xs:numeric'))) {
			throw new Error('XPTY0004: Values to compare are not of the same type');
		}
	}

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

	throw new Error('Unexpected compare operator');
}

const comparatorsByTypingKey = Object.create(null);

/**
 * @param  {string}                       operator
 * @param  {../../dataTypes/AtomicValue}  valueA
 * @param  {../../dataTypes/AtomicValue}  valueB
 * @return {boolean}
 */
export default function valueCompare (operator, valueA, valueB) {
	// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
	const typingKey = `${valueA.type}~${valueB.type}~${operator}`;
	let prefabComparator = comparatorsByTypingKey[typingKey];
	if (!prefabComparator) {
		prefabComparator = comparatorsByTypingKey[typingKey] = generateCompareFunction(operator, valueA.type, valueB.type);
	}

//	return generateCompareFunction(operator, valueA.type, valueB.type)(valueA, valueB);

	return prefabComparator(valueA, valueB);
}
