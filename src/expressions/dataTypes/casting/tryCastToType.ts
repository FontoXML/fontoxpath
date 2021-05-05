import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import isSubtypeOf from '../isSubtypeOf';
import {
	getPrimitiveTypeName,
	normalizeWhitespace,
	validatePattern,
	validateRestrictions,
} from '../typeHelpers';
import { BaseType, ValueType, valueTypeHash, SequenceType } from '../Value';
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
import castToString from './castToString';
import castToTime from './castToTime';
import castToUntypedAtomic from './castToUntypedAtomic';
import castToYearMonthDuration from './castToYearMonthDuration';

const TREAT_AS_PRIMITIVE = [
	BaseType.XSINTEGER,
	BaseType.XSDAYTIMEDURATION,
	BaseType.XSYEARMONTHDURATION,
];

function castToPrimitiveType(from: BaseType, to: BaseType): (value) => CastResult {
	const instanceOf = (type: ValueType) => isSubtypeOf(from, type.kind);

	if (to === BaseType.XSERROR) {
		return () => ({
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is always invalid.'),
		});
	}
	switch (to) {
		case BaseType.XSUNTYPEDATOMIC:
			return castToUntypedAtomic(instanceOf);
		case BaseType.XSSTRING:
			return castToString(instanceOf);
		case BaseType.XSFLOAT:
			return castToFloat(instanceOf);
		case BaseType.XSDOUBLE:
			return castToDouble(instanceOf);
		case BaseType.XSDECIMAL:
			return castToDecimal(instanceOf);
		case BaseType.XSINTEGER:
			return castToInteger(instanceOf);
		case BaseType.XSDURATION:
			return castToDuration(instanceOf);
		case BaseType.XSYEARMONTHDURATION:
			return castToYearMonthDuration(instanceOf);
		case BaseType.XSDAYTIMEDURATION:
			return castToDayTimeDuration(instanceOf);
		case BaseType.XSDATETIME:
			return castToDateTime(instanceOf);
		case BaseType.XSTIME:
			return castToTime(instanceOf);
		case BaseType.XSDATE:
			return castToDate(instanceOf);
		case BaseType.XSGYEARMONTH:
			return castToGYearMonth(instanceOf);
		case BaseType.XSGYEAR:
			return castToGYear(instanceOf);
		case BaseType.XSGMONTHDAY:
			return castToGMonthDay(instanceOf);
		case BaseType.XSGDAY:
			return castToGDay(instanceOf);
		case BaseType.XSGMONTH:
			return castToGMonth(instanceOf);
		case BaseType.XSBOOLEAN:
			return castToBoolean(instanceOf);
		case BaseType.XSBASE64BINARY:
			return castToBase64Binary(instanceOf);
		case BaseType.XSHEXBINARY:
			return castToHexBinary(instanceOf);
		case BaseType.XSANYURI:
			return castToAnyURI(instanceOf);
		case BaseType.XSQNAME:
			throw new Error('Casting to xs:QName is not implemented.');
	}

	return () => ({
		successful: false,
		error: new Error(`XPTY0004: Casting not supported from ${from} to ${to}.`),
	});
}

const precomputedCastFunctorsByTypeString = Object.create(null);

function createCastingFunction(from: ValueType, to: BaseType) {
	if (from.kind === BaseType.XSUNTYPEDATOMIC && to === BaseType.XSSTRING) {
		return (val) => ({
			successful: true,
			value: createAtomicValue(val, {
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			}),
		});
	}
	if (to === BaseType.XSNOTATION) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting to xs:NOTATION is not permitted.'),
		});
	}

	if (to === BaseType.XSERROR) {
		return (_val) => ({
			successful: false,
			error: new Error('FORG0001: Casting to xs:error is not permitted.'),
		});
	}

	if (from.kind === BaseType.XSANYSIMPLETYPE || to === BaseType.XSANYSIMPLETYPE) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anySimpleType is not permitted.'),
		});
	}

	if (from.kind === BaseType.XSANYATOMICTYPE || to === BaseType.XSANYATOMICTYPE) {
		return (_val) => ({
			successful: false,
			error: new Error('XPST0080: Casting from or to xs:anyAtomicType is not permitted.'),
		});
	}

	if (isSubtypeOf(from.kind, BaseType.FUNCTION) && to === BaseType.XSSTRING) {
		return (_val) => ({
			successful: false,
			error: new Error('FOTY0014: Casting from function item to xs:string is not permitted.'),
		});
	}

	const primitiveFrom: BaseType = TREAT_AS_PRIMITIVE.includes(from.kind)
		? from.kind
		: getPrimitiveTypeName(from.kind);
	const primitiveTo: BaseType = TREAT_AS_PRIMITIVE.includes(to) ? to : getPrimitiveTypeName(to);

	if (!primitiveTo || !primitiveFrom) {
		return (_val) => ({
			successful: false,
			error: new Error(`XPST0081: Can not cast: type ${primitiveTo ? from : to} is unknown.`),
		});
	}
	const converters = [];

	if (primitiveFrom === BaseType.XSSTRING || primitiveFrom === BaseType.XSUNTYPEDATOMIC) {
		// We are dealing with string-like types. Check whitespace / pattern
		converters.push((value) => {
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
				value: strValue,
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
	if (primitiveTo === BaseType.XSUNTYPEDATOMIC || primitiveTo === BaseType.XSSTRING) {
		converters.push((typedValue) => {
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
	converters.push((typedValue) => {
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
		let result = { successful: true, value };
		for (let i = 0, l = converters.length; i < l; ++i) {
			result = converters[i].call(undefined, result.value);
			if (result.successful === false) {
				return result;
			}
		}
		return result;
	};
}

export default function tryCastToType(valueTuple: AtomicValue, type: BaseType): CastResult {
	const index = valueTypeHash(valueTuple.type) + (type as number) * 100000;
	let prefabConverter = precomputedCastFunctorsByTypeString[index];

	if (!prefabConverter) {
		prefabConverter = precomputedCastFunctorsByTypeString[index] = createCastingFunction(
			valueTuple.type,
			type
		);
	}
	return prefabConverter.call(undefined, valueTuple.value, type);
}
