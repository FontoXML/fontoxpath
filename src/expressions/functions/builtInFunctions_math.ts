import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType } from '../dataTypes/Value';

import { MATH_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

const mathPi: FunctionDefinitionType = (_dynamicContext, _executionParameters, _staticContext) => {
	return sequenceFactory.singleton(createAtomicValue(Math.PI, { kind: BaseType.XSDOUBLE }));
};

const mathExp: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.pow(Math.E, onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathExp10: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.pow(10, onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathLog: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.log(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathLog10: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.log10(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathPow: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	base,
	exponent
) => {
	// Note: base is double?, exponent is numeric. In the base is empty case, return empty.
	return exponent.mapAll(([valueY]) =>
		base.map((valueX) => {
			// isFinite is false for +Infinity, -Infinity and NaN
			if (Math.abs(valueX.value) === 1 && !Number.isFinite(valueY.value)) {
				return createAtomicValue(1, { kind: BaseType.XSDOUBLE });
			}
			return createAtomicValue(Math.pow(valueX.value, valueY.value), {
				kind: BaseType.XSDOUBLE,
			});
		})
	);
};

const mathSqrt: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.sqrt(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathSin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.sin(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathCos: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.cos(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathTan: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.tan(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathAsin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.asin(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathAcos: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.acos(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathAtan: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.atan(onlyValue.value), { kind: BaseType.XSDOUBLE })
	);
};

const mathAtan2: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	x,
	y
) => {
	// Note that x is the double? argument, y is double.
	return y.mapAll(([onlyYValue]) =>
		x.map((onlyXValue) =>
			createAtomicValue(Math.atan2(onlyXValue.value, onlyYValue.value), {
				kind: BaseType.XSDOUBLE,
			})
		)
	);
};

export default {
	declarations: [
		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'pi',
			argumentTypes: [],
			returnType: { kind: BaseType.XSDOUBLE },
			callFunction: mathPi,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'exp',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathExp,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'exp10',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathExp10,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'log',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathLog,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'log10',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathLog10,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'pow',
			argumentTypes: [
				{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
				{ kind: BaseType.XSNUMERIC },
			],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathPow,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'sqrt',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathSqrt,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'sin',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathSin,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'cos',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathCos,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'tan',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathTan,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'asin',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathAsin,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'acos',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathAcos,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'atan',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathAtan,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'atan2',
			argumentTypes: [
				{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
				{ kind: BaseType.XSDOUBLE },
			],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: mathAtan2,
		},
	],
};
