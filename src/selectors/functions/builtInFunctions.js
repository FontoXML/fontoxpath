define([
	'fontoxml-blueprints',

	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue',
	'../dataTypes/StringValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/DoubleValue',
	'../dataTypes/QNameValue'
], function (
	blueprints,

	Sequence,
	BooleanValue,
	StringValue,
	IntegerValue,
	DoubleValue,
	QNameValue
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	function fnNot (dynamicContext, sequence) {
		return Sequence.singleton(new BooleanValue(!sequence.getEffectiveBooleanValue()));
	}

	function fnTrue () {
		return Sequence.singleton(new BooleanValue(true));
	}

	function fnFalse () {
		return Sequence.singleton(new BooleanValue(false));
	}

	function fnCount (dynamicContext, sequence) {
		return Sequence.singleton(new IntegerValue(sequence.value.length));
	}

	function fnPosition (dynamicContext) {
		// Note: +1 because XPath is one-based
		return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.indexOf(dynamicContext.contextItem.value[0]) + 1));
	}

	function fnLast (dynamicContext) {
		return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
	}

	function opTo (dynamicContext, fromValue, toValue) {
		var from = fromValue.value[0].value,
		to = toValue.value[0].value;

		if (from > to) {
			return Sequence.empty();
		}

		// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
		return new Sequence(
			Array.apply(null, {length: to - from + 1})
				.map(function (_, i) {
					return new IntegerValue(from+i);
				}));
	}

	function fnConcat (dynamicContext) {
		var stringSequences = Array.from(arguments).slice(1);
		stringSequences = stringSequences.map(function (sequence) { return sequence.atomize(); });
		var strings = stringSequences.map(function (sequence) {
				return sequence.value[0].value;
			});

		// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
		return Sequence.singleton(new StringValue(strings.join('')));
	}

	function fnBoolean (dynamicContext, sequence) {
		return Sequence.singleton(new BooleanValue(sequence.getEffectiveBooleanValue()));
	}

	function fnString (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return Sequence.singleton(new StringValue(''));
		}

		if (sequence.value[0].instanceOfType('node()')) {
			return Sequence.singleton(sequence.value[0].getStringValue());
		}

		return Sequence.singleton(StringValue.cast(sequence.value[0]));
	}

	function fnNormalizeSpace (dynamicContext, arg) {
		if (arg.isEmpty()) {
			return Sequence.singleton(new StringValue(''));
		}
		var string = arg.value[0].value;
		return Sequence.singleton(new StringValue(string.replace(/\s\s/g, ' ')));
	}

	function fnTokenize (dynamicContext, input, pattern, flags) {
		if (input.isEmpty() || input.value[0].value.length === 0) {
			return Sequence.empty();
		}

		var string = input.value[0].value,
			patternString = pattern.value[0].value;

		return new Sequence(
			string.split(new RegExp(patternString))
				.map(function (token) {return new StringValue(token);}));
	}

	function fnStringLength (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return Sequence.singleton(new IntegerValue(0));
		}

		// In ES6, Array.from(💩).length === 1
		return Sequence.singleton(new IntegerValue(Array.from(sequence.value[0].value).length));
	}

	function fnNumber (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return Sequence.singleton(new DoubleValue(NaN));
		}

		return Sequence.singleton(DoubleValue.cast(sequence.value[0]));
	}

	function fnStringJoin (dynamicContext, sequence, separator) {
		var separatorString = separator.value[0].value,
			joinedString = sequence.value.map(function (stringValue) {
					return stringValue.value;
			}).join(separatorString);
		return Sequence.singleton(new StringValue(joinedString));
	}

	function fontoMarkupLabel (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}
		return Sequence.singleton(new StringValue(sequence.value[0].value.nodeName));
	}

	function contextItemAsFirstArgument (fn, dynamicContext) {
		return fn(dynamicContext, dynamicContext.contextItem);
	}

	function fnNodeName (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}

		return Sequence.singleton(new QNameValue(sequence.value[0].nodeName));
	}

	function fnName (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}

		return fnString(dynamicContext, fnNodeName(dynamicContext, sequence));
	}

	function fnReverse (dynamicContext, sequence) {
		return new Sequence(sequence.value.reverse());
	}

	return [
		{
			name: 'not',
			typeDescription: ['item()*'],
			callFunction: fnNot
		},
		{
			name: 'true',
			typeDescription: [],
			callFunction: fnTrue
		},
		{
			name: 'false',
			typeDescription: [],
			callFunction: fnFalse
		},
		{
			name: 'count',
			typeDescription: ['item()*'],
			callFunction: fnCount
		},
		{
			name: 'position',
			typeDescription: [],
			callFunction: fnPosition
		},
		{
			name: 'last',
			typeDescription: [],
			callFunction: fnLast
		},
		{
			name: 'op:to',
			typeDescription: ['xs:integer', 'xs:integer'],
			callFunction: opTo
		},
		{
			name: 'concat',
			typeDescription: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
			callFunction: fnConcat
		},
		{
			name: 'boolean',
			typeDescription: ['item()*'],
			callFunction: fnBoolean
		},
		{
			name: 'string',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnString)
		},
		{
			name: 'string',
			typeDescription: ['item()?'],
			callFunction: fnString
		},
		{
			name: 'normalize-space',
			typeDescription: [],
			callFunction: function (dynamicContext) {
				return fnNormalizeSpace(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
			}
		},
		{
			name: 'normalize-space',
			typeDescription: ['xs:string?'],
			callFunction: fnNormalizeSpace
		},
		{
			name: 'tokenize',
			typeDescription: ['xs:string?'],
			callFunction: function (dynamicContext, input) {
				return fnTokenize(dynamicContext, fnNormalizeSpace(dynamicContext, input), Sequence.singleton(new StringValue(' ')));
			}
		},
		{
			name: 'tokenize',
			typeDescription: ['xs:string?', 'xs:string'],
			callFunction: fnTokenize
		},
		{
			name: 'tokenize',
			typeDescription: ['xs:string?', 'xs:string', 'xs:string'],
			callFunction: function (dynamicContext, input, pattern, flags) {
				throw new Error('Not implemented: Using flags in tokenize is not supported');
			}
		},
		{
			name: 'string-length',
			typeDescription: [],
			callFunction: function (dynamicContext) {
				return fnStringLength(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
			}
		},
		{
			name: 'string-length',
			typeDescription: ['xs:string?'],
			callFunction: fnStringLength
		},
		{
			name: 'number',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNumber)
		},
		{
			name: 'number',
			typeDescription: ['xs:anyAtomicType?'],
			callFunction: fnNumber
		},
		{
			name: 'node-name',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNodeName)
		},
		{
			name: 'node-name',
			typeDescription: ['node()?'],
			callFunction: fnNodeName
		},
		{
			name: 'name',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnName)
		},
		{
			name: 'name',
			typeDescription: ['node()?'],
			callFunction: fnName
		},
		{
			name: 'reverse',
			typeDescription: ['item()*'],
			callFunction: fnReverse
		},
		{
			name: 'string-join',
			typeDescription: ['xs:string*', 'xs:string'],
			callFunction: fnStringJoin
		},
		{
			name: 'string-join',
			typeDescription: ['xs:string*'],
			callFunction: function (dynamicContext, arg1) {
				return fnStringJoin(dynamicContext, arg1, Sequence.singleton(new StringValue('')));
			}
		},
		{
			name: 'fonto:markupLabel',
			typeDescription: ['node()'],
			callFunction: fontoMarkupLabel
		}
	];
});
