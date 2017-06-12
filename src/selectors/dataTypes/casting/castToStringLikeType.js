/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @param  {string}  to
 * @return {{successful: boolean, value: string}|{successful: boolean, error: !Error}}
 */
export default function castToStringLikeType (value, instanceOf, to) {
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return {
			successful: true,
			value: value + ''
		};
	}
	if (instanceOf('xs:anyURI')) {
		return {
			successful: true,
			value: value
		};
	}
	if (instanceOf('xs:QName') || instanceOf('xs:NOTATION')) {
		return {
			successful: true,
			value: value.toString()
		};
	}
	if (instanceOf('xs:numeric')) {
		if (instanceOf('xs:integer') || instanceOf('xs:decimal')) {
			return {
				successful: true,
				value: (value + '').replace('e', 'E')
			};
		}
		else if (instanceOf('xs:float') || instanceOf('xs:double')) {
			if (isNaN(value)) {
				return {
					successful: true,
					value: 'NaN'
				};
			}
			else if (!isFinite(value)) {
				return {
					successful: true,
					value: `${value < 0 ? '-' : ''}INF`
				};
			}
			else if (Object.is(value, -0)) {
				return {
					successful: true,
					value: '-0'
				};
			}
			// Use Javascript's built in number formatting. This outputs like 1e+100. The valid XPath version is
			// 1E100: without the +, and with the exponent in capitals
				return {
					successful: true,
					value: (Object.is(-0, value) ? '-0' : value + '').replace('e', 'E').replace('E+', 'E')
				};
		}
	}
	if (instanceOf('xs:dateTime') ||
		instanceOf('xs:date') ||
		instanceOf('xs:time') ||
		instanceOf('xs:gDay') ||
		instanceOf('xs:gMonth') ||
		instanceOf('xs:gMonthDay') ||
		instanceOf('xs:gYear') ||
		instanceOf('xs:gYearMonth')) {
		return {
			successful: true,
			value: value.toString()
		};
	}
	if (instanceOf('xs:yearMonthDuration')) {
		return {
			successful: true,
			value: value.buildString('xs:yearMonthDuration')
		};
	}
	if (instanceOf('xs:dayTimeDuration')) {
		return {
			successful: true,
			value: value.buildString('xs:dayTimeDuration')
		};
	}
	if (instanceOf('xs:duration')) {
		return {
			successful: true,
			value: value.buildString('xs:duration')
		};
	}
	if (instanceOf('xs:hexBinary')) {
		return {
			successful: true,
			value: value.toUpperCase()
		};
	}
	return {
		successful: true,
		value: value + ''
	};
}
