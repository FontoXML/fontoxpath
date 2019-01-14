import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/SequenceFactory';
import zipSingleton from '../util/zipSingleton';

import { DONE_TOKEN, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import builtInNumericFunctions from './builtInFunctions.numeric';

import FunctionDefinitionType from './FunctionDefinitionType';

const fnRound = builtInNumericFunctions.functions.round;

function collationError() {
	throw new Error('FOCH0002: No collations are supported');
}

function contextItemAsFirstArgument(fn, dynamicContext, executionParameters, _staticContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error(
			'XPDY0002: The function which was called depends on dynamic context, which is absent.'
		);
	}
	return fn(
		dynamicContext,
		executionParameters,
		_staticContext,
		SequenceFactory.singleton(dynamicContext.contextItem)
	);
}

const fnCompare: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) {
	if (arg1.isEmpty() || arg2.isEmpty()) {
		return SequenceFactory.empty();
	}

	const arg1Value = arg1.first().value,
		arg2Value = arg2.first().value;

	if (arg1Value > arg2Value) {
		return SequenceFactory.singleton(createAtomicValue(1, 'xs:integer'));
	}

	if (arg1Value < arg2Value) {
		return SequenceFactory.singleton(createAtomicValue(-1, 'xs:integer'));
	}

	return SequenceFactory.singleton(createAtomicValue(0, 'xs:integer'));
};

const fnConcat: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext
) {
	let stringSequences = Array.from(arguments).slice(3);
	stringSequences = stringSequences.map(function(sequence) {
		return sequence.atomize(executionParameters);
	});
	return zipSingleton(stringSequences, function(stringValues) {
		return SequenceFactory.singleton(
			createAtomicValue(
				stringValues
					.map(stringValue =>
						stringValue === null ? '' : castToType(stringValue, 'xs:string').value
					)
					.join(''),
				'xs:string'
			)
		);
	});
};

const fnContains: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) {
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	const contains = !arg2.isEmpty() ? arg2.first().value : '';
	if (contains.length === 0) {
		return SequenceFactory.singletonTrueSequence();
	}

	if (stringToTest.length === 0) {
		return SequenceFactory.singletonFalseSequence();
	}

	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.includes(contains)) {
		return SequenceFactory.singletonTrueSequence();
	}
	return SequenceFactory.singletonFalseSequence();
};

const fnStartsWith: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) {
	const startsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (startsWith.length === 0) {
		return SequenceFactory.singletonTrueSequence();
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return SequenceFactory.singletonFalseSequence();
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.startsWith(startsWith)) {
		return SequenceFactory.singletonTrueSequence();
	}
	return SequenceFactory.singletonFalseSequence();
};

const fnEndsWith: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) {
	const endsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (endsWith.length === 0) {
		return SequenceFactory.singletonTrueSequence();
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return SequenceFactory.singletonFalseSequence();
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.endsWith(endsWith)) {
		return SequenceFactory.singletonTrueSequence();
	}
	return SequenceFactory.singletonFalseSequence();
};

const fnString: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) {
	return sequence.switchCases({
		empty: () => SequenceFactory.singleton(createAtomicValue('', 'xs:string')),
		default: () =>
			sequence.map(value => {
				if (isSubtypeOf(value.type, 'node()')) {
					const stringValue = atomize(value, executionParameters);
					if (isSubtypeOf(value.type, 'attribute()')) {
						return castToType(stringValue, 'xs:string');
					}
					return stringValue;
				}
				return castToType(value, 'xs:string');
			})
	});
};

const fnStringJoin: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	separator
) {
	return zipSingleton([separator], ([separatorString]) =>
		sequence.mapAll(allStrings => {
			const joinedString = allStrings
				.map(stringValue => castToType(stringValue, 'xs:string').value)
				.join(separatorString.value);
			return SequenceFactory.singleton(createAtomicValue(joinedString, 'xs:string'));
		})
	);
};

const fnStringLength: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return SequenceFactory.singleton(createAtomicValue(0, 'xs:integer'));
	}
	const stringValue = /** @type {string} */ (sequence.first().value);
	// In ES6, Array.from(💩).length === 1
	return SequenceFactory.singleton(
		createAtomicValue(Array.from(stringValue).length, 'xs:integer')
	);
};

const fnSubstringBefore: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) {
	let strArg1;
	if (arg1.isEmpty()) {
		strArg1 = '';
	} else {
		strArg1 = arg1.first().value;
	}
	let strArg2;
	if (arg2.isEmpty()) {
		strArg2 = '';
	} else {
		strArg2 = arg2.first().value;
	}

	if (strArg2 === '') {
		return SequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return SequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return SequenceFactory.singleton(
		createAtomicValue(strArg1.substring(0, startIndex), 'xs:string')
	);
};

const fnSubstringAfter: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) {
	let strArg1;
	if (arg1.isEmpty()) {
		strArg1 = '';
	} else {
		strArg1 = arg1.first().value;
	}
	let strArg2;
	if (arg2.isEmpty()) {
		strArg2 = '';
	} else {
		strArg2 = arg2.first().value;
	}

	if (strArg2 === '') {
		return SequenceFactory.singleton(createAtomicValue(strArg1, 'xs:string'));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return SequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return SequenceFactory.singleton(
		createAtomicValue(strArg1.substring(startIndex + strArg2.length), 'xs:string')
	);
};

const fnSubstring: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	sourceString,
	start,
	length
) {
	const roundedStart = fnRound(
		false,
		dynamicContext,
		executionParameters,
		staticContext,
		start,
		null
	);
	const roundedLength =
		length !== null
			? fnRound(false, dynamicContext, executionParameters, staticContext, length, null)
			: null;

	let done = false;
	let sourceStringItem = null;
	let startItem = null;
	let lengthItem = null;
	return SequenceFactory.create({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			if (!sourceStringItem) {
				sourceStringItem = sourceString.tryGetFirst();
				if (!sourceStringItem.ready) {
					sourceStringItem = null;
					return sourceStringItem;
				}

				if (sourceStringItem.value === null) {
					// The first argument can be the empty sequence
					done = true;
					return ready(createAtomicValue('', 'xs:string'));
				}
			}

			if (!startItem) {
				startItem = roundedStart.tryGetFirst();
				if (!startItem.ready) {
					const toReturn = startItem;
					startItem = null;
					return toReturn;
				}
			}

			if (!lengthItem && length) {
				lengthItem = null;
				lengthItem = roundedLength.tryGetFirst();
				if (!lengthItem.ready) {
					const toReturn = lengthItem;
					lengthItem = null;
					return toReturn;
				}
			}

			done = true;

			const strValue = /** @type {string} */ (sourceStringItem.value.value);
			return ready(
				createAtomicValue(
					Array.from(strValue)
						.slice(
							Math.max(startItem.value.value - 1, 0),
							length ? startItem.value.value + lengthItem.value.value - 1 : undefined
						)
						.join(''),
					'xs:string'
				)
			);
		}
	});
};

const fnTokenize: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	input,
	pattern
) {
	if (input.isEmpty() || input.first().value.length === 0) {
		return SequenceFactory.empty();
	}
	const string = input.first().value,
		patternString = pattern.first().value;
	return SequenceFactory.create(
		string.split(new RegExp(patternString)).map(function(token) {
			return createAtomicValue(token, 'xs:string');
		})
	);
};

const fnUpperCase: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence
) {
	if (stringSequence.isEmpty()) {
		return SequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return stringSequence.map(string => createAtomicValue(string.value.toUpperCase(), 'xs:string'));
};

const fnLowerCase: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence
) {
	if (stringSequence.isEmpty()) {
		return SequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return stringSequence.map(string => createAtomicValue(string.value.toLowerCase(), 'xs:string'));
};

const fnNormalizeSpace: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) {
	if (arg.isEmpty()) {
		return SequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	const string = arg.first().value.trim();
	return SequenceFactory.singleton(createAtomicValue(string.replace(/\s+/g, ' '), 'xs:string'));
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'compare',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:integer?',
			callFunction: fnCompare
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'compare',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:integer?',
			callFunction: collationError
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'concat',
			argumentTypes: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
			returnType: 'xs:string',
			callFunction: fnConcat
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'contains',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: collationError
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'contains',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnContains
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnEndsWith
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: collationError
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'normalize-space',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnNormalizeSpace
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'normalize-space',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(
				null,
				(dynamicContext, executionParameters, staticContext, contextItem) =>
					fnNormalizeSpace(
						dynamicContext,
						executionParameters,
						staticContext,
						fnString(dynamicContext, executionParameters, staticContext, contextItem)
					)
			)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnStartsWith
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: collationError
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string',
			argumentTypes: ['item()?'],
			returnType: 'xs:string',
			callFunction: fnString
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnString)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring-before',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:string',
			callFunction: fnSubstringBefore
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring-after',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:string',
			callFunction: fnSubstringAfter
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-join',
			argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
			returnType: 'xs:string',
			callFunction: fnStringJoin
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring',
			argumentTypes: ['xs:string?', 'xs:double'],
			returnType: 'xs:string',
			callFunction: fnSubstring
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring',
			argumentTypes: ['xs:string?', 'xs:double', 'xs:double'],
			returnType: 'xs:string',
			callFunction: fnSubstring
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'upper-case',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnUpperCase
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'lower-case',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnLowerCase
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-join',
			argumentTypes: ['xs:string*'],
			returnType: 'xs:string',
			callFunction(dynamicContext, executionParameters, staticContext, arg1) {
				return fnStringJoin(
					dynamicContext,
					executionParameters,
					staticContext,
					arg1,
					SequenceFactory.singleton(createAtomicValue('', 'xs:string'))
				);
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-length',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:integer',
			callFunction: fnStringLength
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-length',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: contextItemAsFirstArgument.bind(
				null,
				(dynamicContext, executionParameters, staticContext, contextItem) =>
					fnStringLength(
						dynamicContext,
						executionParameters,
						staticContext,
						fnString(dynamicContext, executionParameters, staticContext, contextItem)
					)
			)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string', 'xs:string'],
			returnType: 'xs:string*',
			callFunction(
				_dynamicContext,
				_executionParameters,
				_staticContext,
				_input,
				_pattern,
				_flags
			) {
				throw new Error('Not implemented: Using flags in tokenize is not supported');
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string'],
			returnType: 'xs:string*',
			callFunction: fnTokenize
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'tokenize',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string*',
			callFunction(dynamicContext, executionParameters, staticContext, input) {
				return fnTokenize(
					dynamicContext,
					executionParameters,
					staticContext,
					fnNormalizeSpace(dynamicContext, executionParameters, staticContext, input),
					SequenceFactory.singleton(createAtomicValue(' ', 'xs:string'))
				);
			}
		}
	],
	functions: {
		concat: fnConcat,
		endsWith: fnEndsWith,
		normalizeSpace: fnNormalizeSpace,
		startsWith: fnStartsWith,
		string: fnString,
		stringJoin: fnStringJoin,
		stringLength: fnStringLength,
		tokenize: fnTokenize
	}
};
