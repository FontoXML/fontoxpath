import atomize from '../dataTypes/atomize';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { DONE_TOKEN, ready } from '../util/iterators';
import { performFunctionConversion } from './argumentHelper';
import FunctionDefinitionType from './FunctionDefinitionType';

function createValidNumericType(type: ValueType, transformedValue: number) {
	if (isSubtypeOf(type, { kind: BaseType.XSINTEGER })) {
		return createAtomicValue(transformedValue, { kind: BaseType.XSINTEGER });
	}
	if (isSubtypeOf(type, { kind: BaseType.XSFLOAT })) {
		return createAtomicValue(transformedValue, { kind: BaseType.XSFLOAT });
	}
	if (isSubtypeOf(type, { kind: BaseType.XSDOUBLE })) {
		return createAtomicValue(transformedValue, { kind: BaseType.XSDOUBLE });
	}
	// It must be a decimal, only four numeric types
	return createAtomicValue(transformedValue, { kind: BaseType.XSDECIMAL });
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
				(isSubtypeOf(firstValue.type, { kind: BaseType.XSFLOAT }) ||
					isSubtypeOf(firstValue.type, { kind: BaseType.XSDOUBLE })) &&
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
				{ kind: BaseType.XSINTEGER },
				{ kind: BaseType.XSDECIMAL },
				{ kind: BaseType.XSDOUBLE },
				{ kind: BaseType.XSFLOAT },
			].find((type: ValueType) => {
				return isSubtypeOf(firstValue.type, type);
			});
			const itemAsDecimal = castToType(firstValue, { kind: BaseType.XSDECIMAL });
			const scaling = Math.pow(10, scalingPrecision);
			const roundedNumber = determineRoundedNumber(itemAsDecimal.value, halfToEven, scaling);
			switch (originalType) {
				case { kind: BaseType.XSDECIMAL }:
					return ready(createAtomicValue(roundedNumber, { kind: BaseType.XSDECIMAL }));
				case { kind: BaseType.XSDOUBLE }:
					return ready(createAtomicValue(roundedNumber, { kind: BaseType.XSDOUBLE }));
				case { kind: BaseType.XSFLOAT }:
					return ready(createAtomicValue(roundedNumber, { kind: BaseType.XSFLOAT }));
				case { kind: BaseType.XSINTEGER }:
					return ready(createAtomicValue(roundedNumber, { kind: BaseType.XSINTEGER }));
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
		empty: () => sequenceFactory.singleton(createAtomicValue(NaN, { kind: BaseType.XSDOUBLE })),
		singleton: () => {
			const castResult = tryCastToType(sequence.first(), { kind: BaseType.XSDOUBLE });
			if (castResult.successful) {
				return sequenceFactory.singleton(castResult.value);
			}
			return sequenceFactory.singleton(createAtomicValue(NaN, { kind: BaseType.XSDOUBLE }));
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
				key: createAtomicValue('number', { kind: BaseType.XSSTRING }),
				value: () =>
					sequenceFactory.singleton(
						createAtomicValue(Math.random(), { kind: BaseType.XSDOUBLE })
					),
			},
			{
				key: createAtomicValue('next', { kind: BaseType.XSSTRING }),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: fnRandomNumberGenerator,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [],
							arity: 0,
							returnType: { kind: BaseType.MAP, items: [] },
						})
					),
			},
			{
				key: createAtomicValue('permute', { kind: BaseType.XSSTRING }),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: returnRandomItemFromSequence,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [
								{
									kind: BaseType.ANY,
									item: { kind: BaseType.ITEM },
								},
							],
							arity: 1,
							returnType: {
								kind: BaseType.ANY,
								item: { kind: BaseType.ITEM },
							},
						})
					),
			},
		])
	);
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'abs',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnAbs,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'ceiling',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnCeiling,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'floor',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnFloor,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnRound.bind(null, false),
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round',
			argumentTypes: ['xs:numeric?', 'xs:integer'],
			returnType: 'xs:numeric?',
			callFunction: fnRound.bind(null, false),
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round-half-to-even',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnRound.bind(null, true),
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round-half-to-even',
			argumentTypes: ['xs:numeric?', 'xs:integer'],
			returnType: 'xs:numeric?',
			callFunction: fnRound.bind(null, true),
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'number',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double',
			callFunction: fnNumber,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'number',
			argumentTypes: [],
			returnType: 'xs:double',
			callFunction: (dynamicContext, executionParameters, staticContext) => {
				const atomizedContextItem =
					dynamicContext.contextItem &&
					performFunctionConversion(
						{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } },
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
			returnType: 'map(*)',
			callFunction: fnRandomNumberGenerator,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'random-number-generator',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'map(*)',
			callFunction: () => {
				throw new Error('Not implemented: Specifying a seed is not supported');
			},
		},
	],
	functions: {
		number: fnNumber,
		round: fnRound,
	},
};
