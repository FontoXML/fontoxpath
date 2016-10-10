define([
	'../dataTypes/BooleanValue',
	'../dataTypes/DecimalValue',
	'../dataTypes/DoubleValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/StringValue',

	'../Specificity',
	'../Selector',
	'../dataTypes/Sequence'
], function (
	BooleanValue,
	DecimalValue,
	DoubleValue,
	IntegerValue,
	StringValue,

	Specificity,
	Selector,
	Sequence
) {
	'use strict';

	function Literal (value, type) {
		Selector.call(this, new Specificity({}), Selector.RESULT_ORDER_UNSORTED);
		this._type = type;

		var typedValue;
		switch (type) {
			case 'xs:integer':
				typedValue = new IntegerValue(value);
				break;
			case 'xs:string':
				typedValue = new StringValue(value);
				break;
			case 'xs:decimal':
				typedValue = new DecimalValue(value);
				break;
			case 'xs:double':
				typedValue = new DoubleValue(value);
				break;
			case 'xs:boolean':
				typedValue = value ? BooleanValue.TRUE : BooleanValue.FALSE;
				break;
			default:
				throw new TypeError('Type ' + type + ' not expected in a literal');
		}

		this._valueSequence = Sequence.singleton(typedValue);
	}

	Literal.prototype = Object.create(Selector.prototype);
	Literal.prototype.constructor = Literal;

	Literal.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof Literal &&
			this._type === otherSelector._type &&
			this._valueSequence.length === otherSelector._valueSequence.length &&
			this._valueSequence.value.every(function (xPathValue, i) {
				return otherSelector._valueSequence.value[i].primitiveTypeName === xPathValue.primitiveTypeName &&
					otherSelector._valueSequence.value[i].value === xPathValue.value;
			});
	};

	Literal.prototype.evaluate = function (dynamicContext) {
		return this._valueSequence;
	};

	Literal.prototype.matches = function (node, blueprint) {
		return !!this._valueSequence;
	};

	return Literal;
})

;
