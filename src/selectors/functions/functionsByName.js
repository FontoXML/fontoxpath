define([
	'fontoxml-dom-utils',

	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue',
	'../dataTypes/StringValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/DoubleValue'
], function (
	domUtils,

	Sequence,
	BooleanValue,
	StringValue,
	IntegerValue,
	DoubleValue
) {
	'use strict';

	var domQuery = domUtils.domQuery;

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

	return {
		'not': function (dynamicContext, sequence) {
			if (!isValidArgumentList(['item()*'], [sequence])) {
				throw new Error('No such function not(???). Did you mean not($a as item()*)?');
			}
			return Sequence.singleton(new BooleanValue(!sequence.getEffectiveBooleanValue()));
		},
		'true': function () {
			return Sequence.singleton(new BooleanValue(true));
		},
		'false': function () {
			return Sequence.singleton(new BooleanValue(false));
		},
		'count': function (dynamicContext, sequence) {
			if (!isValidArgumentList(['item()*'], [sequence])) {
				throw new Error('No such function count(???). Did you mean not($a as xs:item()*)?');
			}
			return Sequence.singleton(new IntegerValue(sequence.value.length));
		},
		'position': function (blueprint, contextSequence, contextItem) {
			// Note: +1 because XPath is one-based
			return Sequence.singleton(new IntegerValue(contextSequence.value.indexOf(contextItem) + 1));
		},
		'last': function (dynamicContext) {
			return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
		},
		'op:to': function (dynamicContext, fromValue, toValue) {
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
		},
		'concat': function (dynamicContext) {
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
		},
		'boolean': function (dynamicContext, sequence) {
			if (!isValidArgumentList(['item()*'], [sequence])) {
				throw new Error('No such function boolean(). Did your mean boolean($arg as item()*)?');
			}

			return Sequence.singleton(new BooleanValue(sequence.getEffectiveBooleanValue()));
		},
		'string': function (dynamicContext, sequence) {
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
				return Sequence.singleton(new StringValue(domQuery.getTextContent(sequence.value[0])));
			}

			return Sequence.singleton(StringValue.cast(sequence.value[0]));
		},
		'number': function (dynamicContext, sequence) {
			if (!sequence) {
				sequence = dynamicContext.contextItem;
			}

			if (sequence.isEmpty()) {
				return Sequence.singleton(new DoubleValue('NaN'));
			}

			return Sequence.singleton(DoubleValue.cast(sequence.value[0]));
		}
	};
});
