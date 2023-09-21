import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const mathPi: FunctionDefinitionType = (_dynamicContext, _executionParameters, _staticContext) => {
	return sequenceFactory.singleton(createAtomicValue(Math.PI, ValueType.XSDOUBLE));
};

const mathExp: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.pow(Math.E, onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathExp10: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.pow(10, onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathLog: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.log(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathLog10: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.log10(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathPow: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	base,
	exponent,
) => {
	// Note: base is double?, exponent is numeric. In the base is empty case, return empty.
	return exponent.mapAll(([valueY]) =>
		base.map((valueX) => {
			// isFinite is false for +Infinity, -Infinity and NaN
			if (Math.abs(valueX.value) === 1 && !Number.isFinite(valueY.value)) {
				return createAtomicValue(1, ValueType.XSDOUBLE);
			}
			return createAtomicValue(Math.pow(valueX.value, valueY.value), ValueType.XSDOUBLE);
		}),
	);
};

const mathSqrt: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.sqrt(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathSin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.sin(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathCos: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.cos(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathTan: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.tan(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathAsin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.asin(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathAcos: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.acos(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathAtan: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.atan(onlyValue.value), ValueType.XSDOUBLE),
	);
};

const mathAtan2: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	x,
	y,
) => {
	// Note that x is the double? argument, y is double.
	return y.mapAll(([onlyYValue]) =>
		x.map((onlyXValue) =>
			createAtomicValue(Math.atan2(onlyXValue.value, onlyYValue.value), ValueType.XSDOUBLE),
		),
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'pi',
		argumentTypes: [],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: mathPi,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'exp',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathExp,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'exp10',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathExp10,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'log',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathLog,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'log10',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathLog10,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'pow',
		argumentTypes: [
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathPow,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'sqrt',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathSqrt,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'sin',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathSin,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'cos',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathCos,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'tan',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathTan,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'asin',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathAsin,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'acos',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathAcos,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'atan',
		argumentTypes: [{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathAtan,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
		localName: 'atan2',
		argumentTypes: [
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: mathAtan2,
	},
];

export default {
	declarations,
};
