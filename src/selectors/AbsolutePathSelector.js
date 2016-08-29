define([
	'fontoxml-blueprints',
	'./Selector',
	'./dataTypes/Sequence',
	'./dataTypes/NodeValue'
], function (
	blueprints,
	Selector,
	Sequence,
	NodeValue
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

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
			this._relativePathSelector.equals(otherSelector.relativePathSelector);
	};

	AbsolutePathSelector.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;
		// Assume this is the start, so only one node
		return this._relativePathSelector.evaluate(
			dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(
					new NodeValue(domFacade, blueprintQuery.getDocumentNode(domFacade, nodeSequence.value[0].value))),
				contextSequence: null
			}));
	};

	return AbsolutePathSelector;
});
