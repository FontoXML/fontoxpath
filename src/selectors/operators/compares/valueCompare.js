import castToType from '../../dataTypes/castToType';
import isInstanceOfType from '../../dataTypes/isInstanceOfType';

// Use partial application to get to a comparer faster

const stringValueToken = { type: 'xs:string', value: null };
const doubleValueToken = { type: 'xs:double', value: null };
const floatValueToken = { type: 'xs:float', value: null };
function generateCompareFunction (operator, typeA, typeB) {
	const functorsForValueA = [];
	const functorsForValueB = [];

	let valueA = { type: typeA, value: null };
	let valueB = { type: typeB, value: null };


    if (isInstanceOfType(valueA, 'xs:untypedAtomic') && isInstanceOfType(valueB, 'xs:untypedAtomic')) {
        functorsForValueA.push((val) => castToType(val, 'xs:string'));
		functorsForValueB.push((val) => castToType(val, 'xs:string'));
		valueA = valueB = stringValueToken;
    }
	else if (isInstanceOfType(valueA, 'xs:untypedAtomic')) {
		functorsForValueA.push((val) => castToType(val, valueB.type));
		valueA = valueB;
	}
	else if (isInstanceOfType(valueB, 'xs:untypedAtomic')) {
		functorsForValueB.push((val) => castToType(val, valueA.type));
		valueB = valueA;
	}
    else if (valueA.type !== valueB.type) {
        if ((isInstanceOfType(valueA, 'xs:string') || isInstanceOfType(valueA, 'xs:anyURI')) &&
			(isInstanceOfType(valueB, 'xs:string') || isInstanceOfType(valueB, 'xs:anyURI'))) {
			functorsForValueA.push((val) => castToType(val, 'xs:string'));
			valueA = stringValueToken;
			functorsForValueB.push((val) => castToType(val, 'xs:string'));
			valueB = stringValueToken;
        }
/*		else if ((isInstanceOfType(valueA, 'xs:decimal') || isInstanceOfType(valueA, 'xs:float')) &&
				 (isInstanceOfType(valueB, 'xs:decimal') || isInstanceOfType(valueB, 'xs:float'))) {
			functorsForValueA.push((val) => castToType(val, 'xs:float'));
			functorsForValueB.push((val) => castToType(val, 'xs:float'));
			valueA = valueB = floatValueToken;
        }
*/		else if (isInstanceOfType(valueA, 'xs:numeric') && isInstanceOfType(valueB, 'xs:numeric')) {
			functorsForValueA.push((val) => castToType(val, 'xs:double'));
			functorsForValueB.push((val) => castToType(val, 'xs:double'));
			valueA = valueB = doubleValueToken;
        }
		else {
            throw new Error('XPTY0004: Values to compare are not of the same type');
        }
    }

	function applyFunctors (valA, valB) {
		return {
			castA: functorsForValueA.reduce((val, functor) => functor(val), valA),
			castB: functorsForValueB.reduce((val, functor) => functor(val), valB)
		};
	}

    switch (operator) {
        case 'eq':
            return (a, b) => {
				const { castA, castB } = applyFunctors(a, b);
				return castA.value === castB.value;
			};
        case 'ne':
			return (a, b) => {
				const { castA, castB } = applyFunctors(a, b);
				return castA.value !== castB.value;
			};
        case 'lt':
			return (a, b) => {
				const { castA, castB } = applyFunctors(a, b);
				return castA.value < castB.value;
			};
        case 'le':
			return (a, b) => {
				const { castA, castB } = applyFunctors(a, b);
				return castA.value <= castB.value;
			};
        case 'gt':
			return (a, b) => {
				const { castA, castB } = applyFunctors(a, b);
				return castA.value > castB.value;
			};
        case 'ge':
			return (a, b) => {
				const { castA, castB } = applyFunctors(a, b);
				return castA.value >= castB.value;
			};
    }

	throw new Error('Unexpected compare operator');
}

const comparatorsByTypingKey = Object.create(null);

/**
 * @param  {string}    operator
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
