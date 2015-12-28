define([
	'./selectors/ProcessingInstructionTargetSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/HasChildSelector',
	'./selectors/HasDescendantSelector',
	'./selectors/HasParentSelector',
	'./selectors/HasAncestorSelector',
	'./selectors/InvertedSelector',
	'./selectors/NodePredicateSelector'
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
