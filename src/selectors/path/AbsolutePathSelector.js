define([
	'../Selector',
	'../dataTypes/Sequence',
	'../dataTypes/NodeValue'
], function (
	Selector,
	Sequence,
	NodeValue
) {
	'use strict';

	/**
	 * @param  {Selector}  relativePathSelector
	 */
	function AbsolutePathSelector (relativePathSelector) {
		Selector.call(this, relativePathSelector.specificity, Selector.RESULT_ORDER_SORTED);

		this._relativePathSelector = relativePathSelector;
	}

	AbsolutePathSelector.prototype = Object.create(Selector.prototype);
	AbsolutePathSelector.prototype.constructor = AbsolutePathSelector;

	AbsolutePathSelector.prototype.equals = function (otherSelector) {
		return otherSelector instanceof AbsolutePathSelector &&
			this._relativePathSelector.equals(otherSelector._relativePathSelector);
	};

	AbsolutePathSelector.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;
		var node = nodeSequence.value[0].value;
		var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		return this._relativePathSelector.evaluate(
			dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(
					new NodeValue(domFacade, documentNode)),
				contextSequence: null
			}));
	};

	return AbsolutePathSelector;
});
