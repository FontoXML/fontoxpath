define([
	'./Selector',
	'./SimpleSelector',
	'./SimpleSelectorSequenceSelector',
	'./Specificity'
], function (
	Selector,
	SimpleSelector,
	SimpleSelectorSequenceSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {String}  attributeName
	 * @param  {String}  [attributeValue]  if omitted, the selector matches if the attribute is present
	 */
	function AttributeSelector (attributeName, attributeValue) {
		SimpleSelector.call(this, new Specificity({attribute: 1}));

		this._attributeName = attributeName;
		this._attributeValue = attributeValue;
	}

	AttributeSelector.prototype = Object.create(SimpleSelector.prototype);
	AttributeSelector.prototype.constructor = AttributeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AttributeSelector.prototype.matches = function (node, blueprint) {
		if (this._attributeValue === undefined) {
			return blueprint.hasAttribute(node, attributeName);
		}

		return blueprint.getAttribute(node, attributeName) === attributeValue;
	};

	/**
	 * @param  {String}  attributeName
	 * @param  {String}  [attributeValue]  if omitted, the selector matches if the attribute is present
	 */
	Selector.prototype.requireAttribute = function (attributeName, attributeValue) {
		return new SimpleSelectorSequenceSelector(this, new AttributeSelector(attributeName, attributeValue));
	};

	return AttributeSelector;
});

