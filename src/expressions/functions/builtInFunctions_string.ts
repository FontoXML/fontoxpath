import { compile, MatchFn } from 'xspattern';
import atomize, { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { DONE_TOKEN, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import builtInNumericFunctions from './builtInFunctions_numeric';
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
		sequenceFactory.singleton(dynamicContext.contextItem)
	);
}

const fnCompare: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) => {
	if (arg1.isEmpty() || arg2.isEmpty()) {
		return sequenceFactory.empty();
	}

	const arg1Value = arg1.first().value;
	const arg2Value = arg2.first().value;

	if (arg1Value > arg2Value) {
		return sequenceFactory.singleton(createAtomicValue(1, 'xs:integer'));
	}

	if (arg1Value < arg2Value) {
		return sequenceFactory.singleton(createAtomicValue(-1, 'xs:integer'));
	}

	return sequenceFactory.singleton(createAtomicValue(0, 'xs:integer'));
};

const fnConcat: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	...stringSequences: ISequence[]
) => {
	stringSequences = stringSequences.map((sequence) => {
		return atomize(sequence, executionParameters).mapAll((allValues) => {
			return sequenceFactory.singleton(
				createAtomicValue(
					allValues
						.map((stringValue) =>
							stringValue === null ? '' : castToType(stringValue, 'xs:string').value
						)
						.join(''),
					'xs:string'
				)
			);
		});
	});

	return zipSingleton(stringSequences, (stringValues) => {
		return sequenceFactory.singleton(
			createAtomicValue(
				stringValues.map((stringValue) => stringValue.value).join(''),
				'xs:string'
			)
		);
	});
};

const fnContains: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) => {
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	const contains = !arg2.isEmpty() ? arg2.first().value : '';
	if (contains.length === 0) {
		return sequenceFactory.singletonTrueSequence();
	}

	if (stringToTest.length === 0) {
		return sequenceFactory.singletonFalseSequence();
	}

	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.includes(contains)) {
		return sequenceFactory.singletonTrueSequence();
	}
	return sequenceFactory.singletonFalseSequence();
};

const fnStartsWith: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) => {
	const startsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (startsWith.length === 0) {
		return sequenceFactory.singletonTrueSequence();
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return sequenceFactory.singletonFalseSequence();
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.startsWith(startsWith)) {
		return sequenceFactory.singletonTrueSequence();
	}
	return sequenceFactory.singletonFalseSequence();
};

const fnEndsWith: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) => {
	const endsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (endsWith.length === 0) {
		return sequenceFactory.singletonTrueSequence();
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return sequenceFactory.singletonFalseSequence();
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.endsWith(endsWith)) {
		return sequenceFactory.singletonTrueSequence();
	}
	return sequenceFactory.singletonFalseSequence();
};

const fnString: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.switchCases({
		empty: () => sequenceFactory.singleton(createAtomicValue('', 'xs:string')),
		default: () =>
			sequence.map((value) => {
				if (isSubtypeOf(value.type, 'node()')) {
					const stringValueSequence = atomizeSingleValue(value, executionParameters);
					// Assume here that a node always atomizes to a singlevalue. This will not work
					// anymore when schema support will be imlemented.
					const stringValue = stringValueSequence.first();
					if (isSubtypeOf(value.type, 'attribute()')) {
						return castToType(stringValue, 'xs:string');
					}
					return stringValue;
				}
				return castToType(value, 'xs:string');
			}),
	});
};

const fnStringJoin: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
	separator
) => {
	return zipSingleton([separator], ([separatorString]) =>
		atomize(sequence, executionParameters).mapAll((allStrings) => {
			const joinedString = allStrings
				.map((stringValue) => castToType(stringValue, 'xs:string').value)
				.join(separatorString.value);
			return sequenceFactory.singleton(createAtomicValue(joinedString, 'xs:string'));
		})
	);
};

const fnStringLength: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue(0, 'xs:integer'));
	}
	const stringValue = sequence.first().value;
	// In ES6, Array.from(💩).length === 1
	return sequenceFactory.singleton(
		createAtomicValue(Array.from(stringValue).length, 'xs:integer')
	);
};

const fnSubstringBefore: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) => {
	const strArg1 = arg1.isEmpty() ? '' : arg1.first().value;

	const strArg2 = arg2.isEmpty() ? '' : arg2.first().value;

	if (strArg2 === '') {
		return sequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return sequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return sequenceFactory.singleton(
		createAtomicValue(strArg1.substring(0, startIndex), 'xs:string')
	);
};

const fnSubstringAfter: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2
) => {
	const strArg1 = arg1.isEmpty() ? '' : arg1.first().value;

	const strArg2 = arg2.isEmpty() ? '' : arg2.first().value;

	if (strArg2 === '') {
		return sequenceFactory.singleton(createAtomicValue(strArg1, 'xs:string'));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return sequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return sequenceFactory.singleton(
		createAtomicValue(strArg1.substring(startIndex + strArg2.length), 'xs:string')
	);
};

const fnSubstring: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sourceString,
	start,
	length
) => {
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
	let sourceStringItem: Value = null;
	let startItem: Value = null;
	let lengthItem: Value = null;
	return sequenceFactory.create({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			if (!sourceStringItem) {
				sourceStringItem = sourceString.first();

				if (sourceStringItem === null) {
					// The first argument can be the empty sequence
					done = true;
					return ready(createAtomicValue('', 'xs:string'));
				}
			}

			if (!startItem) {
				startItem = roundedStart.first();
			}

			if (!lengthItem && length) {
				lengthItem = null;
				lengthItem = roundedLength.first();
			}

			done = true;

			const strValue = sourceStringItem.value as string;
			return ready(
				createAtomicValue(
					Array.from(strValue)
						.slice(
							Math.max((startItem.value as number) - 1, 0),
							length
								? (startItem.value as number) + (lengthItem.value as number) - 1
								: undefined
						)
						.join(''),
					'xs:string'
				)
			);
		},
	});
};

const fnTokenize: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	input,
	pattern
) => {
	if (input.isEmpty() || input.first().value.length === 0) {
		return sequenceFactory.empty();
	}
	const inputString: string = input.first().value;
	const patternString: string = pattern.first().value;
	return sequenceFactory.create(
		inputString
			.split(new RegExp(patternString))
			.map((token: string) => createAtomicValue(token, 'xs:string'))
	);
};

const fnUpperCase: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence
) => {
	if (stringSequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return stringSequence.map((stringValue) =>
		createAtomicValue(stringValue.value.toUpperCase(), 'xs:string')
	);
};

const fnLowerCase: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence
) => {
	if (stringSequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	return stringSequence.map((stringValue) =>
		createAtomicValue(stringValue.value.toLowerCase(), 'xs:string')
	);
};

const fnNormalizeSpace: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	if (arg.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', 'xs:string'));
	}
	const stringValue = arg.first().value.trim();
	return sequenceFactory.singleton(
		createAtomicValue(stringValue.replace(/\s+/g, ' '), 'xs:string')
	);
};

const fnTranslate: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	argSequence,
	mapStringSequence,
	transStringSequence
) => {
	return zipSingleton(
		[argSequence, mapStringSequence, transStringSequence],
		([argValue, mapStringSequenceValue, transStringSequenceValue]) => {
			const argArr = Array.from(argValue ? argValue.value : '');
			const mapStringArr = Array.from(mapStringSequenceValue.value);
			const transStringArr = Array.from(transStringSequenceValue.value);

			const result = argArr.map((letter) => {
				if (mapStringArr.includes(letter)) {
					const index = mapStringArr.indexOf(letter);
					if (index <= transStringArr.length) {
						return transStringArr[index];
					}
				} else {
					return letter;
				}
			});
			return sequenceFactory.singleton(createAtomicValue(result.join(''), 'xs:string'));
		}
	);
};

const fnCodepointsToString: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	numberSequence: ISequence
) => {
	return numberSequence.mapAll((numbers) => {
		const str = numbers
			.map((num) => {
				const numericValue: number = num.value;
				if (
					numericValue === 0x9 ||
					numericValue === 0xa ||
					numericValue === 0xd ||
					(numericValue >= 0x20 && numericValue <= 0xd7ff) ||
					(numericValue >= 0xe000 && numericValue <= 0xfffd) ||
					(numericValue >= 0x10000 && numericValue <= 0x10ffff)
				) {
					return String.fromCodePoint(numericValue);
				} else {
					throw new Error('FOCH0001');
				}
			})
			.join('');
		return sequenceFactory.singleton(createAtomicValue(str, 'xs:string'));
	});
};

const fnStringToCodepoints: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence: ISequence
) => {
	return zipSingleton([stringSequence], ([str]) => {
		const characters = str ? (str.value as string).split('') : [];
		if (characters.length === 0) {
			return sequenceFactory.empty();
		}

		return sequenceFactory.create(
			characters.map((character) => createAtomicValue(character.codePointAt(0), 'xs:integer'))
		);
	});
};

const fnEncodeForUri: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence: ISequence
) => {
	return zipSingleton([stringSequence], ([str]) => {
		if (str === null || str.value.length === 0) {
			return sequenceFactory.create(createAtomicValue('', 'xs:string'));
		}

		// Adhering RFC 3986 which reserves !, ', (, ), and *
		return sequenceFactory.create(
			createAtomicValue(
				encodeURIComponent(str.value).replace(/[!'()*]/g, (c) => {
					return '%' + c.charCodeAt(0).toString(16).toUpperCase();
				}),
				'xs:string'
			)
		);
	});
};

const fnIriToUri: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence: ISequence
) => {
	return zipSingleton([stringSequence], ([str]) => {
		if (str === null || str.value.length === 0) {
			return sequenceFactory.create(createAtomicValue('', 'xs:string'));
		}

		return sequenceFactory.create(
			createAtomicValue(
				str.value.replace(
					/([\u00A0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF "<>{}|\\^`/\n\u007f\u0080-\u009f]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g,
					(a) => encodeURI(a)
				),
				'xs:string'
			)
		);
	});
};

const fnCodepointEqual: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence1: ISequence,
	stringSequence2: ISequence
) => {
	return zipSingleton([stringSequence1, stringSequence2], ([value1, value2]) => {
		if (value1 === null || value2 === null) {
			return sequenceFactory.empty();
		}

		const string1: string = value1.value;
		const string2: string = value2.value;

		if (string1.length !== string2.length) {
			return sequenceFactory.singletonFalseSequence();
		}
		const string1Characters = string1.split('');
		const string2Characters = string2.split('');

		for (let i = 0; i < string1Characters.length; i++) {
			if (string1Characters[i].codePointAt(0) !== string2Characters[i].codePointAt(0)) {
				return sequenceFactory.singletonFalseSequence();
			}
		}

		return sequenceFactory.singletonTrueSequence();
	});
};

const cachedPatterns: Map<string, MatchFn> = new Map();

const fnMatches: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	inputSequence: ISequence,
	patternSequence: ISequence
) => {
	return zipSingleton([inputSequence, patternSequence], ([inputValue, patternValue]) => {
		const input = inputValue ? inputValue.value : '';
		const pattern = patternValue.value;
		let compiledPattern = cachedPatterns.get(pattern);
		if (!compiledPattern) {
			try {
				compiledPattern = compile(patternValue.value, { language: 'xpath' });
				cachedPatterns.set(pattern, compiledPattern);
			} catch (error) {
				throw new Error('FORX0002: ' + error);
			}
		}
		return compiledPattern(input)
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	});
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'compare',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:integer?',
			callFunction: fnCompare,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'compare',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:integer?',
			callFunction: collationError,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'concat',
			argumentTypes: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
			returnType: 'xs:string',
			callFunction: fnConcat,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'contains',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: collationError,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'contains',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnContains,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnEndsWith,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: collationError,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'normalize-space',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnNormalizeSpace,
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
			),
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnStartsWith,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: collationError,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string',
			argumentTypes: ['item()?'],
			returnType: 'xs:string',
			callFunction: fnString,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnString),
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring-before',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:string',
			callFunction: fnSubstringBefore,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring-after',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:string',
			callFunction: fnSubstringAfter,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring',
			argumentTypes: ['xs:string?', 'xs:double'],
			returnType: 'xs:string',
			callFunction: fnSubstring,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'substring',
			argumentTypes: ['xs:string?', 'xs:double', 'xs:double'],
			returnType: 'xs:string',
			callFunction: fnSubstring,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'upper-case',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnUpperCase,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'lower-case',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnLowerCase,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-join',
			argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
			returnType: 'xs:string',
			callFunction: fnStringJoin,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-join',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:string',
			callFunction(dynamicContext, executionParameters, staticContext, arg1) {
				return fnStringJoin(
					dynamicContext,
					executionParameters,
					staticContext,
					arg1,
					sequenceFactory.singleton(createAtomicValue('', 'xs:string'))
				);
			},
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'string-length',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:integer',
			callFunction: fnStringLength,
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
			),
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
			},
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string'],
			returnType: 'xs:string*',
			callFunction: fnTokenize,
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
					sequenceFactory.singleton(createAtomicValue(' ', 'xs:string'))
				);
			},
		},

		{
			argumentTypes: ['xs:string?', 'xs:string', 'xs:string'],
			callFunction: fnTranslate,
			localName: 'translate',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: ['xs:integer*'],
			callFunction: fnCodepointsToString,
			localName: 'codepoints-to-string',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: ['xs:string?'],
			callFunction: fnStringToCodepoints,
			localName: 'string-to-codepoints',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:integer*',
		},

		{
			argumentTypes: ['xs:string?'],
			callFunction: fnEncodeForUri,
			localName: 'encode-for-uri',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: ['xs:string?'],
			callFunction: fnIriToUri,
			localName: 'iri-to-uri',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: ['xs:string?', 'xs:string?'],
			callFunction: fnCodepointEqual,
			localName: 'codepoint-equal',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:boolean?',
		},

		{
			argumentTypes: ['xs:string?', 'xs:string'],
			callFunction: fnMatches,
			localName: 'matches',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:boolean',
		},
	],
	functions: {
		concat: fnConcat,
		endsWith: fnEndsWith,
		normalizeSpace: fnNormalizeSpace,
		startsWith: fnStartsWith,
		string: fnString,
		stringJoin: fnStringJoin,
		stringLength: fnStringLength,
		tokenize: fnTokenize,
	},
};
