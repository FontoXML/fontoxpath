import atomize from '../dataTypes/atomize';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import type ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import type DynamicContext from '../DynamicContext';
import type ExecutionParameters from '../ExecutionParameters';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import type StaticContext from '../StaticContext';
import { DONE_TOKEN, ready } from '../util/iterators';
import { errXPDY0002 } from '../XPathErrors';
import { performFunctionConversion } from './argumentHelper';
import type { BuiltinDeclarationType } from './builtInFunctions';
import type FunctionDefinitionType from './FunctionDefinitionType';

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

const ROMAN_NUMBERS = [
	{ symbol: 'M', decimal: 1000 },
	{ symbol: 'CM', decimal: 900 },
	{ symbol: 'D', decimal: 500 },
	{ symbol: 'CD', decimal: 400 },
	{ symbol: 'C', decimal: 100 },
	{ symbol: 'XC', decimal: 90 },
	{ symbol: 'L', decimal: 50 },
	{ symbol: 'XL', decimal: 40 },
	{ symbol: 'X', decimal: 10 },
	{ symbol: 'IX', decimal: 9 },
	{ symbol: 'V', decimal: 5 },
	{ symbol: 'IV', decimal: 4 },
	{ symbol: 'I', decimal: 1 },
];

function convertIntegerToRoman(integer: number, isLowerCase?: boolean) {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	let romanString = ROMAN_NUMBERS.reduce((str, roman) => {
		const q = Math.floor(integer / roman.decimal);
		integer -= q * roman.decimal;
		return str + roman.symbol.repeat(q);
	}, '');

	if (isLowerCase) {
		romanString = romanString.toLowerCase();
	}

	if (isNegative) {
		romanString = `-${romanString}`;
	}

	return romanString;
}

function convertIntegerToLowerRoman(integer: number) {
	return convertIntegerToRoman(integer, true);
}

function convertIntegerToUpperRoman(integer: number) {
	return convertIntegerToRoman(integer, false);
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function convertIntegerToAlphabet(integer: number, isLowerCase?: boolean) {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	let output = '';
	let digit;

	while (integer > 0) {
		digit = (integer - 1) % ALPHABET.length;
		output = ALPHABET[digit] + output;
		integer = ((integer - digit) / ALPHABET.length) | 0;
	}

	if (isLowerCase) {
		output = output.toLowerCase();
	}

	if (isNegative) {
		output = `-${output}`;
	}

	return output;
}

function convertIntegerToLowerAlphabet(integer: number) {
	return convertIntegerToAlphabet(integer, true);
}

function convertIntegerToUpperAlphabet(integer: number) {
	return convertIntegerToAlphabet(integer, false);
}

function getUnicodeSubset(
	firstCharacterCharCode: number,
	numberOfCharacters: number,
	charactersToSkip: number[] = []
): number[] {
	return Array.from({ length: numberOfCharacters }, (_, i) => i + firstCharacterCharCode).filter(
		(charCode) => {
			return !charactersToSkip.includes(charCode);
		}
	);
}

const HEBREW_ALPHABET_UNICODE = getUnicodeSubset(
	0x05d0,
	27,
	[0x05da, 0x05dd, 0x05df, 0x05e3, 0x05e5]
);

// The Unicode standard follows the modern Arabic Alif-Ba-Ta alphabetical order
const ARABIC_ALPHABET_UNICODE = getUnicodeSubset(
	0x0627,
	36,
	[0x0629, 0x063b, 0x063c, 0x063d, 0x063e, 0x063f, 0x0640, 0x0649]
);

const ARABIC_ABJADI_ALPHABET = [
	'أ',
	'ب',
	'ج',
	'د',
	'ه',
	'و',
	'ز',
	'ح',
	'ط',
	'ي',
	'ك',
	'ل',
	'م',
	'ن',
	'س',
	'ع',
	'ف',
	'ص',
	'ق',
	'ر',
	'ش',
	'ت',
	'ث',
	'خ',
	'ذ',
	'ض',
	'ظ',
	'غ',
];

// The value is the numerical value of the corresponding character in the Abjad numbering system.
const DECIMAL_TO_ARABIC_ABJAD_NUMBER_TABLE: [number, string][] = [
	[1000, 'غ'],
	[900, 'ظ'],
	[800, 'ض'],
	[700, 'ذ'],
	[600, 'خ'],
	[500, 'ث'],
	[400, 'ت'],
	[300, 'ش'],
	[200, 'ر'],
	[100, 'ق'],
	[90, 'ص'],
	[80, 'ف'],
	[70, 'ع'],
	[60, 'س'],
	[50, 'ن'],
	[40, 'م'],
	[30, 'ل'],
	[20, 'ك'],
	[10, 'ي'],
	[9, 'ط'],
	[8, 'ح'],
	[7, 'ز'],
	[6, 'و'],
	[5, 'ه'],
	[4, 'د'],
	[3, 'ج'],
	[2, 'ب'],
	[1, 'أ'],
];

const DECIMAL_TO_HEBREW_ALEFBET_NUMBER_TABLE: [number, string][] = [
	[400, 'ת'],
	[300, 'ש'],
	[200, 'ר'],
	[100, 'ק'],
	[90, 'צ'],
	[80, 'פ'],
	[70, 'ע'],
	[60, 'ס'],
	[50, 'נ'],
	[40, 'מ'],
	[30, 'ל'],
	[20, 'כ'],
	[10, 'י'],
	[9, 'ט'],
	[8, 'ח'],
	[7, 'ז'],
	[6, 'ו'],
	[5, 'ה'],
	[4, 'ד'],
	[3, 'ג'],
	[2, 'ב'],
	[1, 'א'],
];

function createUnicodeRangeBasedNumberFormatter(
	firstCharacterCharCode: number,
	numberOfCharacters: number,
	charactersToSkip: number[] = []
): (integer: number) => string {
	charactersToSkip.sort((a, b) => a - b);
	numberOfCharacters = numberOfCharacters - charactersToSkip.length;

	return function formatAsNumberInUnicodeRange(integer: number) {
		const isNegative = integer < 0;

		integer = Math.abs(integer);

		if (!integer) {
			return '-';
		}

		const formattedNumberParts = [];
		while (integer > 0) {
			const digit = (integer - 1) % numberOfCharacters;
			let charCode = firstCharacterCharCode + digit;

			// We should skip all skippable characters, because they are in order, we can loop over them and increment our pointer until we have a character we can use.
			charactersToSkip.forEach((char) => {
				if (charCode >= char) {
					charCode++;
				}
			});

			formattedNumberParts.unshift(String.fromCodePoint(charCode));
			integer = Math.floor((integer - 1) / numberOfCharacters);
		}
		let output = formattedNumberParts.join('');
		if (isNegative) {
			output = `-${output}`;
		}

		return output;
	};
}

const convertIntegerToLowerGreek = createUnicodeRangeBasedNumberFormatter(0x03b1, 25, [0x03c2]);

const convertIntegerToUpperGreek = createUnicodeRangeBasedNumberFormatter(0x0391, 25, [0x03a2]);

// Format as a letter in alphabetical order, using the Hebrew alphabetical order
function convertIntegerToHebrewAlefBet(integer: number): string {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	const multiples = Math.floor((integer - 1) / HEBREW_ALPHABET_UNICODE.length);
	// When list runs out of individual characters, repeat the last character in the alphabet
	const repeatChar = String.fromCodePoint(0x05ea);
	const formattedNumberParts = Array(multiples).fill(repeatChar);

	const digit = (integer - 1) % HEBREW_ALPHABET_UNICODE.length;
	const charCode = HEBREW_ALPHABET_UNICODE[digit];
	formattedNumberParts.push(String.fromCodePoint(charCode));

	let output = formattedNumberParts.join('');

	if (isNegative) {
		output = `-${output}`;
	}

	return output;
}

// Format as a letter in alphabetical order, using the Arabic AlifBaTa alphabetical order
function convertIntegerToArabicAlifBaTa(integer: number): string {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	const multiples = Math.floor((integer - 1) / ARABIC_ALPHABET_UNICODE.length) + 1;
	const digit = (integer - 1) % ARABIC_ALPHABET_UNICODE.length;
	const charCode = ARABIC_ALPHABET_UNICODE[digit];

	// When list runs out of individual characters, double each character, then triple, etc.
	const formattedNumberParts = Array(multiples).fill(String.fromCodePoint(charCode));

	// Add non-joiner separator between characters to prevent ligatures
	let output = formattedNumberParts.join(String.fromCodePoint(0x200c));

	if (isNegative) {
		output = `-${output}`;
	}

	return output;
}

// Format as a letter in alphabetical order, using the Arabic Abjadi alphabetical order
function convertIntegerToArabicAbjadi(integer: number): string {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	const multiples = Math.floor((integer - 1) / ARABIC_ABJADI_ALPHABET.length) + 1;
	const digit = (integer - 1) % ARABIC_ABJADI_ALPHABET.length;

	// When list runs out of individual characters, double each character, then triple, etc.
	const formattedNumberParts = Array(multiples).fill(ARABIC_ABJADI_ALPHABET[digit]);

	// Add non-joiner separator between characters to prevent ligatures
	let output = formattedNumberParts.join(String.fromCodePoint(0x200c));

	if (isNegative) {
		output = `-${output}`;
	}

	return output;
}

function convertIntegerToAbjadNumeral(integer: number): string {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	const arabicAbjadNumberParts = [];
	let thousands = Math.floor(integer / 1000);
	let remainder = integer - thousands * 1000;

	if (thousands === 1) {
		// Push the 1000 numeral
		arabicAbjadNumberParts.push(DECIMAL_TO_ARABIC_ABJAD_NUMBER_TABLE[0][1]);
	} else if (thousands > 1) {
		// Push the multiplicative thousands place
		for (const [val, char] of DECIMAL_TO_ARABIC_ABJAD_NUMBER_TABLE) {
			while (thousands >= val) {
				arabicAbjadNumberParts.push(char);
				thousands -= val;
			}
		}
		// Then push the 1000 numeral
		arabicAbjadNumberParts.push(DECIMAL_TO_ARABIC_ABJAD_NUMBER_TABLE[0][1]);
	}

	// Then append all numbers lower than 999
	for (const [val, char] of DECIMAL_TO_ARABIC_ABJAD_NUMBER_TABLE) {
		while (remainder >= val) {
			remainder -= val;
			arabicAbjadNumberParts.push(char);
		}
	}
	let output = arabicAbjadNumberParts.join('');

	if (isNegative) {
		output = `-${output}`;
	}

	return output;
}

function convertIntegerToHebrewNumeral(integer: number): string {
	const isNegative = integer < 0;

	integer = Math.abs(integer);

	if (!integer) {
		return '-';
	}

	const hebrewNumberParts = [];

	// In the number system, 400 is the largest numeral and is repeated when numbers grow larger than 799
	const fourHundreds = Math.floor(integer / 400);
	let remainder = integer - fourHundreds * 400;

	// Push a 'ת' character for each additional multiple of 400
	for (let i = 0; i < fourHundreds; i++) {
		hebrewNumberParts.push('ת');
	}
	// Then add the numbers smaller than 400
	for (const [val, char] of DECIMAL_TO_HEBREW_ALEFBET_NUMBER_TABLE) {
		while (remainder >= val) {
			remainder -= val;
			hebrewNumberParts.push(char);
		}
	}

	// If the last two digits are 15 or 16, substitute these characters because they are an exception in the Hebrew number system
	// For 15, substitute (10+5) with (9+6)
	const lastTwoChars = hebrewNumberParts.slice(-2).join('');
	if (lastTwoChars === 'יה') {
		hebrewNumberParts.splice(-2, 2, 'ט', 'ו');
	}
	// For 16, substitute (10+5) with (9+7)
	if (lastTwoChars === 'יו') {
		hebrewNumberParts.splice(-2, 2, 'ט', 'ז');
	}

	let output = hebrewNumberParts.join('');

	if (isNegative) {
		output = `-${output}`;
	}

	return output;
}

function convertIntegerToArabicIndicNumeral(integer: number): string {
	return new Intl.NumberFormat([], {
		// @ts-ignore TS does not recognize this NumberFormatOption because it is still an experimental part of the spec. However it is supported by all major browsers.
		numberingSystem: 'arab',
		useGrouping: false,
	}).format(integer);
}

function convertIntegerToPersianNumeral(integer: number): string {
	return new Intl.NumberFormat([], {
		// @ts-ignore TS does not recognize this NumberFormatOption because it is still an experimental part of the spec. However it is supported by all major browsers.
		numberingSystem: 'arabext',
		useGrouping: false,
	}).format(integer);
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

const integerConverters = new Map([
	['A', convertIntegerToUpperAlphabet],
	['a', convertIntegerToLowerAlphabet],
	['I', convertIntegerToUpperRoman],
	['i', convertIntegerToLowerRoman],
	['lowerGreek', convertIntegerToLowerGreek],
	['\u03b1', convertIntegerToLowerGreek],
	['upperGreek', convertIntegerToUpperGreek],
	['\u0391', convertIntegerToUpperGreek],
	['arabicAbjadi', convertIntegerToArabicAbjadi],
	['arabicAbjadNumeral', convertIntegerToAbjadNumeral],
	['arabicAlifBaTa', convertIntegerToArabicAlifBaTa],
	['hebrewAlefBet', convertIntegerToHebrewAlefBet],
	['hebrewNumeral', convertIntegerToHebrewNumeral],
	['arabicIndicNumeral', convertIntegerToArabicIndicNumeral],
	['\u0661', convertIntegerToArabicIndicNumeral],
	['\u0662', convertIntegerToArabicIndicNumeral],
	['\u0663', convertIntegerToArabicIndicNumeral],
	['\u0664', convertIntegerToArabicIndicNumeral],
	['\u0665', convertIntegerToArabicIndicNumeral],
	['\u0666', convertIntegerToArabicIndicNumeral],
	['\u0667', convertIntegerToArabicIndicNumeral],
	['\u0668', convertIntegerToArabicIndicNumeral],
	['\u0669', convertIntegerToArabicIndicNumeral],
	['persianNumeral', convertIntegerToPersianNumeral],
	['\u06f1', convertIntegerToPersianNumeral],
	['\u06f2', convertIntegerToPersianNumeral],
	['\u06f3', convertIntegerToPersianNumeral],
	['\u06f4', convertIntegerToPersianNumeral],
	['\u06f5', convertIntegerToPersianNumeral],
	['\u06f6', convertIntegerToPersianNumeral],
	['\u06f7', convertIntegerToPersianNumeral],
	['\u06f8', convertIntegerToPersianNumeral],
	['\u06f9', convertIntegerToPersianNumeral],
]);

const fnFormatInteger: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	pictureSequence
) => {
	const sequenceValue = sequence.first();
	const pictureValue = pictureSequence.first();

	if (sequence.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}

	const integerConverter = integerConverters.get(pictureValue.value);

	if (integerConverter) {
		const integer = sequenceValue.value as number;
		const convertedString = integerConverter(integer);
		return sequenceFactory.singleton(createAtomicValue(convertedString, ValueType.XSSTRING));
	} else {
		const validPictureStrings = Array.from(
			integerConverters,
			([pictureString, _]) => pictureString
		);
		throw new Error(
			`Picture: ${
				pictureValue.value
			} is not implemented yet. The supported picture strings are ${
				validPictureStrings.slice(0, -1).join(', ') +
				' and ' +
				validPictureStrings.slice(-1)
			}.`
		);
	}
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

	const result = /\d+(?:\.(\d*))?(?:[Ee](-)?(\d+))*/.exec(`${value}`);
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

// This is the djb2 algorithm, taken from http://www.cse.yorku.ca/~oz/hash.html
function createSeedFromString(seed: string): number {
	let hash = 5381;
	for (let i = 0; i < seed.length; ++i) {
		const c = seed.charCodeAt(i);
		hash = hash * 33 + c;
		// Make sure we overflow gracefully
		hash = hash % Number.MAX_SAFE_INTEGER;
	}
	return hash;
}

const fnRandomNumberGenerator: FunctionDefinitionType = (
	dynamicContext: DynamicContext,
	_executionParameters,
	_staticContext,
	sequence = sequenceFactory.empty()
) => {
	const iseed = sequence.isEmpty()
		? dynamicContext.getRandomNumber()
		: dynamicContext.getRandomNumber(
				createSeedFromString(castToType(sequence.first(), ValueType.XSSTRING).value)
		  );

	/**
	 * Create the random-number-generator object. The seed _must_ be an integer
	 */
	function fnRandomImplementation(iseed: number): ISequence {
		const permute: FunctionDefinitionType = (
			_dynamicContext,
			_executionParameters,
			_staticContext,
			sequence
		) => {
			if (sequence.isEmpty() || sequence.isSingleton()) {
				return sequence;
			}

			const allValues = sequence.getAllValues();
			let permuteCurrent = iseed;
			// Use Durstenfeld shuffle to randomize the list
			for (let i = allValues.length - 1; i > 1; i--) {
				permuteCurrent = dynamicContext.getRandomNumber(permuteCurrent).currentInt;
				const j = permuteCurrent % i;
				const t = allValues[j];
				allValues[j] = allValues[i];
				allValues[i] = t;
			}

			return sequenceFactory.create(allValues);
		};

		return sequenceFactory.singleton(
			new MapValue([
				{
					key: createAtomicValue('number', ValueType.XSSTRING),
					value: () =>
						sequenceFactory.singleton(
							createAtomicValue(
								dynamicContext.getRandomNumber(iseed).currentDecimal,
								ValueType.XSDOUBLE
							)
						),
				},
				{
					key: createAtomicValue('next', ValueType.XSSTRING),
					value: () =>
						sequenceFactory.singleton(
							new FunctionValue({
								value: () =>
									fnRandomImplementation(
										dynamicContext.getRandomNumber(iseed).currentInt
									),
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
								value: permute,
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
	}
	return fnRandomImplementation(iseed.currentInt);
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
		localName: 'format-integer',
		argumentTypes: [
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnFormatInteger,
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
				throw errXPDY0002('fn:number needs an atomizable context item.');
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
		callFunction: fnRandomNumberGenerator,
	},
];

export default {
	declarations,
	functions: {
		['number']: fnNumber,
		round: fnRound,
	},
};
