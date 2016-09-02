define([
	'./Selector',
	'./Specificity',
	'./dataTypes/Sequence'
], function (
	Selector,
	Specificity,
	Sequence
) {
	'use strict';

	/**
	 * @param  {String}    rangeVariable
	 * @param  {Selector}  bindingSequence
	 * @param  {Selector}  returnExpression
	 */
	function LetExpression (rangeVariable, bindingSequence, returnExpression) {
		Selector.call(
			this, bindingSequence.specificity.add(returnExpression.specificity),
			returnExpression.expectedResultOrder);

		this._rangeVariable = rangeVariable;
		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;
	}

	LetExpression.prototype = Object.create(Selector.prototype);
	LetExpression.prototype.constructor = LetExpression;

	LetExpression.prototype.equals = function (otherSelector) {
		if (otherSelector === this) {
			return true;
		}

		return otherSelector instanceof LetExpression &&
			this._rangeVariable === otherSelector._rangeVariable &&
			this._bindingSequence.equals(otherSelector._bindingSequence) &&
			this._returnExpression.equals(otherSelector._returnExpression);
	};

	LetExpression.prototype.evaluate = function (dynamicContext) {
		var newVariables = Object.create(null);
		newVariables[this._rangeVariable] = this._bindingSequence.evaluate(dynamicContext);
		return this._returnExpression.evaluate(
			dynamicContext.createScopedContext({
				variables: newVariables
			}));
	};


	return LetExpression;
});
