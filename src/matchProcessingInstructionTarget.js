define([
	'./selectors/ProcessingInstructionTargetSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/ChildCombinatorSelector',
	'./selectors/DescendantCombinatorSelector',
	'./selectors/NodeSpecSelector'
], function (
	ProcessingInstructionTargetSelector
	) {
	'use strict';

	/**
	 * @param  {String}  target
	 */
	return function matchProcessingInstructionTarget (target) {
		return new ProcessingInstructionTargetSelector(target);
	};
});

