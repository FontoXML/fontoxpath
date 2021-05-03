import { BaseType, ValueType } from '../Value';
import QName from '../valueTypes/QName';

export default function castToStringLikeType(
	instanceOf: (t: ValueType) => boolean
): (value: any) => { successful: true; value: any } | { error: Error; successful: false } {
	if (instanceOf({ kind: BaseType.XSSTRING }) || instanceOf({ kind: BaseType.XSUNTYPEDATOMIC })) {
		return (value) => ({
			successful: true,
			value: value + '',
		});
	}
	if (instanceOf({ kind: BaseType.XSANYURI })) {
		return (value) => ({
			successful: true,
			value,
		});
	}
	if (instanceOf({ kind: BaseType.XSQNAME })) {
		return (value: QName) => {
			return {
				successful: true,
				value: value.prefix ? `${value.prefix}:${value.localName}` : value.localName,
			};
		};
	}
	if (instanceOf({ kind: BaseType.XSNOTATION })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSNUMERIC })) {
		if (instanceOf({ kind: BaseType.XSINTEGER }) || instanceOf({ kind: BaseType.XSDECIMAL })) {
			return (value) => ({
				successful: true,
				value: (value + '').replace('e', 'E'),
			});
		}
		if (instanceOf({ kind: BaseType.XSFLOAT }) || instanceOf({ kind: BaseType.XSDOUBLE })) {
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
		instanceOf({ kind: BaseType.XSDATETIME }) ||
		instanceOf({ kind: BaseType.XSDATE }) ||
		instanceOf({ kind: BaseType.XSTIME }) ||
		instanceOf({ kind: BaseType.XSGDAY }) ||
		instanceOf({ kind: BaseType.XSGMONTH }) ||
		instanceOf({ kind: BaseType.XSGMONTHDAY }) ||
		instanceOf({ kind: BaseType.XSGYEAR }) ||
		instanceOf({ kind: BaseType.XSGYEARMONTH })
	) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSYEARMONTHDURATION })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSDAYTIMEDURATION })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSDURATION })) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf({ kind: BaseType.XSHEXBINARY })) {
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
