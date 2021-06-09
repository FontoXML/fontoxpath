import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import isSubtypeOf from '../isSubtypeOf';
import {
	getPrimitiveTypeName,
	normalizeWhitespace,
	validatePattern,
	validateRestrictions,
} from '../typeHelpers';
import Value, { ValueType, valueTypeToString } from '../Value';
import CastResult from './CastResult';
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
import castToNumeric from './castToNumeric';
import castToString from './castToString';
import castToTime from './castToTime';
import castToUntypedAtomic from './castToUntypedAtomic';
import castToYearMonthDuration from './castToYearMonthDuration';

const TREAT_AS_PRIMITIVE = [
	ValueType.XSNUMERIC,
	ValueType.XSINTEGER,
	ValueType.XSDAYTIMEDURATION,
	ValueType.XSYEARMONTHDURATION,
];

export function castToPrimitiveType(from: ValueType, to: ValueType): (value: Value) => CastResult {
	const instanceOf = (type: ValueType) => isSubtypeOf(from, type);

	if (to === ValueType.XSERROR) {
		return () => ({
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is always invalid.'),
		});
	}
	switch (to) {
		case ValueType.XSUNTYPEDATOMIC:
			return castToUntypedAtomic(instanceOf);
		case ValueType.XSSTRING:
			return castToString(instanceOf);
		case ValueType.XSFLOAT:
			return castToFloat(instanceOf);
		case ValueType.XSDOUBLE:
			return castToDouble(instanceOf);
		case ValueType.XSDECIMAL:
			return castToDecimal(instanceOf);
		case ValueType.XSINTEGER:
			return castToInteger(instanceOf);
		case ValueType.XSNUMERIC:
			// This case exists because numeric is a union type.
			// It needs to be turned into a concrete type
			// (almost always a double).
			return castToNumeric(castToPrimitiveType);
		case ValueType.XSDURATION:
			return castToDuration(instanceOf);
		case ValueType.XSYEARMONTHDURATION:
			return castToYearMonthDuration(instanceOf);
		case ValueType.XSDAYTIMEDURATION:
			return castToDayTimeDuration(instanceOf);
		case ValueType.XSDATETIME:
			return castToDateTime(instanceOf);
		case ValueType.XSTIME:
			return castToTime(instanceOf);
		case ValueType.XSDATE:
			return castToDate(instanceOf);
		case ValueType.XSGYEARMONTH:
			return castToGYearMonth(instanceOf);
		case ValueType.XSGYEAR:
			return castToGYear(instanceOf);
		case ValueType.XSGMONTHDAY:
			return castToGMonthDay(instanceOf);
		case ValueType.XSGDAY:
			return castToGDay(instanceOf);
		case ValueType.XSGMONTH:
			return castToGMonth(instanceOf);
		case ValueType.XSBOOLEAN:
			return castToBoolean(instanceOf);
		case ValueType.XSBASE64BINARY:
			return castToBase64Binary(instanceOf);
		case ValueType.XSHEXBINARY:
			return castToHexBinary(instanceOf);
		case ValueType.XSANYURI:
			return castToAnyURI(instanceOf);
		case ValueType.XSQNAME:
			throw new Error('Casting to xs:QName is not implemented.');
	}

	return () => ({
		successful: false,
		error: new Error(`XPTY0004: Casting not supported from ${from} to ${to}.`),
	});
}

const precomputedCastFunctorsByTypeString = Object.create(null);

function createCastingFunction(from: ValueType, to: ValueType): (value: Value) => CastResult {
	if (from === ValueType.XSUNTYPEDATOMIC && to === ValueType.XSSTRING) {
		return (val) => ({
			successful: true,
			value: createAtomicValue(val, ValueType.XSSTRING),
		});
	}
	if (to === ValueType.XSNOTATION) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting to xs:NOTATION is not permitted.'),
		});
	}

	if (to === ValueType.XSERROR) {
		return (_val) => ({
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is not permitted.'),
		});
	}

	if (from === ValueType.XSANYSIMPLETYPE || to === ValueType.XSANYSIMPLETYPE) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anySimpleType is not permitted.'),
		});
	}

	if (from === ValueType.XSANYATOMICTYPE || to === ValueType.XSANYATOMICTYPE) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anyAtomicType is not permitted.'),
		});
	}

	if (isSubtypeOf(from, ValueType.FUNCTION) && to === ValueType.XSSTRING) {
		return (_val) => ({
			successful: false,
			error: new Error('FOTY0014: Casting from function item to xs:string is not permitted.'),
		});
	}

	const primitiveFrom = TREAT_AS_PRIMITIVE.includes(from) ? from : getPrimitiveTypeName(from);
	const primitiveTo = TREAT_AS_PRIMITIVE.includes(to) ? to : getPrimitiveTypeName(to);

	if (primitiveTo === null || primitiveFrom === null) {
		return (_val) => ({
			successful: false,
			error: new Error(
				`XPST0081: Can not cast: type ${
					primitiveTo ? valueTypeToString(from) : valueTypeToString(to)
				} is unknown.`
			),
		});
	}

	const converters: ((value: AtomicValue) => CastResult)[] = [];

	if (primitiveFrom === ValueType.XSSTRING || primitiveFrom === ValueType.XSUNTYPEDATOMIC) {
		// We are dealing with string-like types. Check whitespace / pattern
		// TODO: This code seems broken!
		converters.push((value: any) => {
			const strValue = normalizeWhitespace(value, to);
			if (!validatePattern(strValue, to)) {
				return {
					successful: false,
					error: new Error(
						`FORG0001: Cannot cast ${value} to ${to}, pattern validation failed.`
					),
				};
			}
			return {
				successful: true,
				value: strValue as any,
			};
		});
	}

	// Actually cast downwards
	if (primitiveFrom !== primitiveTo) {
		converters.push(castToPrimitiveType(primitiveFrom, primitiveTo));
		converters.push((value) => ({
			successful: true,
			value: value.value,
		}));
	}
	if (primitiveTo === ValueType.XSUNTYPEDATOMIC || primitiveTo === ValueType.XSSTRING) {
		// TODO: This code seems broken!
		converters.push((typedValue: any) => {
			if (!validatePattern(typedValue, to)) {
				return {
					successful: false,
					error: new Error(
						`FORG0001: Cannot cast ${typedValue} to ${to}, pattern validation failed.`
					),
				};
			}
			return {
				successful: true,
				value: typedValue,
			};
		});
	}
	// TODO: This code seems broken!
	converters.push((typedValue: any) => {
		if (!validateRestrictions(typedValue, to)) {
			return {
				successful: false,
				error: new Error(
					`FORG0001: Cannot cast "${typedValue}" to ${to}, restriction validation failed.`
				),
			};
		}
		return {
			successful: true,
			value: typedValue,
		};
	});

	// assume we can just use the primitive datatype
	converters.push((typedValue) => ({
		successful: true,
		value: {
			type: to,
			value: typedValue,
		},
	}));

	return (value) => {
		let result: CastResult = { successful: true, value };
		for (let i = 0, l = converters.length; i < l; ++i) {
			result = converters[i](result.value);
			if (result.successful === false) {
				return result;
			}
		}
		return result;
	};
}

export default function tryCastToType(valueTuple: AtomicValue, type: ValueType): CastResult {
	const index = (valueTuple.type as number) + (type as number) * 10000;
	let prefabConverter = precomputedCastFunctorsByTypeString[index];

	if (!prefabConverter) {
		prefabConverter = precomputedCastFunctorsByTypeString[index] = createCastingFunction(
			valueTuple.type,
			type
		);
	}
	return prefabConverter.call(undefined, valueTuple.value, type);
}
