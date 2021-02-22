import { NodePointer } from '../domClone/Pointer';
import DomFacade from '../domFacade/DomFacade';
import { UntypedExternalValue, ValidValue } from '../types/createTypedValueFactory';
import ArrayValue from './dataTypes/ArrayValue';
import { getValidatorForType } from './dataTypes/builtins/dataTypeValidatorByName';
import createAtomicValue, { falseBoolean, trueBoolean } from './dataTypes/createAtomicValue';
import createPointerValue from './dataTypes/createPointerValue';
import ISequence from './dataTypes/ISequence';
import MapValue from './dataTypes/MapValue';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value, { ValueType } from './dataTypes/Value';
import DateTime from './dataTypes/valueTypes/DateTime';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

/**
 * Adapt a JavaScript value to the equivalent in XPath. This dynamically assigns the closest type
 *
 * @param  value
 * @return Null if the value is absent and the empty sequence should be
 * output instead
 */
function adaptSingleJavaScriptValue(value: ValidValue, domFacade: DomFacade): Value | null {
	if (value === null) {
		return null;
	}

	switch (typeof value) {
		case 'boolean':
			return value ? trueBoolean : falseBoolean;
		case 'number':
			return createAtomicValue(value, 'xs:double');
		case 'string':
			return createAtomicValue(value, 'xs:string');
		case 'object':
			// Test if it is a node
			if ('nodeType' in value) {
				const pointer: NodePointer = { node: value, graftAncestor: null };
				return createPointerValue(pointer, domFacade);
			}
			if (Array.isArray(value)) {
				return new ArrayValue(
					value.map((arrayItem) => {
						if (arrayItem === undefined) {
							return () => sequenceFactory.empty();
						}
						const adaptedValue = adaptSingleJavaScriptValue(arrayItem, domFacade);
						const adaptedSequence =
							adaptedValue === null
								? sequenceFactory.empty()
								: sequenceFactory.singleton(adaptedValue);

						return createDoublyIterableSequence(adaptedSequence);
					})
				);
			}
			// Make it a map
			return new MapValue(
				Object.keys(value)
					.filter((key) => value[key] !== undefined)
					.map((key) => {
						const adaptedValue = adaptSingleJavaScriptValue(value[key], domFacade);
						const adaptedSequence =
							adaptedValue === null
								? sequenceFactory.empty()
								: sequenceFactory.singleton(adaptedValue);

						return {
							key: createAtomicValue(key, 'xs:string'),
							value: createDoublyIterableSequence(adaptedSequence),
						};
					})
			);
	}
	// This code will be reached if the passed value is not actually a ValidValue. This can happen
	// as JavaScript does not check the types from TypeScript
	throw new Error(
		`Value ${String(value)} of type "${typeof value}" is not adaptable to an XPath value.`
	);
}

function checkNumericType(value: ValidValue, type: ValueType): asserts value is number {
	if (typeof value === 'number') {
		return;
	}
	if (typeof value === 'string') {
		const validator = getValidatorForType(type);
		if (validator(value)) {
			return;
		}
	}
	throw new Error(
		`Cannot convert JavaScript value '${value}' to the XPath type ${type} since it is not valid.`
	);
}

/**
 * Adapt a JavaScript value to the equivalent in XPath. This tries to keep the preferred type
 *
 * @param  value
 * @return Null if the value is absent and the empty sequence should be outputted instead
 */
function adaptJavaScriptValueToXPath(
	type: ValueType,
	value: UntypedExternalValue,
	domFacade: DomFacade
): Value | null {
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
			checkNumericType(value, 'xs:double');
			return createAtomicValue(+value, 'xs:double');
		case 'xs:decimal':
			checkNumericType(value, type);
			return createAtomicValue(+value, 'xs:decimal');
		case 'xs:integer':
			checkNumericType(value, type);
			return createAtomicValue(value | 0, 'xs:integer');
		case 'xs:float':
			checkNumericType(value, type);
			return createAtomicValue(+value, 'xs:float');
		case 'xs:date':
		case 'xs:time':
		case 'xs:dateTime':
		case 'xs:gYearMonth':
		case 'xs:gYear':
		case 'xs:gMonthDay':
		case 'xs:gMonth':
		case 'xs:gDay':
			if (!(value instanceof Date)) {
				throw new Error(
					`The JavaScript value ${value} with type ${typeof value} is not a valid type to be converted to an XPath ${type}.`
				);
			}
			return createAtomicValue(
				DateTime.fromString(value.toISOString()).convertToType(type),
				type
			);
		case 'node()':
		case 'attribute()':
		case 'document-node()':
		case 'element()':
		case 'text()':
		case 'processing-instruction()':
		case 'comment()':
			if (!(typeof value === 'object') || !('nodeType' in value)) {
				throw new Error(
					`The JavaScript value ${value} with type ${typeof value} is not a valid type to be converted to an XPath ${type}.`
				);
			}
			const pointer: NodePointer = { node: value, graftAncestor: null };
			return createPointerValue(pointer, domFacade);
		case 'item()':
			return adaptSingleJavaScriptValue(value, domFacade);
		default:
			throw new Error(
				`Values of the type "${type}" can not be adapted to equivalent XPath values.`
			);
	}
}

export function adaptJavaScriptValueToArrayOfXPathValues(
	domFacade: DomFacade,
	value: UntypedExternalValue,
	expectedType: string
): Value[] {
	const parts = expectedType.match(/^([^+?*]*)([\+\*\?])?$/);
	const type = parts[1] as ValueType;
	const multiplicity = parts[2];

	switch (multiplicity) {
		case '?': {
			const converted = adaptJavaScriptValueToXPath(type, value, domFacade);
			return converted === null ? [] : [converted];
		}
		case '+':
		case '*': {
			if (!Array.isArray(value)) {
				throw new Error(
					`The JavaScript value ${value} should be an array if it is to be converted to ${expectedType}.`
				);
			}
			return value
				.map((val) => adaptJavaScriptValueToXPath(type, val, domFacade))
				.filter((val: Value | null) => val !== null);
		}

		default: {
			const adaptedValue = adaptJavaScriptValueToXPath(type, value, domFacade);
			if (adaptedValue === null) {
				throw new Error(
					`The JavaScript value ${value} should be an single entry if it is to be converted to ${expectedType}.`
				);
			}
			return [adaptedValue];
		}
	}
}

/**
 * Create a sequence from JavaScript objects
 *
 * @param  domFacade     The DomFacade to use when creating a NodeValue
 * @param  value         The value to convert. This can be null when the type is zero-or-one (?).
 *                       Can be a single value when the value is exactly one, must be an array
 *                       otherwise.
 * @param  expectedType  The type to convert to
 * @return A sequence containing the converted value(s)
 */
export function adaptJavaScriptValueToSequence(
	domFacade: DomFacade,
	value: UntypedExternalValue,
	expectedType: string = 'item()?'
): ISequence {
	return sequenceFactory.create(
		adaptJavaScriptValueToArrayOfXPathValues(domFacade, value, expectedType)
	);
}
