import Sequence from './dataTypes/Sequence';
import createAtomicValue from './dataTypes/createAtomicValue';
import ArrayValue from './dataTypes/ArrayValue';
import MapValue from './dataTypes/MapValue';
import createNodeValue from './dataTypes/createNodeValue';
import { trueBoolean, falseBoolean } from './dataTypes/createAtomicValue';

/**
 * Adapt a JavaScript value to the equivalent in XPath. This dynamically assigns the closest type
 *
 * @param  {?} value
 * @return {?./dataTypes/Value} Null if the value is absent and the empty sequence should be
 * outputted instead
 */
function adaptItemToXPathValue (value) {
	switch (typeof value) {
		case 'boolean':
			return value ? trueBoolean : falseBoolean;
		case 'number':
			return createAtomicValue(value, 'xs:decimal');
		case 'string':
			return createAtomicValue(value, 'xs:string');
		case 'object':
			if (value === null) {
				return null;
			}
			// Test if it is a node
			if (value.nodeType) {
				return createNodeValue(value);
			}
			if (Array.isArray(value)) {
				return new ArrayValue(
					value
						.map(
					arrayItem => {
						if (arrayItem === null || arrayItem === undefined) {
							return Sequence.empty();
						}
						const adaptedArrayItem = adaptItemToXPathValue(arrayItem);
						return Sequence.singleton(adaptedArrayItem);
					}));
			}
			// Make it a map
			return new MapValue(
				Object.keys(value)
					.filter(key => value[key] !== undefined)
					.map(key => {
					const adaptedValue = adaptItemToXPathValue(value[key]);
					return {
						key: createAtomicValue(key, 'xs:string'),
						value: adaptedValue === null ?
							Sequence.empty() :
							Sequence.singleton(adaptedValue)
					};
				}));
	}
	throw new Error(`Value ${value} of type "${typeof value}" is not adaptable to an XPath value.`);
}

/**
 * Adapt a JavaScript value to the equivalent in XPath. This tries to keep the preferred type
 *
 * @param  {?} value
 * @return {?./dataTypes/Value} Null if the value is absent and the empty sequence should be outputted instead
 */
function adaptJavaScriptValueToXPathValue (type, value) {
	switch (type) {
		case 'xs:boolean':
			return value ? trueBoolean : falseBoolean;
		case 'xs:string':
			return createAtomicValue(value + '', 'xs:string');
		case 'xs:double':
		case 'xs:numeric':
			return createAtomicValue(+value, 'xs:double');
		case 'xs:decimal':
			return createAtomicValue(+value, 'xs:decimal');
		case 'xs:integer':
			return createAtomicValue(value | 0, 'xs:integer');
		case 'xs:float':
			return createAtomicValue(+value, 'xs:float');
		case 'node()':
			throw new Error('XPath custom functions should not return a node, use traversals instead.');
		case 'item()':
			return adaptItemToXPathValue(value);
		default:
			throw new Error(`Values of the type "${type}" can not be adapted to equivalent XPath values.`);
	}
}

/**
 * @param  {?}        value
 * @param  {string=}  expectedType
* @return  {!Sequence}
 */
export default function adaptJavaScriptValueToXPath (value, expectedType) {
	expectedType = expectedType || 'item()?';

	var parts = expectedType.match(/^([^+?*]*)([\+\*\?])?$/),
		type = parts[1],
		multiplicity = parts[2];

	switch (multiplicity) {
		case '?':
			if (value === null) {
				return Sequence.empty();
			}
			return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));

		case '+':
		case '*': {
			const convertedValues = value.map(adaptJavaScriptValueToXPathValue.bind(null, type));
			return new Sequence(
				convertedValues.filter(convertedValue => convertedValue !== null));
		}

		default:
			return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));
	}
}
