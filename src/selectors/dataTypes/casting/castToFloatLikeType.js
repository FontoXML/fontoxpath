/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToFloatLikeType (instanceOf, to) {
	if (instanceOf('xs:numeric')) {
		return value => ({
			successful: true,
			value: value
		});
	}
	if (instanceOf('xs:boolean')) {
		return value => ({
			successful: true,
			value: value ? 1 : 0
		});
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return value => {
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
		};
	}
	return () => ({
		successful: false,
		error: new Error(`XPTY0004: Casting not supported from given type to ${to} or any of its derived types.`)
	});
}
