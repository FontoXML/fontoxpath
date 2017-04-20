import isInstanceOfType from '../dataTypes/isInstanceOfType';
import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';

function collationError () {
	throw new Error('Not implemented: Specifying a collation is not supported');
}

function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, Sequence.singleton(dynamicContext.contextItem));
}

function fnCompare (_dynamicContext, arg1, arg2) {
	if (arg1.isEmpty() || arg2.isEmpty()) {
		return Sequence.empty();
	}

	const arg1Value = arg1.first().value,
		arg2Value = arg2.first().value;

	if (arg1Value > arg2Value) {
		return Sequence.singleton(createAtomicValue(1, 'xs:integer'));
	}

	if (arg1Value < arg2Value) {
		return Sequence.singleton(createAtomicValue(-1, 'xs:integer'));
	}

	return Sequence.singleton(createAtomicValue(0, 'xs:integer'));
}

function fnConcat (dynamicContext) {
	let stringSequences = Array.from(arguments).slice(1);
	stringSequences = stringSequences.map(function (sequence) {
		return sequence.atomize(dynamicContext);
	});
	const strings = stringSequences.map(function (sequence) {
			if (sequence.isEmpty()) {
				return '';
			}
			return sequence.first().value;
		});
	return Sequence.singleton(createAtomicValue(strings.join(''), 'xs:string'));
}

function fnContains (_dynamicContext, arg1, arg2) {
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	const contains = !arg2.isEmpty() ? arg2.first().value : '';
	if (contains.length === 0) {
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}

	if (stringToTest.length === 0) {
		return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
	}

	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.includes(contains)) {
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}
		return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
}

function fnStartsWith (_dynamicContext, arg1, arg2) {
	const startsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (startsWith.length === 0) {
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.startsWith(startsWith)) {
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}
	return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
}

function fnEndsWith (_dynamicContext, arg1, arg2) {
	const endsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (endsWith.length === 0) {
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.endsWith(endsWith)) {
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}
	return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
}

function fnString (dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	if (isInstanceOfType(sequence.first(), 'node()')) {
		return Sequence.singleton(sequence.first().getStringValue(dynamicContext));
	}
	return Sequence.singleton(castToType(sequence.first(), 'xs:string'));
}

function fnStringJoin (_dynamicContext, sequence, separator) {
	const separatorString = separator.first().value;
	const joinedString = sequence.getAllValues().map(function (stringValue) {
		return stringValue.value;
	}).join(separatorString);
	return Sequence.singleton(createAtomicValue(joinedString, 'xs:string'));
}

function fnStringLength (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(createAtomicValue(0, 'xs:integer'));
	}
	// In ES6, Array.from(💩).length === 1
	return Sequence.singleton(createAtomicValue(Array.from(sequence.first().value).length, 'xs:integer'));
}

function fnSubstringBefore (_dynamicContext, arg1, arg2) {
	let strArg1;
	if (arg1.isEmpty()) {
		strArg1 = '';
	}
	else {
		strArg1 = arg1.first().value;
	}
	let strArg2;
	if (arg2.isEmpty()) {
		strArg2 = '';
	}
	else {
		strArg2 = arg2.first().value;
	}

	if (strArg2 === '') {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	return Sequence.singleton(createAtomicValue(strArg1.substring(0, startIndex), 'xs:string'));
}

function fnSubstringAfter (_dynamicContext, arg1, arg2) {
	let strArg1;
	if (arg1.isEmpty()) {
		strArg1 = '';
	}
	else {
		strArg1 = arg1.first().value;
	}
	let strArg2;
	if (arg2.isEmpty()) {
		strArg2 = '';
	}
	else {
		strArg2 = arg2.first().value;
	}

	if (strArg2 === '') {
		return Sequence.singleton(createAtomicValue(strArg1, 'xs:string'));
	}
	const startIndex = strArg1.indexOf(strArg2);
	if (startIndex === -1) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	return Sequence.singleton(createAtomicValue(strArg1.substring(startIndex + strArg2.length), 'xs:string'));
}

function fnTokenize (_dynamicContext, input, pattern) {
	if (input.isEmpty() || input.first().value.length === 0) {
		return Sequence.empty();
	}
	const string = input.first().value,
		patternString = pattern.first().value;
	return new Sequence(
		string.split(new RegExp(patternString))
			.map(function (token) {
				return createAtomicValue(token, 'xs:string');
			}));
}

function fnUpperCase (_dynamicContext, stringSequence) {
	if (stringSequence.isEmpty()) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	return stringSequence.map(string => createAtomicValue(string.value.toUpperCase(), 'xs:string'));
}

function fnLowerCase (_dynamicContext, stringSequence) {
	if (stringSequence.isEmpty()) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	return stringSequence.map(string => createAtomicValue(string.value.toLowerCase(), 'xs:string'));
}

function fnNormalizeSpace (_dynamicContext, arg) {
	if (arg.isEmpty()) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	const string = arg.first().value.trim();
	return Sequence.singleton(createAtomicValue(string.replace(/\s+/g, ' '), 'xs:string'));
}

export default {
	declarations: [
		{
			name: 'compare',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:integer?',
			callFunction: fnCompare
		},

		{
			name: 'compare',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:integer?',
			callFunction: collationError
		},

		{
			name: 'concat',
			argumentTypes: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
			returnType: 'xs:string',
			callFunction: fnConcat
		},

		{
			name: 'contains',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: collationError
		},

		{
			name: 'contains',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnContains
		},

		{
			name: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnEndsWith
		},

		{
			name: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: collationError
		},

		{
			name: 'normalize-space',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnNormalizeSpace
		},

		{
			name: 'normalize-space',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: function (dynamicContext) {
				return fnNormalizeSpace(dynamicContext, fnString(dynamicContext, Sequence.singleton(dynamicContext.contextItem)));
			}
		},

		{
			name: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnStartsWith
		},

		{
			name: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: collationError
		},

		{
			name: 'string',
			argumentTypes: ['item()?'],
			returnType: 'xs:string',
			callFunction: fnString
		},

		{
			name: 'string',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnString)
		},

		{
			name: 'substring-before',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:string',
			callFunction: fnSubstringBefore
		},

		{
			name: 'substring-after',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:string',
			callFunction: fnSubstringAfter
		},

		{
			name: 'string-join',
			argumentTypes: ['xs:string*', 'xs:string'],
			returnType: 'xs:string',
			callFunction: fnStringJoin
		},

		{
			name: 'upper-case',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnUpperCase
		},

		{
			name: 'lower-case',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnLowerCase
		},


		{
			name: 'string-join',
			argumentTypes: ['xs:string*'],
			returnType: 'xs:string',
			callFunction: function (dynamicContext, arg1) {
				return fnStringJoin(dynamicContext, arg1, Sequence.singleton(createAtomicValue('', 'xs:string')));
			}
		},

		{
			name: 'string-length',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:integer',
			callFunction: fnStringLength
		},

		{
			name: 'string-length',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: function (dynamicContext) {
				return fnStringLength(dynamicContext, fnString(dynamicContext, Sequence.singleton(dynamicContext.contextItem)));
			}
		},

		{
			name: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string', 'xs:string'],
			returnType: 'xs:string*',
			callFunction: function (dynamicContext, input, pattern, flags) {
				throw new Error('Not implemented: Using flags in tokenize is not supported');
			}
		},

		{
			name: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string'],
			returnType: 'xs:string*',
			callFunction: fnTokenize
		},

		{
			name: 'tokenize',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string*',
			callFunction: function (dynamicContext, input) {
				return fnTokenize(
					dynamicContext,
					fnNormalizeSpace(dynamicContext, input),
					Sequence.singleton(createAtomicValue(' ', 'xs:string')));
			}
		}

	],
	functions: {
		concat: fnConcat,
		endsWith: fnStartsWith,
		normalizeSpace: fnNormalizeSpace,
		startsWith: fnStartsWith,
		string: fnString,
		stringJoin: fnStringJoin,
		stringLength: fnStringLength,
		tokenize: fnTokenize
	}
};
