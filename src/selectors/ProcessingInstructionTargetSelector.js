define([
	'fontoxml-dom-utils/domInfo',

	'./SimpleSelector',
	'./Specificity'
], function (
	domInfo,

	SimpleSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {String}  target
	 */
	function ProcessingInstructionTargetSelector (target) {
		SimpleSelector.call(this, new Specificity({nodeName: 1}));

		this._target = target;
	}

	ProcessingInstructionTargetSelector.prototype = Object.create(SimpleSelector.prototype);
	ProcessingInstructionTargetSelector.prototype.constructor = ProcessingInstructionTargetSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	ProcessingInstructionTargetSelector.prototype.matches = function (node, blueprint) {
		return domInfo.isProcessingInstruction(node) && node.target === this._target;
	};

	return ProcessingInstructionTargetSelector;
});

