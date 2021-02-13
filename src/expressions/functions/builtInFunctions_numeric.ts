import atomize from '../dataTypes/atomize';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';
import { performFunctionConversion } from './argumentHelper';
import FunctionDefinitionType from './FunctionDefinitionType';

function createValidNumericType(type: ValueType, transformedValue: number) {
	if (isSubtypeOf(type, 'xs:integer')) {
		return createAtomicValue(transformedValue, 'xs:integer');
	}
	if (isSubtypeOf(type, 'xs:float')) {
		return createAtomicValue(transformedValue, 'xs:float');
	}
	if (isSubtypeOf(type, 'xs:double')) {
		return createAtomicValue(transformedValue, 'xs:double');
	}
	// It must be a decimal, only four numeric types
	return createAtomicValue(transformedValue, 'xs:decimal');
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

	const result = /\d+(?:\.(\d*))?(?:[Ee](-)?(\d+))*/.exec(value + ''),
		decimals = result[1] ? result[1].length : 0;

	if (result[3]) {
		if (result[2]) {
			return decimals + parseInt(result[3], 10);
		}
		const returnVal = decimals - parseInt(result[3], 10);
		return returnVal < 0 ? 0 : returnVal;
	}
	return decimals;
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
			const firstValue = sequence.tryGetFirst();
			if (!firstValue.ready) {
				return notReady(firstValue.promise);
			}
			if (!firstValue.value) {
				// Empty sequence
				done = true;
				return DONE_TOKEN;
			}

			const item = firstValue.value;
			const value = item.value;

			if (
				(isSubtypeOf(item.type, 'xs:float') || isSubtypeOf(item.type, 'xs:double')) &&
				(value === 0 || isNaN(value) || value === +Infinity || value === -Infinity)
			) {
				done = true;
				return ready(item);
			}
			let scalingPrecision;
			if (precision) {
				const sp = precision.tryGetFirst();
				if (!sp.ready) {
					return notReady(sp.promise);
				}
				scalingPrecision = sp.value.value;
			} else {
				scalingPrecision = 0;
			}
			done = true;

			if (getNumberOfDecimalDigits(value) < scalingPrecision) {
				return ready(item);
			}

			const originalType = ['xs:integer', 'xs:decimal', 'xs:double', 'xs:float'].find(
				(type: ValueType) => {
					return isSubtypeOf(item.type, type);
				}
			);
			const itemAsDecimal = castToType(item, 'xs:decimal');
			const scaling = Math.pow(10, scalingPrecision);
			let roundedNumber = 0;

			if (halfToEven && isHalf(itemAsDecimal.value, scaling)) {
				if (Math.floor(itemAsDecimal.value * scaling) % 2 === 0) {
					roundedNumber = Math.floor(itemAsDecimal.value * scaling) / scaling;
				} else {
					roundedNumber = Math.ceil(itemAsDecimal.value * scaling) / scaling;
				}
			} else {
				roundedNumber = Math.round(itemAsDecimal.value * scaling) / scaling;
			}

			switch (originalType) {
				case 'xs:decimal':
					return ready(createAtomicValue(roundedNumber, 'xs:decimal'));
				case 'xs:double':
					return ready(createAtomicValue(roundedNumber, 'xs:double'));
				case 'xs:float':
					return ready(createAtomicValue(roundedNumber, 'xs:float'));
				case 'xs:integer':
					return ready(createAtomicValue(roundedNumber, 'xs:integer'));
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
		empty: () => sequenceFactory.singleton(createAtomicValue(NaN, 'xs:double')),
		singleton: () => {
			const castResult = tryCastToType(sequence.first(), 'xs:double');
			if (castResult.successful) {
				return sequenceFactory.singleton(castResult.value);
			}
			return sequenceFactory.singleton(createAtomicValue(NaN, 'xs:double'));
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
				key: createAtomicValue('number', 'xs:string'),
				value: () =>
					sequenceFactory.singleton(createAtomicValue(Math.random(), 'xs:double')),
			},
			{
				key: createAtomicValue('next', 'xs:string'),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: fnRandomNumberGenerator,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [],
							arity: 0,
							returnType: { type: 'map(*)', occurrence: null },
						})
					),
			},
			{
				key: createAtomicValue('permute', 'xs:string'),
				value: () =>
					sequenceFactory.singleton(
						new FunctionValue({
							value: returnRandomItemFromSequence,
							isAnonymous: true,
							localName: '',
							namespaceURI: '',
							argumentTypes: [{ type: 'item()', occurrence: '*' }],
							arity: 1,
							returnType: { type: 'item()', occurrence: '*' },
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
						{ type: 'xs:anyAtomicType', occurrence: '?' },
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
