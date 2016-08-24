define([
	'fontoxml-blueprints',

	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue',
	'../dataTypes/StringValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/DoubleValue'
], function (
	blueprints,

	Sequence,
	BooleanValue,
	StringValue,
	IntegerValue,
	DoubleValue
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	function isValidArgument (typeDescription, argument) {
		// typeDescription is something like 'xs:string?'
		var parts = typeDescription.match(/^([^+?*]*)([\+\*\?])?$/);
		var type = parts[1],
			multiplicity = parts[2];
		switch (multiplicity) {
			case '?':
				if (!argument.isEmpty() && !argument.isSingleton()) {
					return false;
				}
				break;

			case '+':
				if (!argument.isEmpty()) {
					return false;
				}
				break;

			case '*':
				break;

			default:
				if (!argument.isSingleton()) {
					return false;
				}
		}

		return argument.value.every(function (argumentItem) {
			// Item is a special case which matches anything
			return type === 'item()' || argumentItem.instanceOfType(type);
		});
	}

	function isValidArgumentList (typeDeclarations, argumentList) {
		return argumentList.length === typeDeclarations.length &&
			argumentList.every(function (argument, i) {
				return isValidArgument(typeDeclarations[i], argument);
			});
	}
	function fnNot (dynamicContext, sequence) {
		if (!isValidArgumentList(['item()*'], [sequence])) {
			throw new Error('No such function not(???). Did you mean not($a as item()*)?');
		}
		return Sequence.singleton(new BooleanValue(!sequence.getEffectiveBooleanValue()));
	}

	function fnTrue () {
		return Sequence.singleton(new BooleanValue(true));
	}
	function fnFalse () {
		return Sequence.singleton(new BooleanValue(false));
	}
	function fnCount (dynamicContext, sequence) {
		if (!isValidArgumentList(['item()*'], [sequence])) {
			throw new Error('No such function count(???). Did you mean not($a as xs:item()*)?');
		}
		return Sequence.singleton(new IntegerValue(sequence.value.length));
	}
	function fnPosition (blueprint, contextSequence, contextItem) {
		// Note: +1 because XPath is one-based
		return Sequence.singleton(new IntegerValue(contextSequence.value.indexOf(contextItem) + 1));
	}
	function fnLast (dynamicContext) {
		return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
	}
	function opTo (dynamicContext, fromValue, toValue) {
		if (!isValidArgumentList(['xs:integer', 'xs:integer'], [fromValue, toValue])) {
			throw new Error('No such function range(). Did your mean range($a as xs:integer, $b as xs:integer)?');
		}

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
		if (!stringSequences.length) {
			throw new Error('No such function fn:concat(). Did your mean concat($a as xs:anyAtomicValue, $a as xs:anyAtomicValue, ...)?');
		}

		stringSequences = stringSequences.map(function (sequence) { return sequence.atomize(); });
		var strings = stringSequences.map(function (sequence) {
				return sequence.value[0].value;
			});

		// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
		return Sequence.singleton(new StringValue(strings.join('')));
	}
	function fnBoolean (dynamicContext, sequence) {
		if (!isValidArgumentList(['item()*'], [sequence])) {
			throw new Error('No such function boolean(). Did your mean boolean($arg as item()*)?');
		}

		return Sequence.singleton(new BooleanValue(sequence.getEffectiveBooleanValue()));
	}

	function fnString (dynamicContext, sequence) {
		if (!sequence) {
			sequence = dynamicContext.contextItem;
		}

		if (!isValidArgumentList(['item()?'], [sequence])) {
			throw new Error('FOTY0014: The argument to fn:string() is a function item.');
		}

		if (sequence.isEmpty()) {
			return Sequence.singleton(new StringValue(''));
		}

		if (sequence.value[0].instanceOfType('node()')) {
			return Sequence.singleton(new StringValue(blueprintQuery.getTextContent(dynamicContext.domFacade, sequence.value[0])));
		}

		return Sequence.singleton(StringValue.cast(sequence.value[0]));
	}
	function fnNormalizeSpace (dynamicContext, arg) {
		if (!arg) {
			arg = fnString(dynamicContext, dynamicContext.contextItem);
		}
		if (!isValidArgumentList(['xs:string?'], [arg])) {
			throw new Error('No such function normalize-space(). Did you mean normalize-space($arg as xs:string?))?');
		}
		if (arg.isEmpty()) {
			return Sequence.singleton(new StringValue(''));
		}
		var string = arg.value[0].value;
		return Sequence.singleton(new StringValue(string.replace(/\s\s/g, ' ')));
	}

	function fnTokenize (dynamicContext, input, pattern, flags) {
		if (flags) {
			throw new Error('Using flags in tokenize is not supported');
		}

		if (!pattern) {
			pattern = Sequence.singleton(new StringValue(' '));
			input = fnNormalizeSpace(dynamicContext, input);
		}
		if (!isValidArgumentList(['xs:string?', 'xs:string'], [input, pattern])) {
			throw new Error('No such function tokenize(). Did you mean tokenize($input as xs:string?, $pattern as xs:string) or tokenize($input as xs:string()?)?');
		}

		if (input.isEmpty() || input.value[0].value.length === 0) {
			return new Sequence([]);
		}

		var string = input.value[0].value,
			pattern = pattern ? pattern.value[0].value : ' ';

		return new Sequence(
			string.split(new RegExp(pattern))
				.map(function (token) {return new StringValue(token);}));
	}
	function fnStringLength (dynamicContext, sequence) {
		if (!sequence) {
			sequence = fnString(dynamicContext, dynamicContext.contextItem);
		}
		if (!isValidArgumentList(['string()?'], [sequence])) {
			throw new Error('FOTY0014: The argument to fn:string() is a function item.');
		}

		if (sequence.isSingleton()) {
			return Sequence.singleton(new IntegerValue(0));
		}

		// In ES6, Array.from(💩).length === 1
		return Sequence.singleton(new IntegerValue(Array.from(sequence.value[0].value).length));
	}

	function fnNumber (dynamicContext, sequence) {
		if (!sequence) {
			sequence = dynamicContext.contextItem;
		}

		if (sequence.isEmpty()) {
			return Sequence.singleton(new DoubleValue(NaN));
		}

		return Sequence.singleton(DoubleValue.cast(sequence.value[0]));
	}

	function fontoMarkupLabel (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}
		return Sequence.singleton(new StringValue(sequence.value[0].value.nodeName));
	}

	return {
		'not': fnNot,
		'true': fnTrue,
		'false': fnFalse,
		'count': fnCount,
		'position': fnPosition,
		'last': fnLast,
		'op:to': opTo,
		'concat': fnConcat,
		'boolean': fnBoolean,
		'string': fnString,
		'normalize-space': fnNormalizeSpace,
		'tokenize': fnTokenize,
		'string-length': fnStringLength,
		'number': fnNumber,
		'fonto:markupLabel': fontoMarkupLabel
	};
});
