import IntegerValue from '../dataTypes/IntegerValue';
import StringValue from '../dataTypes/StringValue';
import BooleanValue from '../dataTypes/BooleanValue';
import Sequence from '../dataTypes/Sequence';
import { castToType } from '../dataTypes/conversionHelper';

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
		return Sequence.singleton(new IntegerValue(1));
	}

	if (arg1Value < arg2Value) {
		return Sequence.singleton(new IntegerValue(-1));
	}

	return Sequence.singleton(new IntegerValue(0));
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
	return Sequence.singleton(new StringValue(strings.join('')));
}

function fnContains (_dynamicContext, arg1, arg2) {
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	const contains = !arg2.isEmpty() ? arg2.first().value : '';
	if (contains.length === 0) {
		return Sequence.singleton(BooleanValue.TRUE);
	}

	if (stringToTest.length === 0) {
		return Sequence.singleton(BooleanValue.FALSE);
	}

	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.includes(contains)) {
		return Sequence.singleton(BooleanValue.TRUE);
	}
	return Sequence.singleton(BooleanValue.FALSE);
}

function fnStartsWith (_dynamicContext, arg1, arg2) {
	const startsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (startsWith.length === 0) {
		return Sequence.singleton(BooleanValue.TRUE);
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return Sequence.singleton(BooleanValue.FALSE);
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.startsWith(startsWith)) {
		return Sequence.singleton(BooleanValue.TRUE);
	}
	return Sequence.singleton(BooleanValue.FALSE);
}

function fnEndsWith (_dynamicContext, arg1, arg2) {
	const endsWith = !arg2.isEmpty() ? arg2.first().value : '';
	if (endsWith.length === 0) {
		return Sequence.singleton(BooleanValue.TRUE);
	}
	const stringToTest = !arg1.isEmpty() ? arg1.first().value : '';
	if (stringToTest.length === 0) {
		return Sequence.singleton(BooleanValue.FALSE);
	}
	// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
	if (stringToTest.endsWith(endsWith)) {
		return Sequence.singleton(BooleanValue.TRUE);
	}
	return Sequence.singleton(BooleanValue.FALSE);
}

function fnString (dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(new StringValue(''));
	}
	if (sequence.first().instanceOfType('node()')) {
		return Sequence.singleton(sequence.first().getStringValue(dynamicContext));
	}
	return Sequence.singleton(castToType(sequence.first(), 'xs:string'));
}

// Note: looks like fn:string, but that one can return string values, instead of formally casting the node. This will make a difference when schema-aware (node with type xs:boolean, with value 1)
function xsString (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.first(), 'xs:string'));
}

function fnStringJoin (_dynamicContext, sequence, separator) {
	const separatorString = separator.first().value;
	const joinedString = Array.from(sequence.value()).map(function (stringValue) {
		return stringValue.value;
	}).join(separatorString);
	return Sequence.singleton(new StringValue(joinedString));
}

function fnStringLength (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(new IntegerValue(0));
	}
	// In ES6, Array.from(💩).length === 1
	return Sequence.singleton(new IntegerValue(Array.from(sequence.first().value).length));
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
				return new StringValue(token);
			}));
}

function xsUntypedAtomic (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.empty();
	}
	return Sequence.singleton(castToType(sequence.first(), 'xs:untypedAtomic'));
}

function fnNormalizeSpace (_dynamicContext, arg) {
	if (arg.isEmpty()) {
		return Sequence.singleton(new StringValue(''));
	}
	const string = arg.first().value.trim();
	return Sequence.singleton(new StringValue(string.replace(/\s+/g, ' ')));
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
			name: 'xs:string',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:string?',
			callFunction: xsString
		},

		{
			name: 'xs:untypedAtomic',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:untypedAtomic?',
			callFunction: xsUntypedAtomic
		},

		{
			name: 'string-join',
			argumentTypes: ['xs:string*', 'xs:string'],
			returnType: 'xs:string',
			callFunction: fnStringJoin
		},

		{
			name: 'string-join',
			argumentTypes: ['xs:string*'],
			returnType: 'xs:string',
			callFunction: function (dynamicContext, arg1) {
				return fnStringJoin(dynamicContext, arg1, Sequence.singleton(new StringValue('')));
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
				return fnTokenize(dynamicContext, fnNormalizeSpace(dynamicContext, input), Sequence.singleton(new StringValue(' ')));
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
