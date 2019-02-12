import QName from '../valueTypes/QName';
import { ConcreteNode } from 'src/domFacade/ConcreteNode';

export default function castToStringLikeType(
	instanceOf: (type: string) => boolean
): (
	value: QName | string | number | ConcreteNode
) => { successful: true; value: string } | { error: Error; successful: false } {
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return value => ({
			successful: true,
			value: value + ''
		});
	}
	if (instanceOf('xs:anyURI')) {
		return (value: string) => ({
			successful: true,
			value
		});
	}
	if (instanceOf('xs:QName')) {
		return (value: QName) => ({
			successful: true,
			value: value.prefix ? `${value.prefix}:${value.localName}` : value.localName
		});
	}
	if (instanceOf('xs:NOTATION')) {
		return value => ({
			successful: true,
			value: value.toString()
		});
	}
	if (instanceOf('xs:numeric')) {
		if (instanceOf('xs:integer')) {
			return (value: number) => ({
				successful: true,
				value: value.toFixed(0)
			});
		}
		if (instanceOf('xs:decimal')) {
			return (value: number) => {
				if (Number.isNaN(value)) {
					throw new Error('xs:decimals can not be NaN');
				}
				const isNegative = value < 0;
				value = Math.abs(value);
				let strValue = '';
				const partAfterSeparator = Math.abs(value) % 1;
				if (partAfterSeparator !== 0) {
					let i = 1;
					while (i < 15) {
						const digit = (partAfterSeparator * 10 ** i++) % 10;

						if (digit === 0) {
							break;
						}

						strValue += Math.floor(digit);
					}
				}
				if (strValue !== '') {
					strValue = '.' + strValue;
				}

				value = Math.trunc(value);
				let i = 0;
				do {
					const numberAtOffset = value % 10;
					value = Math.trunc(value / 10);
					strValue = numberAtOffset + strValue;
				} while (value > 0 && i++ < 8);

				return {
					successful: true,
					value: (isNegative ? '-' : '') + strValue
				};
			};
		}
		if (instanceOf('xs:float') || instanceOf('xs:double')) {
			return (value: number) => {
				if (isNaN(value)) {
					return {
						successful: true,
						value: 'NaN'
					};
				}
				if (!isFinite(value)) {
					return {
						successful: true,
						value: `${value < 0 ? '-' : ''}INF`
					};
				}
				if (Object.is(value, -0)) {
					return {
						successful: true,
						value: '-0'
					};
				}
				// Use Javascript's built in number formatting. This outputs like 1e+100. The valid XPath version is
				// 1E100: without the +, and with the exponent in capitals
				return {
					successful: true,
					value: (value + '').replace('e', 'E').replace('E+', 'E')
				};
			};
		}
	}
	if (
		instanceOf('xs:dateTime') ||
		instanceOf('xs:date') ||
		instanceOf('xs:time') ||
		instanceOf('xs:gDay') ||
		instanceOf('xs:gMonth') ||
		instanceOf('xs:gMonthDay') ||
		instanceOf('xs:gYear') ||
		instanceOf('xs:gYearMonth')
	) {
		return value => ({
			successful: true,
			value: value.toString()
		});
	}
	if (instanceOf('xs:yearMonthDuration')) {
		return value => ({
			successful: true,
			value: value.toString()
		});
	}
	if (instanceOf('xs:dayTimeDuration')) {
		return value => ({
			successful: true,
			value: value.toString()
		});
	}
	if (instanceOf('xs:duration')) {
		return value => ({
			successful: true,
			value: value.toString()
		});
	}
	if (instanceOf('xs:hexBinary')) {
		return (value: string) => ({
			successful: true,
			value: value.toUpperCase()
		});
	}
	return value => ({
		successful: true,
		value: value + ''
	});
}
