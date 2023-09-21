import { errFORG0001 } from '../../../expressions/XPathErrors';
import { ValueType } from '../Value';

export default function castToFloatLikeType(
	instanceOf: (typeName: ValueType) => boolean,
	to: ValueType,
): (value: any) => { successful: true; value: number } | { error: Error; successful: false } {
	if (instanceOf(ValueType.XSNUMERIC)) {
		return (value) => ({
			successful: true,
			value,
		});
	}
	if (instanceOf(ValueType.XSBOOLEAN)) {
		return (value) => ({
			successful: true,
			value: value ? 1 : 0,
		});
	}
	if (instanceOf(ValueType.XSSTRING) || instanceOf(ValueType.XSUNTYPEDATOMIC)) {
		return (value) => {
			switch (value) {
				case 'NaN':
					return {
						successful: true,
						value: NaN,
					};
				case 'INF':
				case '+INF':
					return {
						successful: true,
						value: Infinity,
					};
				case '-INF':
					return {
						successful: true,
						value: -Infinity,
					};
				case '0':
				case '+0':
					return {
						successful: true,
						value: 0,
					};
				case '-0':
					return {
						successful: true,
						value: -0,
					};
			}
			const floatValue = parseFloat(value);
			if (!isNaN(floatValue)) {
				return {
					successful: true,
					value: floatValue,
				};
			}
			return {
				successful: false,
				error: errFORG0001(value, to),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			`XPTY0004: Casting not supported from given type to ${to} or any of its derived types.`,
		),
	});
}
