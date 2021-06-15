import atomize from '../dataTypes/atomize';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { DONE_TOKEN, ready } from '../util/iterators';
import { performFunctionConversion } from './argumentHelper';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function createValidNumericType(type: ValueType, transformedValue: number) {
	if (isSubtypeOf(type, ValueType.XSINTEGER)) {
		return createAtomicValue(transformedValue, ValueType.XSINTEGER);
	}
	if (isSubtypeOf(type, ValueType.XSFLOAT)) {
		return createAtomicValue(transformedValue, ValueType.XSFLOAT);
	}
	if (isSubtypeOf(type, ValueType.XSDOUBLE)) {
		return createAtomicValue(transformedValue, ValueType.XSDOUBLE);
	}
	// It must be a decimal, only four numeric types
	return createAtomicValue(transformedValue, ValueType.XSDECIMAL);
}

const fnAbs: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createValidNumericType(onlyValue.type, Math.abs(onlyValue.value))
	);
};

const fnCeiling: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createValidNumericType(onlyValue.type, Math.ceil(onlyValue.value))
	);
};

const fnFloor: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createValidNumericType(onlyValue.type, Math.floor(onlyValue.value))
	);
};

function isHalf(value: number, scaling: number) {
	return ((value * scaling) % 1) % 0.5 === 0;
}

function getNumberOfDecimalDigits(value: number) {
	if (Math.floor(value) === value || isNaN(value)) {
		return 0;
	}

	const result = /\d+(?:\.(\d*))?(?:[Ee](-)?(\d+))*/.exec(value + '');
	const decimals = result[1] ? result[1].length : 0;

	if (result[3]) {
		if (result[2]) {
			return decimals + parseInt(result[3], 10);
		}
		const returnVal = decimals - parseInt(result[3], 10);
		return returnVal < 0 ? 0 : returnVal;
	}
	return decimals;
}

function determineRoundedNumber(itemAsDecimal: number, halfToEven: boolean, scaling: number) {
	if (halfToEven && isHalf(itemAsDecimal, scaling)) {
		if (Math.floor(itemAsDecimal * scaling) % 2 === 0) {
			return Math.floor(itemAsDecimal * scaling) / scaling;
		}
		return Math.ceil(itemAsDecimal * scaling) / scaling;
	}
	return Math.round(itemAsDecimal * scaling) / scaling;
}

function fnRound(
	halfToEven: boolean,
	_dynamicContext: DynamicContext,
	_executionParameters: ExecutionParameters,
	_staticContext: StaticContext,
	sequence: ISequence,
	precision: ISequence
): ISequence {
	let done = false;
	return sequenceFactory.create({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const firstValue = sequence.first();
			if (!firstValue) {
				// Empty sequence
				done = true;
				return DONE_TOKEN;
			}

			if (
				(isSubtypeOf(firstValue.type, ValueType.XSFLOAT) ||
					isSubtypeOf(firstValue.type, ValueType.XSDOUBLE)) &&
				(firstValue.value === 0 ||
					isNaN(firstValue.value as number) ||
					firstValue.value === +Infinity ||
					firstValue.value === -Infinity)
			) {
				done = true;
				return ready(firstValue);
			}
			let scalingPrecision;
			if (precision) {
				const sp = precision.first();
				scalingPrecision = sp.value;
			} else {
				scalingPrecision = 0;
			}
			done = true;

			if (getNumberOfDecimalDigits(firstValue.value as number) < scalingPrecision) {
				return ready(firstValue);
			}

			const originalType = [
				ValueType.XSINTEGER,
				ValueType.XSDECIMAL,
				ValueType.XSDOUBLE,
				ValueType.XSFLOAT,
			].find((type: ValueType) => {
				return isSubtypeOf(firstValue.type, type);
			});
			const itemAsDecimal = castToType(firstValue, ValueType.XSDECIMAL);
			const scaling = Math.pow(10, scalingPrecision);
			const roundedNumber = determineRoundedNumber(itemAsDecimal.value, halfToEven, scaling);
			switch (originalType) {
				case ValueType.XSDECIMAL:
					return ready(createAtomicValue(roundedNumber, ValueType.XSDECIMAL));
				case ValueType.XSDOUBLE:
					return ready(createAtomicValue(roundedNumber, ValueType.XSDOUBLE));
				case ValueType.XSFLOAT:
					return ready(createAtomicValue(roundedNumber, ValueType.XSFLOAT));
				case ValueType.XSINTEGER:
					return ready(createAtomicValue(roundedNumber, ValueType.XSINTEGER));
			}
		},
	});
}

const fnNumber: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) => {
	return atomize(sequence, executionParameters).switchCases({
		empty: () => sequenceFactory.singleton(createAtomicValue(NaN, ValueType.XSDOUBLE)),
		singleton: () => {
			const castResult = tryCastToType(sequence.first(), ValueType.XSDOUBLE);
			if (castResult.successful) {
				return sequenceFactory.singleton(castResult.value);
			}
			return sequenceFactory.singleton(createAtomicValue(NaN, ValueType.XSDOUBLE));
		},
		multiple: () => {
			throw new Error('fn:number may only be called with zero or one values');
		},
	});
};

const returnRandomItemFromSequence: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const sequenceValue = sequence.getAllValues();
	const index = Math.floor(Math.random() * sequenceValue.length);
	return sequenceFactory.singleton(sequenceValue[index]);
};

const fnRandomNumberGenerator: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	_sequence
) => {
	// Ignore the optional seed, as Math.random does not support a seed
	return sequenceFactory.singleton(
		new MapValue([
			{
				key: createAtomicValue('number', ValueType.XSSTRING),
				value: () =>
					sequenceFactory.singleton(createAtomicValue(Math.random(), ValueType.XSDOUBLE)),
			},
			{
				key: createAtomicValue('next', ValueType.XSSTRING),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: fnRandomNumberGenerator,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [],
							arity: 0,
							returnType: {
								type: ValueType.MAP,
								mult: SequenceMultiplicity.EXACTLY_ONE,
							},
						})
					),
			},
			{
				key: createAtomicValue('permute', ValueType.XSSTRING),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: returnRandomItemFromSequence,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [
								{
									type: ValueType.ITEM,
									mult: SequenceMultiplicity.ZERO_OR_MORE,
								},
							],
							arity: 1,
							returnType: {
								type: ValueType.ITEM,
								mult: SequenceMultiplicity.ZERO_OR_MORE,
							},
						})
					),
			},
		])
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'abs',
		argumentTypes: [{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnAbs,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'ceiling',
		argumentTypes: [{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnCeiling,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'floor',
		argumentTypes: [{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnFloor,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'round',
		argumentTypes: [{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, false),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'round',
		argumentTypes: [
			{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, false),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'round-half-to-even',
		argumentTypes: [{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, true),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'round-half-to-even',
		argumentTypes: [
			{ type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSNUMERIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, true),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'number',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnNumber,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'number',
		argumentTypes: [],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: (dynamicContext, executionParameters, staticContext) => {
			const atomizedContextItem =
				dynamicContext.contextItem &&
				performFunctionConversion(
					{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
					sequenceFactory.singleton(dynamicContext.contextItem),
					executionParameters,
					'fn:number',
					false
				);
			if (!atomizedContextItem) {
				throw new Error('XPDY0002: fn:number needs an atomizable context item.');
			}
			return fnNumber(
				dynamicContext,
				executionParameters,
				staticContext,
				atomizedContextItem
			);
		},
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'random-number-generator',
		argumentTypes: [],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnRandomNumberGenerator,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'random-number-generator',
		argumentTypes: [
			{
				type: ValueType.XSANYATOMICTYPE,
				mult: SequenceMultiplicity.ZERO_OR_ONE,
			},
		],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: () => {
			throw new Error('Not implemented: Specifying a seed is not supported');
		},
	},
];

export default {
	declarations,
	functions: {
		number: fnNumber,
		round: fnRound,
	},
};
