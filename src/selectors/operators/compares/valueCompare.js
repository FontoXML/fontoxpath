import { castToType } from '../../dataTypes/conversionHelper';

export default function valueCompare (operator, firstSequence, secondSequence) {
    // https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
    if (!firstSequence.isSingleton() || !secondSequence.isSingleton()) {
        throw new Error('XPTY0004: Sequences to compare are not singleton');
    }

    var firstValue = firstSequence.value[0],
        secondValue = secondSequence.value[0];

    if (firstValue.instanceOfType('xs:untypedAtomic')) {
        firstValue = castToType(firstValue, 'xs:string');
    }

    if (secondValue.instanceOfType('xs:untypedAtomic')) {
        secondValue = castToType(secondValue, 'xs:string');
    }

    if (firstValue.primitiveTypeName !== secondValue.primitiveTypeName) {
        if ((firstValue.instanceOfType('xs:string') || firstValue.instanceOfType('xs:anyURI')) &&
            (secondValue.instanceOfType('xs:string') || secondValue.instanceOfType('xs:anyURI'))) {
			firstValue = castToType(firstValue, 'xs:string');
			firstValue = castToType(secondValue, 'xs:string');
        }
		else if ((firstValue.instanceOfType('xs:decimal') || firstValue.instanceOfType('xs:float')) &&
				(secondValue.instanceOfType('xs:decimal') || secondValue.instanceOfType('xs:float'))) {
			firstValue = castToType(firstValue, 'xs:float');
			secondValue = castToType(secondValue, 'xs:float');
        }
		else if ((firstValue.instanceOfType('xs:decimal') || firstValue.instanceOfType('xs:float') || firstValue.instanceOfType('xs:double')) &&
			(secondValue.instanceOfType('xs:decimal') || secondValue.instanceOfType('xs:float') || secondValue.instanceOfType('xs:double'))) {
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
