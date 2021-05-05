import { compile, MatchFn } from 'xspattern';
import atomize, { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { BaseType, ParameterType, SequenceType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { DONE_TOKEN, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { BuiltinDeclarationType } from './builtInFunctions';
import builtInNumericFunctions from './builtInFunctions_numeric';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnRound = builtInNumericFunctions.functions.round;

function collationError(): ISequence {
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
		return sequenceFactory.singleton(
			createAtomicValue(1, { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE })
		);
	}

	if (arg1Value < arg2Value) {
		return sequenceFactory.singleton(
			createAtomicValue(-1, { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE })
		);
	}

	return sequenceFactory.singleton(
		createAtomicValue(0, { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE })
	);
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
							stringValue === null
								? ''
								: castToType(stringValue, {
										kind: BaseType.XSSTRING,
										seqType: SequenceType.EXACTLY_ONE,
								  }).value
						)
						.join(''),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				)
			);
		});
	});

	return zipSingleton(stringSequences, (stringValues) => {
		return sequenceFactory.singleton(
			createAtomicValue(stringValues.map((stringValue) => stringValue.value).join(''), {
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			})
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
		empty: () =>
			sequenceFactory.singleton(
				createAtomicValue('', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			),
		default: () =>
			sequence.map((value) => {
				if (
					isSubtypeOf(value.type, {
						kind: BaseType.NODE,
						seqType: SequenceType.EXACTLY_ONE,
					})
				) {
					const stringValueSequence = atomizeSingleValue(value, executionParameters);
					// Assume here that a node always atomizes to a singlevalue. This will not work
					// anymore when schema support will be imlemented.
					const stringValue = stringValueSequence.first();
					if (
						isSubtypeOf(value.type, {
							kind: BaseType.ATTRIBUTE,
							seqType: SequenceType.EXACTLY_ONE,
						})
					) {
						return castToType(stringValue, {
							kind: BaseType.XSSTRING,
							seqType: SequenceType.EXACTLY_ONE,
						});
					}
					return stringValue;
				}
				return castToType(value, {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				});
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
				.map(
					(stringValue) =>
						castToType(stringValue, {
							kind: BaseType.XSSTRING,
							seqType: SequenceType.EXACTLY_ONE,
						}).value
				)
				.join(separatorString.value);
			return sequenceFactory.singleton(
				createAtomicValue(joinedString, {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			);
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
		return sequenceFactory.singleton(
			createAtomicValue(0, { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	const stringValue = sequence.first().value;
	// In ES6, Array.from(💩).length === 1
	return sequenceFactory.singleton(
		createAtomicValue(Array.from(stringValue).length, {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		return sequenceFactory.singleton(
			createAtomicValue('', { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return sequenceFactory.singleton(
			createAtomicValue('', { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	return sequenceFactory.singleton(
		createAtomicValue(strArg1.substring(0, startIndex), {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		return sequenceFactory.singleton(
			createAtomicValue(strArg1, {
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			})
		);
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return sequenceFactory.singleton(
			createAtomicValue('', { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	return sequenceFactory.singleton(
		createAtomicValue(strArg1.substring(startIndex + strArg2.length), {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
					return ready(
						createAtomicValue('', {
							kind: BaseType.XSSTRING,
							seqType: SequenceType.EXACTLY_ONE,
						})
					);
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
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
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
		inputString.split(new RegExp(patternString)).map((token: string) =>
			createAtomicValue(token, {
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			})
		)
	);
};

const fnUpperCase: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence
) => {
	if (stringSequence.isEmpty()) {
		return sequenceFactory.singleton(
			createAtomicValue('', { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	return stringSequence.map((stringValue) =>
		createAtomicValue(stringValue.value.toUpperCase(), {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const fnLowerCase: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence
) => {
	if (stringSequence.isEmpty()) {
		return sequenceFactory.singleton(
			createAtomicValue('', { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	return stringSequence.map((stringValue) =>
		createAtomicValue(stringValue.value.toLowerCase(), {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const fnNormalizeSpace: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	if (arg.isEmpty()) {
		return sequenceFactory.singleton(
			createAtomicValue('', { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
	}
	const stringValue = arg.first().value.trim();
	return sequenceFactory.singleton(
		createAtomicValue(stringValue.replace(/\s+/g, ' '), {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
			return sequenceFactory.singleton(
				createAtomicValue(result.join(''), {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			);
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
		return sequenceFactory.singleton(
			createAtomicValue(str, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
		);
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
			characters.map((character) =>
				createAtomicValue(character.codePointAt(0), {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			)
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
			return sequenceFactory.create(
				createAtomicValue('', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			);
		}

		// Adhering RFC 3986 which reserves !, ', (, ), and *
		return sequenceFactory.create(
			createAtomicValue(
				encodeURIComponent(str.value).replace(/[!'()*]/g, (c) => {
					return '%' + c.charCodeAt(0).toString(16).toUpperCase();
				}),
				{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
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
			return sequenceFactory.create(
				createAtomicValue('', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			);
		}

		return sequenceFactory.create(
			createAtomicValue(
				str.value.replace(
					/([\u00A0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF "<>{}|\\^`/\n\u007f\u0080-\u009f]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g,
					(a) => encodeURI(a)
				),
				{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
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

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'compare',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnCompare,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'compare',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'concat',
		argumentTypes: [
			{ kind: BaseType.XSANYATOMICTYPE, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSANYATOMICTYPE, seqType: ParameterType.ZERO_OR_ONE },
			//TODO: CHANGE THIS BASETYPE
			{ kind: BaseType.XSSHORT, seqType: ParameterType.ELLIPSIS },
		],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnConcat,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'contains',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'contains',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnContains,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'ends-with',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnEndsWith,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'ends-with',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'normalize-space',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnNormalizeSpace,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'normalize-space',
		argumentTypes: [],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
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
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnStartsWith,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'starts-with',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'string',
		argumentTypes: [{ kind: BaseType.ITEM, seqType: ParameterType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnString,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'string',
		argumentTypes: [],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: contextItemAsFirstArgument.bind(null, fnString),
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'substring-before',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnSubstringBefore,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'substring-after',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnSubstringAfter,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'substring',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSDOUBLE, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnSubstring,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'substring',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSDOUBLE, seqType: ParameterType.EXACTLY_ONE },
			{ kind: BaseType.XSDOUBLE, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnSubstring,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'upper-case',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnUpperCase,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'lower-case',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnLowerCase,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'string-join',
		argumentTypes: [
			{ kind: BaseType.XSANYATOMICTYPE, seqType: ParameterType.ZERO_OR_MORE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnStringJoin,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'string-join',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: ParameterType.ZERO_OR_MORE }],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		callFunction(dynamicContext, executionParameters, staticContext, arg1) {
			return fnStringJoin(
				dynamicContext,
				executionParameters,
				staticContext,
				arg1,
				sequenceFactory.singleton(
					createAtomicValue('', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					})
				)
			);
		},
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'string-length',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnStringLength,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'string-length',
		argumentTypes: [],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
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
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.ZERO_OR_MORE,
		},
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
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		returnType: {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.ZERO_OR_MORE,
		},
		callFunction: fnTokenize,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'tokenize',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		returnType: {
			kind: BaseType.XSSTRING,
			seqType: SequenceType.ZERO_OR_MORE,
		},
		callFunction(dynamicContext, executionParameters, staticContext, input) {
			return fnTokenize(
				dynamicContext,
				executionParameters,
				staticContext,
				fnNormalizeSpace(dynamicContext, executionParameters, staticContext, input),
				sequenceFactory.singleton(
					createAtomicValue(' ', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					})
				)
			);
		},
	},

	{
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		callFunction: fnTranslate,
		localName: 'translate',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{
				kind: BaseType.XSINTEGER,
				seqType: ParameterType.ZERO_OR_MORE,
			},
		],
		callFunction: fnCodepointsToString,
		localName: 'codepoints-to-string',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		callFunction: fnStringToCodepoints,
		localName: 'string-to-codepoints',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.ZERO_OR_MORE,
		},
	},

	{
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		callFunction: fnEncodeForUri,
		localName: 'encode-for-uri',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE }],
		callFunction: fnIriToUri,
		localName: 'iri-to-uri',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
		],
		callFunction: fnCodepointEqual,
		localName: 'codepoint-equal',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: {
			kind: BaseType.XSBOOLEAN,
			seqType: SequenceType.ZERO_OR_ONE,
		},
	},

	{
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: ParameterType.ZERO_OR_ONE },
			{ kind: BaseType.XSSTRING, seqType: ParameterType.EXACTLY_ONE },
		],
		callFunction: fnMatches,
		localName: 'matches',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
	},
];

export default {
	declarations,
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
