import { getPrimitiveTypeName, normalizeWhitespace, validatePattern, validateRestrictions } from '../typeHelpers';

import isSubtypeOf from '../isSubtypeOf';

import createAtomicValue from '../createAtomicValue';

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
 * @param    {string}                  from
 * @param    {!string}                 to
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}}
 */
function castToPrimitiveType (from, to) {
	const instanceOf = type => isSubtypeOf(from, type);

	if (to === 'xs:error') {
		return () => ({
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is always invalid.')
		});
	}

	switch (to) {
		case 'xs:untypedAtomic':
			return castToUntypedAtomic(instanceOf);
		case 'xs:string':
			return castToString(instanceOf);
		case 'xs:float':
			return castToFloat(instanceOf);
		case 'xs:double':
			return castToDouble(instanceOf);
		case 'xs:decimal':
			return castToDecimal(instanceOf);
		case 'xs:integer':
			return castToInteger(instanceOf);
		case 'xs:duration':
			return castToDuration(instanceOf);
		case 'xs:yearMonthDuration':
			return castToYearMonthDuration(instanceOf);
		case 'xs:dayTimeDuration':
			return castToDayTimeDuration(instanceOf);
		case 'xs:dateTime':
			return castToDateTime(instanceOf);
		case 'xs:time':
			return castToTime(instanceOf);
		case 'xs:date':
			return castToDate(instanceOf);
		case 'xs:gYearMonth':
			return castToGYearMonth(instanceOf);
		case 'xs:gYear':
			return castToGYear(instanceOf);
		case 'xs:gMonthDay':
			return castToGMonthDay(instanceOf);
		case 'xs:gDay':
			return castToGDay(instanceOf);
		case 'xs:gMonth':
			return castToGMonth(instanceOf);
		case 'xs:boolean':
			return castToBoolean(instanceOf);
		case 'xs:base64Binary':
			return castToBase64Binary(instanceOf);
		case 'xs:hexBinary':
			return castToHexBinary(instanceOf);
		case 'xs:anyURI':
			return castToAnyURI(instanceOf);
		case 'xs:QName':
			throw new Error('Casting to xs:QName is not implemented.');
	}

	return () => ({
		successful: false,
		error: new Error(`XPTY0004: Casting not supported from ${from} to ${to}.`)
	});
}

const precomputedCastFunctorsByTypeString = Object.create(null);

function createCastingFunction (from, to) {
	if (from === 'xs:untypedAtomic' && to === 'xs:string') {
		return val => ({ successful: true, value: createAtomicValue(val, 'xs:string') });
	}
	if (to === 'xs:NOTATION') {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting to xs:NOTATION is not permitted.')
		});
	}

	if (to === 'xs:error') {
		return (_val) => ({
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is not permitted.')
		});
	}

	if (from === 'xs:anySimpleType' || to === 'xs:anySimpleType') {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anySimpleType is not permitted.')
		});
	}

	if (from === 'xs:anyAtomicType' || to === 'xs:anyAtomicType') {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anyAtomicType is not permitted.')
		});
	}

	const primitiveFrom = TREAT_AS_PRIMITIVE.includes(from) ? from : getPrimitiveTypeName(from);
	const primitiveTo = TREAT_AS_PRIMITIVE.includes(to) ? to : getPrimitiveTypeName(to);

	if (!primitiveTo || !primitiveFrom) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0081: Can not cast: type is unknown.')
		});
	}
	const converters = [];

	if (primitiveFrom === 'xs:string' || primitiveFrom === 'xs:untypedAtomic') {
		// We are dealing with string-like types. Check whitespace / pattern
		converters.push(value => {
			const strValue = normalizeWhitespace(value, to);
			if (!validatePattern(strValue, to)) {
				return {
					successful: false,
					error: new Error(`FORG0001: Cannot cast ${value} to ${to}, pattern validation failed.`)
				};
			}
			return {
				successful: true,
				value: strValue
			};
		});
	}

	// Actually cast downwards
	if (primitiveFrom !== primitiveTo) {
		converters.push(castToPrimitiveType(primitiveFrom, primitiveTo));
		converters.push(value => ({
			successful: true,
			value: value.value
		}));
	}
	if (primitiveTo === 'xs:untypedAtomic' || primitiveTo === 'xs:string') {
		converters.push(typedValue => {
			if (!validatePattern(typedValue, to)) {
				return {
					successful: false,
					error: new Error(`FORG0001: Cannot cast ${typedValue} to ${to}, pattern validation failed.`)
				};
			}
			return {
				successful: true,
				value: typedValue
			};
		});
	}
	converters.push(typedValue => {
		if (!validateRestrictions(typedValue, to)) {
			return {
				successful: false,
				error: new Error(`FORG0001: Cannot cast "${typedValue}" to ${to}, restriction validation failed.`)
			};
		}
		return {
			successful: true,
			value: typedValue
		};
	});


	// assume we can just use the primitive datatype
	converters.push(typedValue => ({
		successful: true,
		value: {
			type: to,
			value: typedValue
		}
	}));

	return value => {
		let result = { successful: true, value: value };
		for (let i = 0, l = converters.length; i < l; ++i) {
			result = converters[i].call(undefined, result.value);
			if (result.successful === false) {
				return result;
			}
		}
		return result;
	};
}

/**
 * @param     {!../AtomicValue<!./AtomicValueDataType>}  valueTuple
 * @param     {string}   type
 * @return    {{successful: boolean, value: !../AtomicValue<!./AtomicValueDataType>}|{successful: boolean, error: !Error}}
 */
export default function tryCastToType (valueTuple, type) {
	let prefabConverter = precomputedCastFunctorsByTypeString[`${valueTuple.type}~${type}`];

	if (!prefabConverter) {
		prefabConverter = precomputedCastFunctorsByTypeString[`${valueTuple.type}~${type}`] = createCastingFunction(valueTuple.type, type);
	}
	return prefabConverter.call(undefined, valueTuple.value, type);
}
