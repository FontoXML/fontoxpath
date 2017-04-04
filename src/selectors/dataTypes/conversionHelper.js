import BooleanValue from './BooleanValue';
import DecimalValue from './DecimalValue';
import DoubleValue from './DoubleValue';
import FloatValue from './FloatValue';
import IntegerValue from './IntegerValue';
import Item from './Item';
import StringValue from './StringValue';
import UntypedAtomicValue from './UntypedAtomicValue';
import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @param   {!Item}   value
 * @param   {string} type
 * @return  {!Item}
 */
export const castToType = function castToType (value, type) {
	switch (type) {
		case 'xs:untypedAtomic':
		case 'xs:string':
			let convertedValue;
			if (value.instanceOfType('xs:string') || value.instanceOfType('xs:untypedAtomic')) {
				convertedValue = value.value;
			}
			else if (value.instanceOfType('xs:anyURI')) {
				convertedValue = value.value;
			}
			else if (value.instanceOfType('xs:QName') || value.instanceOfType('xs:NOTATION')) {
				convertedValue = value.value;
			}
			else if (value.instanceOfType('xs:numeric')) {
				if (value.instanceOfType('xs:integer') || value.instanceOfType('xs:decimal')) {
					convertedValue = Object.is(-0, value.value) ? '-0' : value.value + '';
				}
				else if (value.instanceOfType('xs:float') || value.instanceOfType('xs:double')) {
					if (isNaN(value.value)) {
						convertedValue = 'NaN';
					}
					else if (!isFinite(value.value)) {
						convertedValue = `${value.value < 0 ? '-' : ''}INF`;
					}
					else if (Object.is(value.value, -0)) {
						convertedValue = '-0';
					}
					else {
						// USe Javascript's built in number formatting. This outputs like 1e+100. The valid XPath version is 1E100: without the +, and with the exponent in capitals
						convertedValue = (Object.is(-0, value.value) ? '-0' : value.value + '').replace('e', 'E').replace('E+', 'E');
					}
				}
				// TODO: dateTime
			}
			else {
				// The value should be 'the canonical representation' of this value
				convertedValue = value.value + '';
			}

			if (type === 'xs:untypedAtomic') {
				return new UntypedAtomicValue(convertedValue);
			}
			return new StringValue(convertedValue);

		case 'xs:boolean':
			if (value.instanceOfType('xs:boolean')) {
				return value;
			}
			if (value.instanceOfType('xs:numeric')) {
				return value.value === 0 || isNaN(value.value) ? BooleanValue.FALSE : BooleanValue.TRUE;
			}
			if (value.instanceOfType('xs:string') || value.instanceOfType('xs:untypedAtomic')) {
				const strValue = value.value.trim();

				switch (strValue) {
					case 'true':
					case '1':
						return BooleanValue.TRUE;
					case 'false':
					case '0':
						return BooleanValue.FALSE;

					default:
						throw new Error(`FORG0001: can not cast ${strValue} to xs:boolean`);
				}
			}
			throw new Error(`Not implemented: Casting from xs:boolean to ${value.primitiveTypeName} is not supported yet`);

		case 'xs:decimal':
			let decimalValue;
			if (value.instanceOfType('xs:decimal') || value.instanceOfType('xs:integer')) {
				decimalValue = value.value;
			}
			if (value.instanceOfType('xs:float') || value.instanceOfType('xs:double')) {
				decimalValue = value.value;
				if (isNaN(decimalValue) || !isFinite(decimalValue)) {
					throw new Error(`FOCA0002: can not cast ${value.value} to xs:decimal`);
				}
			}
			if (value.instanceOfType('xs:boolean')) {
				decimalValue = value === BooleanValue.TRUE ? 1 : 0;
			}
			else if (value.instanceOfType('xs:string') || value.instanceOfType('xs:untypedAtomic')) {
				const strValue = value.value.trim();
				if (!/^[+\-]?((\d+(\.\d*)?)|(\.\d+))?$/.test(strValue)) {
					throw new Error(`FORG0001: can not cast ${strValue} to xs:decimal`);
				}
				decimalValue = parseFloat(strValue);
				if (isNaN(decimalValue) || !isFinite(decimalValue)) {
					throw new Error(`FORG0001: can not cast ${value.value} to xs:decimal`);
				}
			}
			return new DecimalValue(decimalValue);

		case 'xs:double':
		case 'xs:float':
			let floatValue;
			if (value.instanceOfType('xs:numeric')) {
				floatValue = value.value;
			}
			if (value.instanceOfType('xs:boolean')) {
				floatValue = value === BooleanValue.TRUE ? 1 : 0;
			}
			else if (value.instanceOfType('xs:string') || value.instanceOfType('xs:untypedAtomic')) {
				const strValue = value.value.trim();
				if (strValue === 'NaN') {
					floatValue = NaN;
				}
				else if (strValue === 'INF' || strValue === '+INF') {
					floatValue = Infinity;
				}
				else if (strValue === '-INF') {
					floatValue = -Infinity;
				}
				else {
					if (!/^([+\-]?((\d+(\.\d*)?)|(\.\d+))([eE][+\-]?\d+)?|(-?INF)|NaN)$/.test(strValue)) {
						throw new Error(`FORG0001: can not cast ${strValue} to xs:float or xs:double`);
					}
					floatValue = parseFloat(strValue.replace('E', 'e'));
					if (isNaN(floatValue)) {
						throw new Error(`FORG0001: Can not cast "${strValue}" to ${type}.`);
					}
				}
			}

			return type === 'xs:double' ? new DoubleValue(floatValue) : new FloatValue(floatValue);

		case 'xs:integer':
			let integerValue;
			if (value.instanceOfType('xs:boolean')) {
				integerValue = value === BooleanValue.TRUE ? 1 : 0;
			}
			else if (value.instanceOfType('xs:numeric')) {
				integerValue = value.value > 0 ? Math.floor(value.value) : Math.ceil(value.value);
				if (!isFinite(integerValue) || isNaN(integerValue)) {
					throw new Error(`FOCA0002: can not cast ${value.value} to xs:integer`);
				}
			}
			else {
				const strValue = value.value.trim();

				if (!/^[+\-]?\d+$/.test(strValue)) {
					throw new Error(`FORG0001: can not cast ${strValue} to xs:integer`);
				}
				// Strip off any decimals
				integerValue = parseInt(strValue, 10);
			}
			return new IntegerValue(integerValue);

		case 'xs:anyAtomicType':
		case 'xs:NOTATION':
		case 'xs:anySimpleType':
			throw new Error('XPST0080: Can not cast to xs:anyAtomicType, xs:NOTATION, or xs:xs:anySimpleType.');
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
