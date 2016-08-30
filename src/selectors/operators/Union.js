define([
	'fontoxml-dom-identification/getNodeId',
	'../Specificity',
	'../Selector',
	'../dataTypes/Sequence',
	'../dataTypes/sortNodeValues'
], function (
	getNodeId,
	Specificity,
	Selector,
	Sequence,
	sortNodeValues
) {
	'use strict';

	/**
	 * The 'union' combining selector, or when matching, concats otherwise.
	 * order is undefined.
	 * @param  {Selector[]}  selectors
	 */
	function Union (selectors) {
		Selector.call(
			this,
			selectors.reduce(function (maxSpecificity, selector) {
				if (maxSpecificity.compareTo(selector.specificity) > 0) {
					return maxSpecificity;
				}
				return selector.specificity;
			}, new Specificity({})),
			Selector.RESULT_ORDER_UNSORTED);

		this._subSelectors = selectors;
	}

	Union.prototype = Object.create(Selector.prototype);
	Union.prototype.constructor = Union;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	Union.prototype.matches = function (node, blueprint) {
		return this._subSelectors.some(function (subSelector) {
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

	Union.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof Union &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	Union.prototype.evaluate = function (dynamicContext) {
		var nodeValueById = this._subSelectors.reduce(function (resultingNodeById, selector) {
				var results = selector.evaluate(dynamicContext);
				var allItemsAreNode = results.value.every(function (valueItem) {
						return valueItem.instanceOfType('node()');
					});

				if (!allItemsAreNode) {
					throw new Error('ERRXPTY0004: The sequences to union are not of type node()*');
				}
				results.value.forEach(function (nodeValue) {
					resultingNodeById[getNodeId(nodeValue.value)] = nodeValue;
				});
				return resultingNodeById;
			}, Object.create(null));

		var sortedValues = sortNodeValues(dynamicContext.domFacade, Object.keys(nodeValueById).map(function (nodeId) {
				return nodeValueById[nodeId];
			}));
		return new Sequence(sortedValues);
	};
	return Union;
});
