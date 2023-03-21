import { NodePointer } from '../domClone/Pointer';
import DomFacade from '../domFacade/DomFacade';
import { UntypedExternalValue, ValidValue } from '../types/createTypedValueFactory';
import ArrayValue from './dataTypes/ArrayValue';
import { getValidatorForType } from './dataTypes/builtins/dataTypeValidatorByType';
import createAtomicValue, { falseBoolean, trueBoolean } from './dataTypes/createAtomicValue';
import createPointerValue from './dataTypes/createPointerValue';
import ISequence from './dataTypes/ISequence';
import MapValue from './dataTypes/MapValue';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value, {
	SequenceMultiplicity,
	SequenceType,
	sequenceTypeToString,
	ValueType,
	valueTypeToString,
} from './dataTypes/Value';
import DateTime from './dataTypes/valueTypes/DateTime';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

/**
 * Adapt a JavaScript value to the equivalent in XPath. This dynamically assigns the closest type
 *
 * @param  value
 * @return Null if the value is absent and the empty sequence should be
 * output instead
 */
export function adaptSingleJavaScriptValue(value: ValidValue, domFacade: DomFacade): Value | null {
	if (value === null) {
		return null;
	}

	switch (typeof value) {
		case 'boolean':
			return value ? trueBoolean : falseBoolean;
		case 'number':
			return createAtomicValue(value, ValueType.XSDOUBLE);
		case 'string':
			return createAtomicValue(value, ValueType.XSSTRING);
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
			if (value instanceof Date) {
				const date = DateTime.fromString(value.toISOString());
				return createAtomicValue(date, date.type);
			}
			// Make it a map
			const mapValue = value as { [s: string]: ValidValue };
			return new MapValue(
				Object.keys(mapValue)
					.filter((key) => mapValue[key] !== undefined)
					.map((key) => {
						const adaptedValue = adaptSingleJavaScriptValue(mapValue[key], domFacade);
						const adaptedSequence =
							adaptedValue === null
								? sequenceFactory.empty()
								: sequenceFactory.singleton(adaptedValue);

						return {
							key: createAtomicValue(key, ValueType.XSSTRING),
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
		`Cannot convert JavaScript value '${value}' to the XPath type ${valueTypeToString(
			type
		)} since it is not valid.`
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
		case ValueType.XSBOOLEAN:
			return value ? trueBoolean : falseBoolean;
		case ValueType.XSSTRING:
			return createAtomicValue(value + '', ValueType.XSSTRING);
		case ValueType.XSDOUBLE:
		case ValueType.XSNUMERIC:
			checkNumericType(value, ValueType.XSDOUBLE);
			return createAtomicValue(+value, ValueType.XSDOUBLE);
		case ValueType.XSDECIMAL:
			checkNumericType(value, type);
			return createAtomicValue(+value, ValueType.XSDECIMAL);
		case ValueType.XSINTEGER:
			checkNumericType(value, type);
			return createAtomicValue(value | 0, ValueType.XSINTEGER);
		case ValueType.XSFLOAT:
			checkNumericType(value, type);
			return createAtomicValue(+value, ValueType.XSFLOAT);
		case ValueType.XSDATE:
		case ValueType.XSTIME:
		case ValueType.XSDATETIME:
		case ValueType.XSGYEARMONTH:
		case ValueType.XSGYEAR:
		case ValueType.XSGMONTHDAY:
		case ValueType.XSGMONTH:
		case ValueType.XSGDAY:
			if (!(value instanceof Date)) {
				throw new Error(
					`The JavaScript value ${value} with type ${typeof value} is not a valid type to be converted to an XPath ${valueTypeToString(
						type
					)}.`
				);
			}
			return createAtomicValue(
				DateTime.fromString(value.toISOString()).convertToType(type),
				type
			);
		case ValueType.NODE:
		case ValueType.ATTRIBUTE:
		case ValueType.DOCUMENTNODE:
		case ValueType.ELEMENT:
		case ValueType.TEXT:
		case ValueType.PROCESSINGINSTRUCTION:
		case ValueType.COMMENT:
			if (!(typeof value === 'object') || !('nodeType' in value)) {
				throw new Error(
					`The JavaScript value ${value} with type ${typeof value} is not a valid type to be converted to an XPath ${valueTypeToString(
						type
					)}.`
				);
			}
			const pointer: NodePointer = { node: value, graftAncestor: null };
			return createPointerValue(pointer, domFacade);
		case ValueType.ITEM:
			return adaptSingleJavaScriptValue(value, domFacade);
		case ValueType.MAP:
			return adaptSingleJavaScriptValue(value, domFacade);
		default:
			throw new Error(
				`Values of the type "${valueTypeToString(
					type
				)}" can not be adapted from JavaScript to equivalent XPath values.`
			);
	}
}

export function adaptJavaScriptValueToArrayOfXPathValues(
	domFacade: DomFacade,
	value: UntypedExternalValue,
	expectedType: SequenceType
): Value[] {
	if (expectedType.mult === SequenceMultiplicity.ZERO_OR_ONE) {
		const converted = adaptJavaScriptValueToXPath(expectedType.type, value, domFacade);
		return converted === null ? [] : [converted];
	}

	if (
		expectedType.mult === SequenceMultiplicity.ZERO_OR_MORE ||
		expectedType.mult === SequenceMultiplicity.ONE_OR_MORE
	) {
		if (!Array.isArray(value)) {
			throw new Error(
				`The JavaScript value ${value} should be an array if it is to be converted to ${sequenceTypeToString(
					expectedType
				)}.`
			);
		}
		return value
			.map((val) => adaptJavaScriptValueToXPath(expectedType.type, val, domFacade))
			.filter((val: Value | null) => val !== null);
	}

	const adaptedValue = adaptJavaScriptValueToXPath(expectedType.type, value, domFacade);
	if (adaptedValue === null) {
		throw new Error(
			`The JavaScript value ${value} should be a single entry if it is to be converted to ${sequenceTypeToString(
				expectedType
			)}.`
		);
	}
	return [adaptedValue];
}

/**
 * Create a sequence from JavaScript objects
 *
 * @param  domFacade     The DomFacade to use when creating a NodeValue
 * @param  value         The value to convert. This can be null when the type is zero-or-one (?).
 * Can be a single value when the value is exactly one, must be an array otherwise.
 * @param  expectedType  The type to convert to
 * @return A sequence containing the converted value(s)
 */
export function adaptJavaScriptValueToSequence(
	domFacade: DomFacade,
	value: UntypedExternalValue,
	expectedType: SequenceType = { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_ONE }
): ISequence {
	return sequenceFactory.create(
		adaptJavaScriptValueToArrayOfXPathValues(domFacade, value, expectedType)
	);
}
