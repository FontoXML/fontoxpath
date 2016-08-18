define([
	'../../dataTypes/Sequence',
	'../../dataTypes/DoubleValue',
	'../../Selector'
], function (
	Sequence,
	DoubleValue,
	Selector
) {
	'use strict';

	/**
	 * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
	 * @param  {string}    kind       Either + or -
	 * @param  {Selector}  valueExpr  The selector evaluating to the value to process
	 */
	function Unary (kind, valueExpr) {
		Selector.call(this, valueExpr.specificity);
		this._valueExpr = valueExpr;

		this._kind = kind;
	}

	Unary.prototype = Object.create(Selector.prototype);
	Unary.prototype.constructor = Unary;

	Unary.prototype.evaluate = function (dynamicContext) {
		var valueSequence = this._valueExpr.evaluate(dynamicContext);
		if (valueSequence.isEmpty()) {
			return Sequence.singleton(new DoubleValue(Number.NaN));
		}

		var value = valueSequence.value[0].atomize();
		if (value.primitiveType === 'xs:integer' ||
			value.primitiveType === 'xs:decimal' ||
			value.primitiveType === 'xs:double' ||
			value.primitiveType === 'xs:float') {

			if (this._kind === '-') {
				// TODO: clone
				value.value = -value.value;
			}
			return Sequence.singleton(value);
		}

		return Sequence.singleton(new DoubleValue(Number.NaN));
	};

	return Unary;
});
