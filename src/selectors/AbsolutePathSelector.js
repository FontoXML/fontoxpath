define([
	'fontoxml-blueprints',
	'./Selector'
], function (
	blueprints,
	Selector
) {
	'use strict';

	/**
	 * @param  {Selector}  relativePathSelector
	 */
	function AbsolutePathSelector (relativePathSelector) {
		Selector.call(this, relativePathSelector.specificity);

		this._relativePathSelector = relativePathSelector;
	}

	AbsolutePathSelector.prototype = Object.create(Selector.prototype);
	AbsolutePathSelector.prototype.constructor = AbsolutePathSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AbsolutePathSelector.prototype.matches = function (node, blueprint) {
		return this._selector.matches(node.ownerDocument, blueprint);
	};

	AbsolutePathSelector.prototype.equals = function (otherSelector) {
		return otherSelector instanceof AbsolutePathSelector &&
			this._relativePathSelector.equals(otherSelector.relativePathSelector);
	};

	AbsolutePathSelector.prototype.walkStep = function (nodes, blueprint) {
		// Assume this is the star, so only one node
		return this._relativePathSelector.walkStep([nodes[0].ownerDocument], blueprint);
	};

	return AbsolutePathSelector;
});
