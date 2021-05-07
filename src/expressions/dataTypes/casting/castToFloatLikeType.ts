import { BaseType } from '../BaseType';

export default function castToFloatLikeType(
	instanceOf: (typeName: BaseType) => boolean,
	to: BaseType
): (value: any) => { successful: true; value: number } | { error: Error; successful: false } {
	if (instanceOf(BaseType.XSNUMERIC)) {
		return (value) => ({
			successful: true,
			value,
		});
	}
	if (instanceOf(BaseType.XSBOOLEAN)) {
		return (value) => ({
			successful: true,
			value: value ? 1 : 0,
		});
	}
	if (instanceOf(BaseType.XSSTRING) || instanceOf(BaseType.XSUNTYPEDATOMIC)) {
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
				error: new Error(`FORG0001: Cannot cast "${value}" to ${to}.`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			`XPTY0004: Casting not supported from given type to ${to} or any of its derived types.`
		),
	});
}
