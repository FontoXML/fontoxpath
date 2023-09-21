import { ValueType } from '../Value';
import CastResult from './CastResult';

const numericTypes = [
	ValueType.XSDOUBLE,
	ValueType.XSFLOAT,
	ValueType.XSDECIMAL,
	ValueType.XSINTEGER,
];

export default function castToNumeric(
	inputType: ValueType,
	castToPrimitiveType: (
		inputType: ValueType,
		outputType: ValueType,
	) => (value: any) => CastResult,
): (value: any) => CastResult {
	return (value) => {
		for (const outputType of numericTypes) {
			const result = castToPrimitiveType(inputType, outputType)(value);
			if (result.successful) {
				return result;
			}
		}
		// In the case of failure, return the result of the last attempt
		return {
			successful: false,
			error: new Error(
				`XPTY0004: Casting not supported from "${value}" given type to xs:numeric or any of its derived types.`,
			),
		};
	};
}
