define([
	'../Selector',
	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence'
], function (
	Selector,
	BooleanValue,
	Sequence
) {
	'use strict';

	function QuantifiedExpression (quantifier, inClauses, satisfiesExpr) {
		var specificity = inClauses.reduce(
				function (specificity, inClause) {
					return specificity.add(inClause[1].specificity);
				}, satisfiesExpr.specificity);
		Selector.call(this, specificity, Selector.RESULT_ORDER_SORTED);

		this._quantifier = quantifier;
		this._inClauses = inClauses;
		this._satisfiesExpr = satisfiesExpr;
	}

	QuantifiedExpression.prototype = Object.create(Selector.prototype);
	QuantifiedExpression.prototype.constructor = QuantifiedExpression;

	QuantifiedExpression.prototype.equals = function (otherSelector) {
		if (otherSelector === this) {
			return true;
		}

		if (this._inClauses.length !== otherSelector._inClauses.length) {
			return false;
		}

		return otherSelector instanceof QuantifiedExpression &&
			this._quantifier === otherSelector._quantifier &&
			this._satisfiesExpr.equals(otherSelector._satisfiesExpr) &&
			this._inClauses.every(function (inClause, index) {
				return inClause[0] === otherSelector._inClauses[index][0] &&
					inClause[1].equals(otherSelector._inClauses[index][1]);
			});
	};

	QuantifiedExpression.prototype.evaluate = function (dynamicContext) {
		var evaluatedInClauses = this._inClauses.map(function (inClause) {
				return {
					name: inClause[0],
					valueSequence: inClause[1].evaluate(dynamicContext)
				};
			});

		var indices = new Array(evaluatedInClauses.length).fill(0);
		indices[0] = -1;

		var hasOverflowed = true;
		while (hasOverflowed) {
			hasOverflowed = false;
			for (var i in indices) {
				if (++indices[i] > evaluatedInClauses[i].valueSequence.value.length - 1) {
					indices[i] = 0;
					continue;
				}

				var variables = Object.create(null);

				for (var y = 0; y < indices.length; y++) {
					var value = evaluatedInClauses[y].valueSequence.value[indices[y]];
					variables[evaluatedInClauses[y].name] = Sequence.singleton(value);
				}

				var context = dynamicContext.createScopedContext({
						variables: variables
					});

				var result = this._satisfiesExpr.evaluate(context);

				if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
					return Sequence.singleton(BooleanValue.TRUE);
				}
				else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
					return Sequence.singleton(BooleanValue.FALSE);
				}
				hasOverflowed = true;
				break;
			}
		}

		// An every quantifier is true if all items match, a some is false if none of the items match
		return Sequence.singleton(this._quantifier === 'every' ? BooleanValue.TRUE : BooleanValue.FALSE);
	};

	return QuantifiedExpression;
});
