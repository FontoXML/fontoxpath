import { ValueType } from '../Value';
import QName from '../valueTypes/QName';

export default function castToStringLikeType(
	instanceOf: (t: ValueType) => boolean,
): (value: any) => { successful: true; value: any } | { error: Error; successful: false } {
	if (instanceOf(ValueType.XSSTRING) || instanceOf(ValueType.XSUNTYPEDATOMIC)) {
		return (value) => ({
			successful: true,
			value: value + '',
		});
	}
	if (instanceOf(ValueType.XSANYURI)) {
		return (value) => ({
			successful: true,
			value,
		});
	}
	if (instanceOf(ValueType.XSQNAME)) {
		return (value: QName) => {
			return {
				successful: true,
				value: value.prefix ? `${value.prefix}:${value.localName}` : value.localName,
			};
		};
	}
	if (instanceOf(ValueType.XSNOTATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(ValueType.XSNUMERIC)) {
		if (instanceOf(ValueType.XSINTEGER) || instanceOf(ValueType.XSDECIMAL)) {
			return (value) => ({
				successful: true,
				value: (value + '').replace('e', 'E'),
			});
		}
		if (instanceOf(ValueType.XSFLOAT) || instanceOf(ValueType.XSDOUBLE)) {
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
		instanceOf(ValueType.XSDATETIME) ||
		instanceOf(ValueType.XSDATE) ||
		instanceOf(ValueType.XSTIME) ||
		instanceOf(ValueType.XSGDAY) ||
		instanceOf(ValueType.XSGMONTH) ||
		instanceOf(ValueType.XSGMONTHDAY) ||
		instanceOf(ValueType.XSGYEAR) ||
		instanceOf(ValueType.XSGYEARMONTH)
	) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(ValueType.XSYEARMONTHDURATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(ValueType.XSDAYTIMEDURATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(ValueType.XSDURATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(ValueType.XSHEXBINARY)) {
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
