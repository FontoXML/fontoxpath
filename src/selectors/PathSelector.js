define([
	'fontoxml-blueprints',
	'./Selector',
	'./Specificity'
], function (
	blueprints,
	Selector,
	Specificity
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector[]}  stepSelectors
	 */
	function PathSelector (stepSelectors) {
		Selector.call(this, stepSelectors.reduce(function (specificity, selector) {
			// Implicit AND, so sum
			return specificity.add(selector.specificity);
		}, new Specificity({})));

		this._stepSelectors = stepSelectors;
	}

	PathSelector.prototype = Object.create(Selector.prototype);
	PathSelector.prototype.constructor = PathSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	PathSelector.prototype.matches = function (node, blueprint) {
		// TODO: optimize by doing a depth first search instead of a full one
		// On the other hand, rewrite it using predicates, you lazy son of a hamster
		var intermediateResults = [node],
			newResults = [];
		for (var i = 0, l = this._stepSelectors.length; i < l; ++i) {
			var selector = this._stepSelectors[i];

			for (var j = 0, k = intermediateResults.length; j < k; ++j) {
				Array.prototype.push.apply(newResults, selector.walkStep(intermediateResults[j], blueprint));
			}

			if (!newResults.length) {
				return false;
			}
			intermediateResults = newResults;
			newResults = [];
		}

		return !!intermediateResults.length;
	};

	PathSelector.prototype.equals = function (otherSelector) {
		return otherSelector instanceof PathSelector &&
			this._stepSelectors.length === otherSelector._stepSelectors.length &&
			this._stepSelectors.every(function (selector, i) {
				return otherSelector._stepSelectors[i].equals(selector);
			});
	};

	PathSelector.prototype.walkStep = function (nodes, blueprint) {
		var intermediateResults = nodes,
			newResults = [];
		for (var i = 0, l = this._stepSelectors.length; i < l; ++i) {
			var selector = this._stepSelectors[i];

			newResults = selector.walkStep(intermediateResults, blueprint);

			if (!newResults.length) {
				return [];
			}
			intermediateResults = newResults;
			newResults = [];
		}

		return intermediateResults;
	};


	return PathSelector;
});
