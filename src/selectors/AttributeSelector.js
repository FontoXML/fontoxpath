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
	 * @param  {String}    attributeName
	 * @param  {String[]}  [attributeValues]  if omitted, the selector matches if the attribute is present
	 */
	function AttributeSelector (attributeName, attributeValues) {
		SimpleSelector.call(this, new Specificity({attribute: 1}));

		this._attributeName = attributeName;
		this._attributeValues = attributeValues;
	}

	AttributeSelector.prototype = Object.create(SimpleSelector.prototype);
	AttributeSelector.prototype.constructor = AttributeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AttributeSelector.prototype.matches = function (node, blueprint) {
		if (this._attributeValues === undefined) {
			return blueprint.getAttribute(node, this._attributeName) !== null;
		}

		return this._attributeValues.some(function (attributeValue) {
			return blueprint.getAttribute(node, this._attributeName) === attributeValue;
		}.bind(this));
	};

	/**
	 * @param  {String}           attributeName
	 * @param  {String|String[]}  [attributeValues]  if omitted, the selector matches if the attribute is present
	 */
	Selector.prototype.requireAttribute = function (attributeName, attributeValues) {
		if (attributeValues !== undefined && !Array.isArray(attributeValues)) {
			attributeValues = [attributeValues];
		}

		return new SimpleSelectorSequenceSelector(this, new AttributeSelector(attributeName, attributeValues));
	};

	return AttributeSelector;
});

