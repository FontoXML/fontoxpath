import { BaseType } from '../BaseType';
import QName from '../valueTypes/QName';

export default function castToStringLikeType(
	instanceOf: (t: BaseType) => boolean
): (value: any) => { successful: true; value: any } | { error: Error; successful: false } {
	if (instanceOf(BaseType.XSSTRING) || instanceOf(BaseType.XSUNTYPEDATOMIC)) {
		return (value) => ({
			successful: true,
			value: value + '',
		});
	}
	if (instanceOf(BaseType.XSANYURI)) {
		return (value) => ({
			successful: true,
			value,
		});
	}
	if (instanceOf(BaseType.XSQNAME)) {
		return (value: QName) => {
			return {
				successful: true,
				value: value.prefix ? `${value.prefix}:${value.localName}` : value.localName,
			};
		};
	}
	if (instanceOf(BaseType.XSNOTATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(BaseType.XSNUMERIC)) {
		if (instanceOf(BaseType.XSINTEGER) || instanceOf(BaseType.XSDECIMAL)) {
			return (value) => ({
				successful: true,
				value: (value + '').replace('e', 'E'),
			});
		}
		if (instanceOf(BaseType.XSFLOAT) || instanceOf(BaseType.XSDOUBLE)) {
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
		instanceOf(BaseType.XSDATETIME) ||
		instanceOf(BaseType.XSDATE) ||
		instanceOf(BaseType.XSTIME) ||
		instanceOf(BaseType.XSGDAY) ||
		instanceOf(BaseType.XSGMONTH) ||
		instanceOf(BaseType.XSGMONTHDAY) ||
		instanceOf(BaseType.XSGYEAR) ||
		instanceOf(BaseType.XSGYEARMONTH)
	) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(BaseType.XSYEARMONTHDURATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(BaseType.XSDAYTIMEDURATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(BaseType.XSDURATION)) {
		return (value) => ({
			successful: true,
			value: value.toString(),
		});
	}
	if (instanceOf(BaseType.XSHEXBINARY)) {
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
