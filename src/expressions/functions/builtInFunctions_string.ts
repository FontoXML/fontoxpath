import { compile, MatchFn } from 'xspattern';
import atomize, { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { EllipsisType, SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { DONE_TOKEN, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { errXPDY0002 } from '../XPathErrors';
import { BuiltinDeclarationType } from './builtInFunctions';
import builtInNumericFunctions from './builtInFunctions_numeric';
import FunctionDefinitionType from './FunctionDefinitionType';
import { contextItemAsFirstArgument } from './argumentHelper';

const fnRound = builtInNumericFunctions.functions.round;

function collationError(): ISequence {
	throw new Error('FOCH0002: No collations are supported');
}

const fnCompare: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2,
) => {
	if (arg1.isEmpty() || arg2.isEmpty()) {
		return sequenceFactory.empty();
	}

	const arg1Value = arg1.first().value;
	const arg2Value = arg2.first().value;

	if (arg1Value > arg2Value) {
		return sequenceFactory.singleton(createAtomicValue(1, ValueType.XSINTEGER));
	}

	if (arg1Value < arg2Value) {
		return sequenceFactory.singleton(createAtomicValue(-1, ValueType.XSINTEGER));
	}

	return sequenceFactory.singleton(createAtomicValue(0, ValueType.XSINTEGER));
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
								: castToType(stringValue, ValueType.XSSTRING).value,
						)
						.join(''),
					ValueType.XSSTRING,
				),
			);
		});
	});

	return zipSingleton(stringSequences, (stringValues) => {
		return sequenceFactory.singleton(
			createAtomicValue(
				stringValues.map((stringValue) => stringValue.value).join(''),
				ValueType.XSSTRING,
			),
		);
	});
};

const fnContains: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2,
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
	arg2,
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
	arg2,
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
	sequence,
) => {
	return sequence.switchCases({
		empty: () => sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING)),
		default: () =>
			sequence.map((value) => {
				if (isSubtypeOf(value.type, ValueType.NODE)) {
					const stringValueSequence = atomizeSingleValue(value, executionParameters);
					// Assume here that a node always atomizes to a singlevalue. This will not work
					// anymore when schema support will be imlemented.
					const stringValue = stringValueSequence.first();
					if (isSubtypeOf(value.type, ValueType.ATTRIBUTE)) {
						return castToType(stringValue, ValueType.XSSTRING);
					}
					return stringValue;
				}
				return castToType(value, ValueType.XSSTRING);
			}),
	});
};

const fnStringJoin: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
	separator,
) => {
	return zipSingleton([separator], ([separatorString]) =>
		atomize(sequence, executionParameters).mapAll((allStrings) => {
			const joinedString = allStrings
				.map((stringValue) => castToType(stringValue, ValueType.XSSTRING).value)
				.join(separatorString.value);
			return sequenceFactory.singleton(createAtomicValue(joinedString, ValueType.XSSTRING));
		}),
	);
};

const fnStringLength: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue(0, ValueType.XSINTEGER));
	}
	const stringValue = sequence.first().value;
	// In ES6, Array.from(💩).length === 1
	return sequenceFactory.singleton(
		createAtomicValue(Array.from(stringValue).length, ValueType.XSINTEGER),
	);
};

const fnSubstringBefore: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2,
) => {
	const strArg1 = arg1.isEmpty() ? '' : arg1.first().value;

	const strArg2 = arg2.isEmpty() ? '' : arg2.first().value;

	if (strArg2 === '') {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	return sequenceFactory.singleton(
		createAtomicValue(strArg1.substring(0, startIndex), ValueType.XSSTRING),
	);
};

const fnSubstringAfter: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg1,
	arg2,
) => {
	const strArg1 = arg1.isEmpty() ? '' : arg1.first().value;

	const strArg2 = arg2.isEmpty() ? '' : arg2.first().value;

	if (strArg2 === '') {
		return sequenceFactory.singleton(createAtomicValue(strArg1, ValueType.XSSTRING));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	return sequenceFactory.singleton(
		createAtomicValue(strArg1.substring(startIndex + strArg2.length), ValueType.XSSTRING),
	);
};

const fnSubstring: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sourceString,
	start,
	length,
) => {
	const roundedStart = fnRound(
		false,
		dynamicContext,
		executionParameters,
		staticContext,
		start,
		null,
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
					return ready(createAtomicValue('', ValueType.XSSTRING));
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
								: undefined,
						)
						.join(''),
					ValueType.XSSTRING,
				),
			);
		},
	});
};

const fnTokenize: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	input,
	pattern,
) => {
	if (input.isEmpty() || input.first().value.length === 0) {
		return sequenceFactory.empty();
	}
	const inputString: string = input.first().value;
	const patternString: string = pattern.first().value;

	const regex = compileJSRegex(patternString);
	regex.lastIndex = 0;
	const results = [];
	let result = regex.exec(inputString);

	let index = 0;

	// Repeatedly execute the regex to get all the outputs
	// TODO: with this approach it should not be too difficult to actually use XSPattern here.
	while (result) {
		results.push(inputString.slice(index, result.index));
		index = regex.lastIndex;
		result = regex.exec(inputString);
	}

	// Don't forget the last split part!
	results.push(inputString.slice(index));

	return sequenceFactory.create(
		results.map((token: string) => createAtomicValue(token, ValueType.XSSTRING)),
	);
};

const fnUpperCase: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence,
) => {
	if (stringSequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	return stringSequence.map((stringValue) =>
		createAtomicValue(stringValue.value.toUpperCase(), ValueType.XSSTRING),
	);
};

const fnLowerCase: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence,
) => {
	if (stringSequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	return stringSequence.map((stringValue) =>
		createAtomicValue(stringValue.value.toLowerCase(), ValueType.XSSTRING),
	);
};

const fnNormalizeSpace: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg,
) => {
	if (arg.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	const stringValue = arg.first().value.trim();
	return sequenceFactory.singleton(
		createAtomicValue(stringValue.replace(/\s+/g, ' '), ValueType.XSSTRING),
	);
};

const fnTranslate: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	argSequence,
	mapStringSequence,
	transStringSequence,
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
				createAtomicValue(result.join(''), ValueType.XSSTRING),
			);
		},
	);
};

const fnCodepointsToString: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	numberSequence: ISequence,
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
		return sequenceFactory.singleton(createAtomicValue(str, ValueType.XSSTRING));
	});
};

const fnStringToCodepoints: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence: ISequence,
) => {
	return zipSingleton([stringSequence], ([str]) => {
		const characters = str ? (str.value as string).split('') : [];
		if (characters.length === 0) {
			return sequenceFactory.empty();
		}

		return sequenceFactory.create(
			characters.map((character) =>
				createAtomicValue(character.codePointAt(0), ValueType.XSINTEGER),
			),
		);
	});
};

const fnEncodeForUri: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence: ISequence,
) => {
	return zipSingleton([stringSequence], ([str]) => {
		if (str === null || str.value.length === 0) {
			return sequenceFactory.create(createAtomicValue('', ValueType.XSSTRING));
		}

		// Adhering RFC 3986 which reserves !, ', (, ), and *
		return sequenceFactory.create(
			createAtomicValue(
				encodeURIComponent(str.value).replace(/[!'()*]/g, (c) => {
					return '%' + c.charCodeAt(0).toString(16).toUpperCase();
				}),
				ValueType.XSSTRING,
			),
		);
	});
};

const fnIriToUri: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence: ISequence,
) => {
	return zipSingleton([stringSequence], ([str]) => {
		if (str === null || str.value.length === 0) {
			return sequenceFactory.create(createAtomicValue('', ValueType.XSSTRING));
		}

		const strValue = str.value as string;

		return sequenceFactory.create(
			createAtomicValue(
				strValue.replace(
					/([\u00A0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF "<>{}|\\^`/\n\u007f\u0080-\u009f]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g,
					(a) => encodeURI(a),
				),
				ValueType.XSSTRING,
			),
		);
	});
};

const fnCodepointEqual: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	stringSequence1: ISequence,
	stringSequence2: ISequence,
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
	patternSequence: ISequence,
) => {
	return zipSingleton([inputSequence, patternSequence], ([inputValue, patternValue]) => {
		const input: string = inputValue ? inputValue.value : '';
		const pattern: string = patternValue.value;
		let compiledPattern = cachedPatterns.get(pattern);
		if (!compiledPattern) {
			try {
				compiledPattern = compile(pattern, { language: 'xpath' });
			} catch (error) {
				throw new Error(`FORX0002: ${error}`);
			}
			cachedPatterns.set(pattern, compiledPattern);
		}
		return compiledPattern(input)
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	});
};

const compiledRegexes = new Map<string, RegExp>();
function compileJSRegex(pattern: string): RegExp {
	if (compiledRegexes.has(pattern)) {
		return compiledRegexes.get(pattern);
	}
	let regex;
	try {
		regex = new RegExp(pattern, 'g');
	} catch (error) {
		throw new Error(`FORX0002: ${error}`);
	}

	// Only do this check once per regex
	if (regex.test('')) {
		throw new Error(`FORX0003: the pattern ${pattern} matches the zero length string`);
	}

	compiledRegexes.set(pattern, regex);

	return regex;
}

const fnReplace: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	inputSequence: ISequence,
	patternSequence: ISequence,
	replacementSequence: ISequence,
) => {
	return zipSingleton(
		[inputSequence, patternSequence, replacementSequence],
		([inputValue, patternValue, replacementValue]) => {
			const input = inputValue ? inputValue.value : '';
			const pattern = patternValue.value;
			let replacement: string = replacementValue.value;
			if (replacement.includes('$0')) {
				throw new Error(
					'Using $0 in fn:replace to replace substrings with full matches is not supported.',
				);
			}

			// Note: while XPath patterns escape dollars with backslashes, JavaScript escapes them by duplicating
			replacement = replacement
				.split(/((?:\$\$)|(?:\\\$)|(?:\\\\))/)
				.map((part) => {
					switch (part) {
						case '\\$':
							return '$$';
						case '\\\\':
							return '\\';
						case '$$':
							throw new Error('FORX0004: invalid replacement: "$$"');
						default:
							return part;
					}
				})
				.join('');
			const regex = compileJSRegex(pattern);
			const result = input.replace(regex, replacement);

			return sequenceFactory.singleton(createAtomicValue(result, ValueType.XSSTRING));
		},
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'compare',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnCompare,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'compare',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'concat',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
			EllipsisType.ELLIPSIS,
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnConcat,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'contains',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'contains',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnContains,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'ends-with',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnEndsWith,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'ends-with',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'normalize-space',
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnNormalizeSpace,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'normalize-space',
		argumentTypes: [],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: contextItemAsFirstArgument(
			'normalize-space',
			ValueType.XSSTRING,
			(
				dynamicContext: DynamicContext,
				executionParameters: ExecutionParameters,
				staticContext: StaticContext,
				contextItem: ISequence,
			) =>
				fnNormalizeSpace(
					dynamicContext,
					executionParameters,
					staticContext,
					fnString(dynamicContext, executionParameters, staticContext, contextItem),
				),
		),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'starts-with',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnStartsWith,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'starts-with',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: collationError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'string',
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnString,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'string',
		argumentTypes: [],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: contextItemAsFirstArgument('string', ValueType.ITEM, fnString),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'substring-before',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnSubstringBefore,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'substring-after',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnSubstringAfter,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'substring',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnSubstring,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'substring',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnSubstring,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'upper-case',
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnUpperCase,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'lower-case',
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnLowerCase,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'string-join',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnStringJoin,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'string-join',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction(dynamicContext, executionParameters, staticContext, arg1) {
			return fnStringJoin(
				dynamicContext,
				executionParameters,
				staticContext,
				arg1,
				sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING)),
			);
		},
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'string-length',
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnStringLength,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'string-length',
		argumentTypes: [],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: contextItemAsFirstArgument(
			'string-length',
			// Note: deviate from the spec to allow expressions line `1!fn:string-length()` to
			// atomize the input still
			ValueType.XSANYATOMICTYPE,
			(
				dynamicContext: DynamicContext,
				executionParameters: ExecutionParameters,
				staticContext: StaticContext,
				contextItem: ISequence,
			) =>
				fnStringLength(
					dynamicContext,
					executionParameters,
					staticContext,
					fnString(dynamicContext, executionParameters, staticContext, contextItem),
				),
		),
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'tokenize',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		},
		callFunction(
			_dynamicContext,
			_executionParameters,
			_staticContext,
			_input,
			_pattern,
			_flags,
		) {
			throw new Error('Not implemented: Using flags in tokenize is not supported');
		},
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'tokenize',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		},
		callFunction: fnTokenize,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'tokenize',
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		},
		callFunction(dynamicContext, executionParameters, staticContext, input) {
			return fnTokenize(
				dynamicContext,
				executionParameters,
				staticContext,
				fnNormalizeSpace(dynamicContext, executionParameters, staticContext, input),
				sequenceFactory.singleton(createAtomicValue(' ', ValueType.XSSTRING)),
			);
		},
	},

	{
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnTranslate,
		localName: 'translate',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{
				type: ValueType.XSINTEGER,
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			},
		],
		callFunction: fnCodepointsToString,
		localName: 'codepoints-to-string',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnStringToCodepoints,
		localName: 'string-to-codepoints',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: {
			type: ValueType.XSINTEGER,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		},
	},

	{
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnEncodeForUri,
		localName: 'encode-for-uri',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnIriToUri,
		localName: 'iri-to-uri',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		callFunction: fnCodepointEqual,
		localName: 'codepoint-equal',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: {
			type: ValueType.XSBOOLEAN,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
	},

	{
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnMatches,
		localName: 'matches',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnReplace,
		localName: 'replace',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		localName: 'replace',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction(
			_dynamicContext,
			_executionParameters,
			_staticContext,
			_input,
			_pattern,
			_flags,
		) {
			throw new Error('Not implemented: Using flags in replace is not supported');
		},
	},
];

export default {
	declarations,
	functions: {
		concat: fnConcat,
		endsWith: fnEndsWith,
		normalizeSpace: fnNormalizeSpace,
		replace: fnReplace,
		startsWith: fnStartsWith,
		['string']: fnString,
		stringJoin: fnStringJoin,
		stringLength: fnStringLength,
		tokenize: fnTokenize,
	},
};
