import BooleanValue from './BooleanValue';
import DecimalValue from './DecimalValue';
import DoubleValue from './DoubleValue';
import FloatValue from './FloatValue';
import IntegerValue from './IntegerValue';
import Item from './Item';
import StringValue from './StringValue';
import UntypedAtomicValue from './UntypedAtomicValue';

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
					convertedValue = value.value + '';
				}
				else if (value.instanceOfType('xs:float') || value.instanceOfType('xs:double')) {
					if (Math.abs(value.value) === Infinity) {
						convertedValue = `${value.value < 0 ? '-' : ''}INF`;
					}
					else {
						// USe Javascript's built in number formatting. This outputs like 1e+100. The valid XPath version is 1E100: without the +, and with the exponent in capitals
						convertedValue = (value.value + '').replace('e', 'E').replace('E+', 'E');
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
			if (value.instanceOfType('xs:numeric')) {
				return value.value === 0 || value.isNaN() ? BooleanValue.FALSE : BooleanValue.TRUE;
			}
			if (value.instanceOfType('xs:string') || value.instanceOfType('xs:untypedAtomic')) {
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
			}
			throw new Error(`Not implemented: Casting from xs:boolean to ${value.simpleTypeName} is not supported yet`);

		case 'xs:decimal':
			let decimalValue;
			if (value.instanceOfType('xs:decimal') || value.instanceOfType('xs:integer')) {
				decimalValue = value.value;
			}
			if (value.instanceOfType('xs:float') || value.instanceOfType('xs:double')) {
				decimalValue = value.value;
				if (Number.isNaN(decimalValue)) {
					throw new Error(`FOCA0002: can not cast ${value.value} to xs:decimal`);
				}
			}
			if (value.instanceOfType('xs:boolean')) {
				decimalValue = value === BooleanValue.TRUE ? 1 : 0;
			}
			else if (value.instanceOfType('xs:string') || value.instanceOfType('xs:untypedAtomic')) {
				decimalValue = parseFloat(value.value);
				if (Number.isNaN(decimalValue)) {
					throw new Error(`XPTY0004: can not cast ${value.value} to xs:decimal`);
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
				if (value.value === 'NaN') {
					floatValue = NaN;
				}
				else if (value.value === 'INF' || value.value === '+INF') {
					floatValue = Infinity;
				}
				else if (value.value === '-INF') {
					floatValue = -Infinity;
				}
				else {
					floatValue = parseFloat(value.value.replace('E', 'e'));
				}
			}

			return type === 'xs:double' ? new DoubleValue(floatValue) : new FloatValue(floatValue);

		case 'xs:integer':
			let integerValue;
			if (value.instanceOfType('xs:boolean')) {
				integerValue = value === BooleanValue.TRUE ? 1 : 0;
			}
			else {
				// Strip off any decimals
				integerValue = Math.floor(parseFloat(value.value));
				if (Number.isNaN(integerValue)) {
					throw new Error(`XPTY0004: can not cast ${value.value} to xs:integer`);
				}
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
