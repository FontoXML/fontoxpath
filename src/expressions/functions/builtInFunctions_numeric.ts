import atomize from '../dataTypes/atomize';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType, SequenceType, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { DONE_TOKEN, ready } from '../util/iterators';
import { performFunctionConversion } from './argumentHelper';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function createValidNumericType(type: ValueType, transformedValue: number) {
	if (isSubtypeOf(type, { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE })) {
		return createAtomicValue(transformedValue, {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		});
	}
	if (isSubtypeOf(type, { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE })) {
		return createAtomicValue(transformedValue, {
			kind: BaseType.XSFLOAT,
			seqType: SequenceType.EXACTLY_ONE,
		});
	}
	if (isSubtypeOf(type, { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE })) {
		return createAtomicValue(transformedValue, {
			kind: BaseType.XSDOUBLE,
			seqType: SequenceType.EXACTLY_ONE,
		});
	}
	// It must be a decimal, only four numeric types
	return createAtomicValue(transformedValue, {
		kind: BaseType.XSDECIMAL,
		seqType: SequenceType.EXACTLY_ONE,
	});
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
				(isSubtypeOf(firstValue.type, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				}) ||
					isSubtypeOf(firstValue.type, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					})) &&
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
				{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
				{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE },
				{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE },
				{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE },
			].find((type: ValueType) => {
				return isSubtypeOf(firstValue.type, type);
			});
			const itemAsDecimal = castToType(firstValue, {
				kind: BaseType.XSDECIMAL,
				seqType: SequenceType.EXACTLY_ONE,
			});
			const scaling = Math.pow(10, scalingPrecision);
			const roundedNumber = determineRoundedNumber(itemAsDecimal.value, halfToEven, scaling);
			switch (originalType.kind) {
				case BaseType.XSDECIMAL:
					return ready(
						createAtomicValue(roundedNumber, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						})
					);
				case BaseType.XSDOUBLE:
					return ready(
						createAtomicValue(roundedNumber, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						})
					);
				case BaseType.XSFLOAT:
					return ready(
						createAtomicValue(roundedNumber, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						})
					);
				case BaseType.XSINTEGER:
					return ready(
						createAtomicValue(roundedNumber, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						})
					);
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
		empty: () =>
			sequenceFactory.singleton(
				createAtomicValue(NaN, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			),
		singleton: () => {
			const castResult = tryCastToType(sequence.first(), {
				kind: BaseType.XSDOUBLE,
				seqType: SequenceType.EXACTLY_ONE,
			});
			if (castResult.successful) {
				return sequenceFactory.singleton(castResult.value);
			}
			return sequenceFactory.singleton(
				createAtomicValue(NaN, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			);
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
				key: createAtomicValue('number', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				}),
				value: () =>
					sequenceFactory.singleton(
						createAtomicValue(Math.random(), {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						})
					),
			},
			{
				key: createAtomicValue('next', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				}),
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
								kind: BaseType.MAP,
								items: [],
								seqType: SequenceType.EXACTLY_ONE,
							},
						})
					),
			},
			{
				key: createAtomicValue('permute', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				}),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: returnRandomItemFromSequence,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [
								{ kind: BaseType.ITEM, occurrence: SequenceType.ZERO_OR_MORE },
							],
							arity: 1,
							returnType: {
								kind: BaseType.ITEM,
								occurrence: SequenceType.ZERO_OR_MORE,
							},
						})
					),
			},
		])
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'abs',
		argumentTypes: [{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnAbs,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'ceiling',
		argumentTypes: [{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnCeiling,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'floor',
		argumentTypes: [{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnFloor,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'round',
		argumentTypes: [{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, false),
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'round',
		argumentTypes: [
			{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
			{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, false),
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'round-half-to-even',
		argumentTypes: [{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, true),
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'round-half-to-even',
		argumentTypes: [
			{ kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
			{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSNUMERIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnRound.bind(null, true),
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'number',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnNumber,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'number',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE },
		callFunction: (dynamicContext, executionParameters, staticContext) => {
			const atomizedContextItem =
				dynamicContext.contextItem &&
				performFunctionConversion(
					{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE },
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
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'random-number-generator',
		argumentTypes: [],
		returnType: { kind: BaseType.MAP, items: [], seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnRandomNumberGenerator,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'random-number-generator',
		argumentTypes: [
			{
				kind: BaseType.XSANYATOMICTYPE,
				seqType: SequenceType.ZERO_OR_ONE,
			},
		],
		returnType: { kind: BaseType.MAP, items: [], seqType: SequenceType.EXACTLY_ONE },
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
