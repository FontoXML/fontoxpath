import Sequence from './dataTypes/Sequence';
import createAtomicValue from './dataTypes/createAtomicValue';
import ArrayValue from './dataTypes/ArrayValue';
import MapValue from './dataTypes/MapValue';
import createNodeValue from './dataTypes/createNodeValue';
import { trueBoolean, falseBoolean } from './dataTypes/createAtomicValue';
import DateTime from './dataTypes/valueTypes/DateTime';
import Value from './dataTypes/Value';

/**
 * Adapt a JavaScript value to the equivalent in XPath. This dynamically assigns the closest type
 *
 * @param  {?} value
 * @return {?Value} Null if the value is absent and the empty sequence should be
 * output instead
 */
function adaptItemToXPathValue (value) {
	if (value === null) {
		return null;
	}

	switch (typeof value) {
		case 'boolean':
			return value ? trueBoolean : falseBoolean;
		case 'number':
			return createAtomicValue(value, 'xs:decimal');
		case 'string':
			return createAtomicValue(value, 'xs:string');
		case 'object':
			// Test if it is a node
			if (value.nodeType) {
				return createNodeValue(value);
			}
			if (Array.isArray(value)) {
				return new ArrayValue(
					value
						.map(
					arrayItem => {
						if (arrayItem === undefined) {
							return () => Sequence.empty();
						}
						const adaptedValue = adaptItemToXPathValue(arrayItem);
						let adaptedSequence;
						if (adaptedValue === null) {
							adaptedSequence = Sequence.empty();
						} else {
							adaptedSequence = Sequence.singleton(adaptedValue);
						}
						return () => adaptedSequence;
					}));
			}
			// Make it a map
			return new MapValue(
				Object.keys(value)
					.filter(key => value[key] !== undefined)
					.map(key => {
						const adaptedValue = adaptItemToXPathValue(value[key]);
						let adaptedSequence;
						if (adaptedValue === null) {
							adaptedSequence = Sequence.empty();
						} else {
							adaptedSequence = Sequence.singleton(adaptedValue);
						}
					return {
						key: createAtomicValue(key, 'xs:string'),
						value: () => adaptedSequence
					};
				}));
	}
	throw new Error(`Value ${value} of type "${typeof value}" is not adaptable to an XPath value.`);
}

/**
 * Adapt a JavaScript value to the equivalent in XPath. This tries to keep the preferred type
 *
 * @param  {?} value
 * @return {?Value} Null if the value is absent and the empty sequence should be outputted instead
 */
function adaptJavaScriptValueToXPathValue (type, value) {
	if (value === null) {
		return null;
	}
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
		case 'xs:date':
		case 'xs:time':
		case 'xs:dateTime':
		case 'xs:gYearMonth':
		case 'xs:gYear':
		case 'xs:gMonthDay':
		case 'xs:gMonth':
		case 'xs:gDay':
			return createAtomicValue(DateTime.fromString(value.toISOString()).convertToType(type), type);
		case 'node()':
		case 'element()':
		case 'text':
		case 'comment()':
			return createNodeValue(value);
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
			const adaptedValue = adaptJavaScriptValueToXPathValue(type, value);
			if (adaptedValue === null) {
				return Sequence.empty();
			}
			return Sequence.singleton(adaptedValue);

		case '+':
		case '*': {
			const convertedValues = value.map(adaptJavaScriptValueToXPathValue.bind(null, type));
			return Sequence.create(
				convertedValues.filter(convertedValue => convertedValue !== null));
		}

		default: {
			const adaptedValue = adaptJavaScriptValueToXPathValue(type, value);
			if (adaptedValue === null) {
				return Sequence.empty();
			}
			return Sequence.singleton(adaptedValue);
		}
	}
}
