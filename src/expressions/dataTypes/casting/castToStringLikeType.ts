import { BaseType, SequenceType, ValueType } from '../Value';
import QName from '../valueTypes/QName';

export default function castToStringLikeType(
	instanceOf: (t: ValueType) => boolean
): (value: any) => { successful: true; value: any } | { error: Error; successful: false } {
	if (
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: value + '',
		});
	}
	if (instanceOf({ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value,
		});
	}
	if (instanceOf({ kind: BaseType.XSQNAME, seqType: SequenceType.EXACTLY_ONE })) {
		return (value: QName) => {
			return {
				successful: true,
				value: value.prefix ? `${value.prefix}:${value.localName}` : value.localName,
			};
		};
	}
	if (instanceOf({ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSNUMERIC, seqType: SequenceType.EXACTLY_ONE })) {
		if (
			instanceOf({ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }) ||
			instanceOf({ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE })
		) {
			return (value) => ({
				successful: true,
				value: (value + '').replace('e', 'E'),
			});
		}
		if (
			instanceOf({ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }) ||
			instanceOf({ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE })
		) {
			return (value) => {
				if (isNaN(value)) {
					return {
						successful: true,
						value: 'NaN',
					};
				}
				if (!isFinite(value)) {
					return {
						successful: true,
						value: `${value < 0 ? '-' : ''}INF`,
					};
				}
				if (Object.is(value, -0)) {
					return {
						successful: true,
						value: '-0',
					};
				}
				// Use Javascript's built in number formatting. This outputs like 1e+100. The valid XPath version is
				// 1E100: without the +, and with the exponent in capitals
				return {
					successful: true,
					value: (value + '').replace('e', 'E').replace('E+', 'E'),
				};
			};
		}
	}
	if (
		instanceOf({ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: value.toUpperCase(),
		});
	}
	return (value) => ({
		successful: true,
		value: value + '',
	});
}
