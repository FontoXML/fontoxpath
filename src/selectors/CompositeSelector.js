define([
	'./Selector'
], function (
	Selector
	) {
	'use strict';

	/**
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	function CompositeSelector (firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));

		this._subSelectors = [];
		if (firstSelector instanceof CompositeSelector) {
			this._subSelectors = firstSelector._subSelectors.concat();
		}
		else {
			this._subSelectors.push(firstSelector);
		}

		this._subSelectors.push(secondSelector);
	}

	CompositeSelector.prototype = Object.create(Selector.prototype);
	CompositeSelector.prototype.constructor = CompositeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	CompositeSelector.prototype.matches = function (node, blueprint) {
		return this._subSelectors.every(function (subSelector) {
			return subSelector.matches(node, blueprint);
		});
	};

	function isSameSetOfSelectors (selectors1, selectors2) {
		if (selectors1.length !== selectors2.length) {
			return false;
		}

		// Compare arrays of selectors, allowing of variance in ordering only
		var matchedSelectors = new Array(selectors1.length).fill(false);
		return selectors1.every(function (selector1) {
			// See if there is an unmatched value present in the other array
			return selectors2.find(function (selector2, i) {
				if (matchedSelectors[i]) {
					// Already matched
					return false;
				}
				if (selector1.equals(selector2)) {
					// Mark as matched
					matchedSelectors[i] = true;
					return true;
				}
				return false;
			});
		});
	}

	CompositeSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof CompositeSelector &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	return CompositeSelector;
});
