define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'./Selector',
	'./Specificity',
	'./dataTypes/Sequence',
	'./dataTypes/NodeValue',
	'./dataTypes/AttributeNodeValue'
], function (
	blueprints,
	getNodeId,
	Selector,
	Specificity,
	Sequence,
	NodeValue,
	AttributeNodeValue
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector[]}  stepSelectors
	 */
	function PathSelector (stepSelectors) {
		Selector.call(
			this,
			stepSelectors.reduce(function (specificity, selector) {
				// Implicit AND, so sum
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			Selector.RESULT_ORDER_SORTED);

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
				Array.prototype.push.apply(newResults, selector.evaluate({
					contextItem: intermediateResults[j],
					domFacade: blueprint
				}));
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

	PathSelector.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			sequenceIsSorted = true;

		var result = this._stepSelectors.reduce(function (intermediateResultNodes, selector) {
				var resultValues = [];
				var hasResultValuesByNodeId = Object.create(null);
				intermediateResultNodes.forEach(function (nodeValue) {
					var newResults = selector.evaluate(dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(nodeValue),
							contextSequence: null
						}));

					if (newResults.isEmpty()) {
						return;
					}

					var sortedResultNodes;
					switch (selector.expectedResultOrder) {
						case Selector.RESULT_ORDER_SORTED:
							sortedResultNodes = newResults.value;
							break;
						case Selector.RESULT_ORDER_REVERSE_SORTED:
							sortedResultNodes = newResults.value.reverse();
							break;
						case Selector.RESULT_ORDER_UNSORTED:
							sequenceIsSorted = false;
							sortedResultNodes = newResults.value;
					}

					sortedResultNodes.forEach(function (newResult) {
						if (!(newResult instanceof NodeValue)) {
							throw new Error('err:XPTY0019: The / operator can only be applied to xml/json nodes.');
						}
						if (hasResultValuesByNodeId[newResult.nodeId]) {
							return;
						}
						// Because the intermediateResults are ordered, and these results are ordered too, we should be able to dedupe and concat these results
						hasResultValuesByNodeId[newResult.nodeId] = true;
						resultValues.push(newResult);
					});
				}, []);

				return resultValues;
			}, nodeSequence.value);

		var domFacade = dynamicContext.domFacade;
		if (!sequenceIsSorted) {
			result.sort(function (valueA, valueB) {
				if (valueA instanceof AttributeNodeValue && !(valueB instanceof AttributeNodeValue)) {
					if (domFacade.getParentNode(valueA) === valueB) {
						// Same element, so A
						return 1;
					}
					valueA = domFacade.getParentNode(valueA);
				} else if (valueB instanceof AttributeNodeValue && !(valueA instanceof AttributeNodeValue)) {
					if (domFacade.getParentNode(valueB) === valueA) {
						// Same element, so B before A
						return -1;
					}
					valueB = domFacade.getParentNode(valueB);
				} else if (valueA instanceof AttributeNodeValue && valueA instanceof AttributeNodeValue) {
					if (domFacade.getParentNode(valueA) === domFacade.getParentNode(valueB)) {
						// Sort on attributes name
						return valueA.name > valueB.name ? 1 : -1;
					}
					valueA = domFacade.getParentNode(valueA);
					valueB = domFacade.getParentNode(valueB);
				}

				return blueprintQuery.compareNodePositions(dynamicContext.domFacade, valueA, valueB);
			})
				.filter(function (nodeValue, i, sortedNodes) {
					if (i === 0) {
						return true;
					}
					return nodeValue.nodeId !== sortedNodes[i - 1].nodeId;
				});

		}

		return new Sequence(result);
	};


	return PathSelector;
});
