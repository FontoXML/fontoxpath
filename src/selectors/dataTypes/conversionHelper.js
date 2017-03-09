import AnyAtomicTypeValue from './AnyAtomicTypeValue';
import ArrayValue from './ArrayValue';
import BooleanValue from './BooleanValue';
import DecimalValue from './DecimalValue';
import DoubleValue from './DoubleValue';
import FloatValue from './FloatValue';
import FunctionItem from './FunctionItem';
import IntegerValue from './IntegerValue';
import Item from './Item';
import MapValue from './MapValue';
import NodeValue from './NodeValue';
import NumericValue from './NumericValue';
import QNameValue from './QNameValue';
import Sequence from './Sequence';
import StringValue from './StringValue';
import UntypedAtomicValue from './UntypedAtomicValue';

export const castToType = (value, type) => {
	switch (type) {
		case 'xs:anyAtomicType':
		case 'xs:string':
			let convertedValue;
			if (value.instanceOfType('xs:string')) {
				return value;
			}
			if (value.instanceOfType('xs:anyURI')) {
				convertedValue = value.value;
			}
			if (value.instanceOfType('xs:QName') || value.instanceOfType('xs:NOTATION')) {
				convertedValue = value.value;
				break;
			}
			if (value.instanceOfType('xs:numeric')) {
				if (value.instanceOf('xs:integer') || value.instanceOf('xs:decimal')) {
					convertedValue = value.value + '';
				}
			}
			if (type === 'xs:anyAtomicType') {
				return new AnyAtomicTypeValue(convertedValue);
			}
			return new StringValue(convertedValue);

		case 'xs:boolean':
			switch (value.value) {
					case 'true':
					case '1':
						return BooleanValue.TRUE;
					case 'false':
					case '0':
						return BooleanValue.FALSE;

					default:
						throw new Error(`XPTY0004: can not cast ${value.value} to xs:boolean`);
			}

		case 'xs:decimal':
			const decimalValue = parseFloat(value.value);
			if (Number.isNaN(decimalValue)) {
				throw new Error(`XPTY0004: can not cast ${value.value} to xs:decimal`);
			}
			return new DecimalValue(decimalValue);

		case 'xs:double':
			const doubleValue = parseFloat(value.value);
			return new DoubleValue(doubleValue);

		case 'xs:float':
			const floatValue = parseFloat(value.value);
			return new FloatValue(floatValue);

		case 'xs:integer':
			// Strip off any decimals
			var integerValue = Math.abs(parseFloat(value.value));
			if (Number.isNaN(integerValue)) {
				throw new Error(`XPTY0004: can not cast ${value.value} to xs:integer`);
			}
			return new IntegerValue(integerValue);

		case 'array()':
		case 'function()':
		case 'map()':
		case 'node()':
		case 'attribute()':
			throw new Error('XPST0004: Can not cast to function types.');
		default:
			throw new Error(`Casting to the ${type} is not supported yet`);

	}
};

/**
 * https://www.w3.org/TR/xpath-3/#dt-type-promotion
 * @param   {!Item}  value
 * @param   {string}  type
 * @return  {?Item}
 */
export const promoteToType = (value, type) => {
	if (value.instanceOfType('xs:numeric')) {
		if (value.instanceOfType('xs:float')) {
			if (type === 'xs:double') {
				return new DoubleValue(value.value);
			}
			return null;
		}
		if (value.instanceOfType('xs:decimal')) {
			if (type === 'xs:float') {
				return new FloatValue(value.value);
			}
			if (type === 'xs:double') {
				return new DoubleValue(value.value);
			}
		}
		return null;
	}

	if (value.instanceOfType('xs:anyURI')) {
		if (type === 'xs:string') {
			return new StringValue(value.value);
		}
	}
	return null;
};
