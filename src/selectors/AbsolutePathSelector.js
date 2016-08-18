define([
	'fontoxml-blueprints',
	'./Selector',
	'./dataTypes/Sequence'
], function (
	blueprints,
	Selector,
	Sequence
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  relativePathSelector
	 */
	function AbsolutePathSelector (relativePathSelector) {
		Selector.call(this, relativePathSelector.specificity);

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
			blueprint = dynamicContext.blueprint;
		// Assume this is the start, so only one node
		return this._relativePathSelector.evaluate({
			contextItem: Sequence.singleton(blueprintQuery.getDocumentNode(blueprint, nodeSequence.value[0])),
			contextSequence: null,
			blueprint
		});
	};

	return AbsolutePathSelector;
});
