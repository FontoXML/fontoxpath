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

var TYPES_BY_NAME = {
		// 'array()': ArrayValue,
		// 'function()': FunctionItem,
		// 'item()': Item,
		// 'map()': MapValue,
		// 'node()': NodeValue,
		'xs:boolean': BooleanValue,
		'xs:decimal': DecimalValue,
		'xs:double': DoubleValue,
		'xs:float': FloatValue,
		'xs:integer': IntegerValue,
		'xs:numeric': NumericValue,
		'xs:qName': QNameValue,
		'xs:untypedAtomic': UntypedAtomicValue,
		'xs:anyAtomicType': AnyAtomicTypeValue,
		'xs:string': StringValue
	};

export const castToType = (value, type) => {
	return TYPES_BY_NAME[type].cast(value);
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
