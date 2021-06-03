import { ValueType } from '../Value';
import CastResult from './CastResult';
import { castToPrimitiveType } from './tryCastToType';

const numericTypes = [
	ValueType.XSDOUBLE,
	ValueType.XSFLOAT,
	ValueType.XSDECIMAL,
	ValueType.XSINTEGER,
];

export default function castToNumeric(): (value: any) => CastResult {
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
