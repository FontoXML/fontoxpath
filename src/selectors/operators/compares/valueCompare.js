import castToType from '../../dataTypes/castToType';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';

// Use partial application to get to a comparer faster

function generateCompareFunction (operator, typeA, typeB) {
	const castFunctionsForA = [];
	const castFunctionsForB = [];

	if (isSubtypeOf(typeA, 'xs:untypedAtomic') && isSubtypeOf(typeB, 'xs:untypedAtomic')) {
		castFunctionsForA.push((val) => castToType(val, 'xs:string'));
		castFunctionsForB.push((val) => castToType(val, 'xs:string'));
		typeA = typeB = 'xs:string';
	}
	else if (isSubtypeOf(typeA, 'xs:untypedAtomic')) {
		castFunctionsForA.push((val) => castToType(val, typeB));
		typeA = typeB;
	}
	else if (isSubtypeOf(typeB, 'xs:untypedAtomic')) {
		castFunctionsForB.push((val) => castToType(val, typeA));
		typeB = typeA;
	}
	else if (typeA !== typeB) {
		if ((isSubtypeOf(typeA, 'xs:string') || isSubtypeOf(typeA, 'xs:anyURI')) &&
			(isSubtypeOf(typeB, 'xs:string') || isSubtypeOf(typeB, 'xs:anyURI'))) {
			castFunctionsForA.push((val) => castToType(val, 'xs:string'));
			typeA = 'xs:string';
			castFunctionsForB.push((val) => castToType(val, 'xs:string'));
			typeB = 'xs:string';
		}
		else if ((isSubtypeOf(typeA, 'xs:decimal') || isSubtypeOf(typeA, 'xs:float')) && (isSubtypeOf(typeB, 'xs:decimal') || isSubtypeOf(typeB, 'xs:float'))) {
			castFunctionsForA.push((val) => castToType(val, 'xs:float'));
			castFunctionsForB.push((val) => castToType(val, 'xs:float'));
			typeA = typeB = 'xs:float';
		}
		else if (isSubtypeOf(typeA, 'xs:numeric') && isSubtypeOf(typeB, 'xs:numeric')) {
			castFunctionsForA.push((val) => castToType(val, 'xs:double'));
			castFunctionsForB.push((val) => castToType(val, 'xs:double'));
			typeA = typeB = 'xs:double';
		}
		else {
			throw new Error('XPTY0004: Values to compare are not of the same type');
		}
	}

	function applyCasts (valA, valB) {
		return {
			castA: castFunctionsForA.reduce((val, functor) => functor(val), valA),
			castB: castFunctionsForB.reduce((val, functor) => functor(val), valB)
		};
	}

	switch (operator) {
		case 'eq':
			return (a, b) => {
				const { castA, castB } = applyCasts(a, b);
				return castA.value === castB.value;
			};
		case 'ne':
			return (a, b) => {
				const { castA, castB } = applyCasts(a, b);
				return castA.value !== castB.value;
			};
		case 'lt':
			return (a, b) => {
				const { castA, castB } = applyCasts(a, b);
				return castA.value < castB.value;
			};
		case 'le':
			return (a, b) => {
				const { castA, castB } = applyCasts(a, b);
				return castA.value <= castB.value;
			};
		case 'gt':
			return (a, b) => {
				const { castA, castB } = applyCasts(a, b);
				return castA.value > castB.value;
			};
		case 'ge':
			return (a, b) => {
				const { castA, castB } = applyCasts(a, b);
				return castA.value >= castB.value;
			};
	}

	throw new Error('Unexpected compare operator');
}

const comparatorsByTypingKey = Object.create(null);

/**
 * @param  {string}                    operator
 * @param  {../../dataTypes/Sequence}  firstSequence
 * @param  {../../dataTypes/Sequence}  secondSequence
 */
export default function valueCompare (operator, firstSequence, secondSequence) {
	// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
	if (!firstSequence.isSingleton() || !secondSequence.isSingleton()) {
		throw new Error('XPTY0004: Sequences to compare are not singleton');
	}

	const valueA = firstSequence.first();
	const valueB = secondSequence.first();
	const typingKey = `${valueA.type}~${valueB.type}~${operator}`;
	let prefabComparator = comparatorsByTypingKey[typingKey];
	if (!prefabComparator) {
		prefabComparator = comparatorsByTypingKey[typingKey] = generateCompareFunction(operator, valueA.type, valueB.type);
	}

	return prefabComparator(valueA, valueB);
}
