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
		Selector.call(this, new Specificity({}));
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
				typedValue = new BooleanValue(value);
				break;
			default:
				throw new TypeError('Type ' + type + ' not expected in a literal');
		}

		this._value = Sequence.singleton(typedValue);
	}

	Literal.prototype = Object.create(Selector.prototype);
	Literal.prototype.constructor = Literal;

	Literal.prototype.evaluate = function (dynamicContext) {
		return this._value;
	};

	Literal.prototype.matches = function (node, blueprint) {
		return !!this._value;
	};

	return Literal;
});
