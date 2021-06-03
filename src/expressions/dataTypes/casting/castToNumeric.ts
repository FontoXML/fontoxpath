import { ValueType } from '../Value';
import CastResult from './CastResult';

const numericTypes = [
	ValueType.XSDOUBLE,
	ValueType.XSFLOAT,
	ValueType.XSDECIMAL,
	ValueType.XSINTEGER,
];

export default function castToNumeric(
	castToPrimitiveType: (_value: any, _type: ValueType) => (value: any) => CastResult
): (value: any) => CastResult {
	return (value) => {
		for (const type of numericTypes) {
			const result = castToPrimitiveType(value, type)(value);
			if (result.successful) {
				return result;
			}
		}
		return undefined;
	};
}
