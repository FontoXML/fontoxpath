import {
	getPrimitiveTypeName,
	normalizeWhitespace,
	validatePattern,
	validateRestrictions
} from '../typeHelpers';

import builtinDataTypesByName from '../builtins/builtinDataTypesByName';

import isSubtypeOf from '../isSubtypeOf';

import castToAnyURI from './castToAnyURI';
import castToBase64Binary from './castToBase64Binary';
import castToBoolean from './castToBoolean';
import castToDate from './castToDate';
import castToDateTime from './castToDateTime';
import castToDayTimeDuration from './castToDayTimeDuration';
import castToDecimal from './castToDecimal';
import castToDouble from './castToDouble';
import castToDuration from './castToDuration';
import castToFloat from './castToFloat';
import castToGDay from './castToGDay';
import castToGMonth from './castToGMonth';
import castToGMonthDay from './castToGMonthDay';
import castToGYear from './castToGYear';
import castToGYearMonth from './castToGYearMonth';
import castToHexBinary from './castToHexBinary';
import castToInteger from './castToInteger';
import castToString from './castToString';
import castToTime from './castToTime';
import castToUntypedAtomic from './castToUntypedAtomic';
import castToYearMonthDuration from './castToYearMonthDuration';

const TREAT_AS_PRIMITIVE = [
	'xs:integer',
	'xs:dayTimeDuration',
	'xs:yearMonthDuration'
];

/**
 * @param    {!./AtomicValueDataType}  value
 * @param    {string}                  from
 * @param    {!string}                 to
 * @return   {{successful: boolean, value: !../AtomicValue<!./AtomicValueDataType>}|{successful: boolean, error: !Error}}
 */
function castToPrimitiveType (value, from, to) {
	const instanceOf = type => isSubtypeOf(from, type);

	if (to === 'xs:error') {
		return {
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is always invalid.')
		};
	}

	switch (to) {
		case 'xs:untypedAtomic':
			return castToUntypedAtomic(value, instanceOf);
		case 'xs:string':
			return castToString(value, instanceOf);
		case 'xs:float':
			return castToFloat(value, instanceOf);
		case 'xs:double':
			return castToDouble(value, instanceOf);
		case 'xs:decimal':
			return castToDecimal(value, instanceOf);
		case 'xs:integer':
			return castToInteger(value, instanceOf);
		case 'xs:duration':
			return castToDuration(value, instanceOf);
		case 'xs:yearMonthDuration':
			return castToYearMonthDuration(value, instanceOf);
		case 'xs:dayTimeDuration':
			return castToDayTimeDuration(value, instanceOf);
		case 'xs:dateTime':
			return castToDateTime(value, instanceOf);
		case 'xs:time':
			return castToTime(value, instanceOf);
		case 'xs:date':
			return castToDate(value, instanceOf);
		case 'xs:gYearMonth':
			return castToGYearMonth(value, instanceOf);
		case 'xs:gYear':
			return castToGYear(value, instanceOf);
		case 'xs:gMonthDay':
			return castToGMonthDay(value, instanceOf);
		case 'xs:gDay':
			return castToGDay(value, instanceOf);
		case 'xs:gMonth':
			return castToGMonth(value, instanceOf);
		case 'xs:boolean':
			return castToBoolean(value, instanceOf);
		case 'xs:base64Binary':
			return castToBase64Binary(value, instanceOf);
		case 'xs:hexBinary':
			return castToHexBinary(value, instanceOf);
		case 'xs:anyURI':
			return castToAnyURI(value, instanceOf);
	}

	return {
		successful: false,
		error: new Error(`XPTY0004: Casting not supported from ${from} to ${to}.`)
	};
}

/**
 * @param     {!../AtomicValue<!./AtomicValueDataType>}  valueTuple
 * @param     {string}   type
 * @return    {{successful: boolean, value: !../AtomicValue<!./AtomicValueDataType>}|{successful: boolean, error: !Error}}
 */
export default function tryCastToType (valueTuple, type) {
	/**
	 * @type {string}
	 */
	const from = valueTuple.type;
	const to = type;

	if (to === 'xs:NOTATION') {
		return {
			successful: false,
			error: new Error('XPST0080: Casting to xs:NOTATION is not permitted.')
		};
	}

	if (to === 'xs:error') {
		return {
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is not permitted.')
		};
	}

	if (from === 'xs:anySimpleType' || to === 'xs:anySimpleType') {
		return {
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anySimpleType is not permitted.')
		};
	}

	if (from === 'xs:anyAtomicType' || to === 'xs:anyAtomicType') {
		return {
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anyAtomicType is not permitted.')
		};
	}

	const primitiveFrom = TREAT_AS_PRIMITIVE.includes(from) ? from : getPrimitiveTypeName(from);
	const primitiveTo = TREAT_AS_PRIMITIVE.includes(to) ? to : getPrimitiveTypeName(to);

	if (!primitiveTo || !primitiveFrom) {
		return {
			successful: false,
			error: new Error('XPST0080: Casting from or to types without a primitive base type is not supported.')
		};
	}

	let jsValue = valueTuple.value;

	if (primitiveFrom === 'xs:string' || primitiveFrom === 'xs:untypedAtomic') {
		// We are dealing with string-like types. Check whitespace / pattern
		const stringValue = normalizeWhitespace(jsValue, to);

		if (!validatePattern(stringValue, to)) {
			return {
				successful: false,
				error: new Error(`FORG0001: Cannot cast ${jsValue} to ${to}, pattern validation failed.`)
			};
		}
		jsValue = stringValue;
	}

	// Actually cast downwards
	const typedValue = castToPrimitiveType(jsValue, primitiveFrom, primitiveTo);
	if (!typedValue.successful) {
		return typedValue;
	}
	if (primitiveTo === 'xs:untypedAtomic' || primitiveTo === 'xs:string') {
		if (!validatePattern(typedValue.value.value, to)) {
			return {
				successful: false,
				error: new Error(`FORG0001: Cannot cast ${jsValue} to ${to}, pattern validation failed.`)
			};
		}
	}

	if (!validateRestrictions(typedValue.value.value, to)) {
		return {
			successful: false,
			error: new Error(`FORG0001: Cannot cast "${typedValue.value}" to ${to}, restriction validation failed.`)
		};
	}

	if (primitiveTo !== to) {
		// assume we can just use the primitive datatype
		return {
			successful: true,
			value: {
				type: to,
				value: typedValue.value.value
			}
		};
	}
	return typedValue;
}
