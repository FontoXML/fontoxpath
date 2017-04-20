import castToType from '../../dataTypes/castToType';
import isInstanceOfType from '../../dataTypes/isInstanceOfType';

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

    var firstValue = firstSequence.first(),
        secondValue = secondSequence.first();

    if (isInstanceOfType(firstValue, 'xs:untypedAtomic') && isInstanceOfType(secondValue, 'xs:untypedAtomic')) {
        firstValue = castToType(firstValue, 'xs:string');
        secondValue = castToType(secondValue, 'xs:string');
    }

	if (isInstanceOfType(firstValue, 'xs:untypedAtomic')) {
		firstValue = castToType(firstValue, secondValue.type);
	}

	if (isInstanceOfType(secondValue, 'xs:untypedAtomic')) {
		secondValue = castToType(secondValue, firstValue.type);
	}

    if (firstValue.type !== secondValue.type) {
        if ((isInstanceOfType(firstValue, 'xs:string') || isInstanceOfType(firstValue, 'xs:anyURI')) &&
			(isInstanceOfType(secondValue, 'xs:string') || isInstanceOfType(secondValue, 'xs:anyURI'))) {
			firstValue = castToType(firstValue, 'xs:string');
			secondValue = castToType(secondValue, 'xs:string');
        }
		else if ((isInstanceOfType(firstValue, 'xs:decimal') || isInstanceOfType(firstValue, 'xs:float')) &&
				 (isInstanceOfType(secondValue, 'xs:decimal') || isInstanceOfType(secondValue, 'xs:float'))) {
			firstValue = castToType(firstValue, 'xs:float');
			secondValue = castToType(secondValue, 'xs:float');
        }
		else if ((isInstanceOfType(firstValue, 'xs:decimal') || isInstanceOfType(firstValue, 'xs:float') || isInstanceOfType(firstValue, 'xs:double')) &&
				 (isInstanceOfType(secondValue, 'xs:decimal') || isInstanceOfType(secondValue, 'xs:float') || isInstanceOfType(secondValue, 'xs:double'))) {
			firstValue = castToType(firstValue, 'xs:double');
			secondValue = castToType(secondValue, 'xs:double');
        }
		else {
            throw new Error('XPTY0004: Values to compare are not of the same type');
        }
    }

    switch (operator) {
        case 'eq':
            return firstValue.value === secondValue.value;
        case 'ne':
            return firstValue.value !== secondValue.value;
        case 'lt':
            return firstValue.value < secondValue.value;
        case 'le':
            return firstValue.value <= secondValue.value;
        case 'gt':
            return firstValue.value > secondValue.value;
        case 'ge':
            return firstValue.value >= secondValue.value;
    }
}
