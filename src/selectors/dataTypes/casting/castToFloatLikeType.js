/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: number}|{successful: boolean, error: !Error}}
 */
export default function castToFloatLikeType (value, instanceOf, to) {
	if (instanceOf('xs:numeric')) {
		return {
			successful: true,
			value: value
		};
	}
	if (instanceOf('xs:boolean')) {
		return {
			successful: true,
			value: value ? 1 : 0
		};
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		switch (value) {
			case 'NaN':
				return {
					successful: true,
					value: NaN
				};
			case 'INF':
			case '+INF':
				return {
					successful: true,
					value: Infinity
				};
			case '-INF':
				return {
					successful: true,
					value: -Infinity
				};
			case '0':
			case '+0':
				return {
					successful: true,
					value: 0
				};
			case '-0':
				return {
					successful: true,
					value: -0
				};
		}
		const floatValue = parseFloat(value);
		if (!isNaN(floatValue)) {
			return {
				successful: true,
				value: floatValue
			};
		}
		return {
			successful: false,
			error: new Error(`FORG0001: Cannot cast "${value}" to ${to}.`)
		};
	}
	return {
		successful: false,
		error: new Error(`XPTY0004: Casting not supported from given type to ${to} or any of its derived types.`)
	};
}
