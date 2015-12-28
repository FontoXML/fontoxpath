define([
	'./parsing/createSelectorFromXPath',
	'./selectors/NodeNameSelector',
	'./selectors/NodePredicateSelector',
	'./selectors/Selector'
], function (
	createSelectorFromXPath,
	NodeNameSelector,
	NodePredicateSelector,
	Selector
	) {
	'use strict';

	/**
	 * Adapt a nodeSpec (or a selector) to a selector:
	 *  - Strings are transformed to a nodeName test, or parsed as XPath if the string is actually an XPath.
	 *  - Arrays are interpreted as lists of nodeNames.
	 *  - Functions are interpreted as predicates.
	 *
	 * @param   {string[]|string|Selector|Function}  selectorOrNodeSpec
	 * @return  {Selector}
	 */
	return function adaptNodeSpecToSelector (selectorOrNodeSpec) {
		switch (typeof selectorOrNodeSpec) {
			case 'string':
				if (!/^([a-zA-Z0-9_\-.]*:)?[a-z-A-Z-09_\-.]*$/.test(selectorOrNodeSpec)) {
					// Not a valid QName: must be an XPath selector
					return createSelectorFromXPath(selectorOrNodeSpec);
				}
				return new NodeNameSelector(selectorOrNodeSpec);

			case 'object':
				if (Array.isArray(selectorOrNodeSpec)) {
					return new NodeNameSelector(selectorOrNodeSpec);
				}

				if (selectorOrNodeSpec instanceof Selector) {
					return selectorOrNodeSpec;
				}
				break;

			case 'function':
				return new NodePredicateSelector(selectorOrNodeSpec);
		}

		throw new Error('Argument is not a selector or node spec');
	};
});
