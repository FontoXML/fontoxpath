define([
	'./parsing/customTestsByName'
], function (
	customTestsByName
) {
	'use strict';

	/**
	 * Add a custom test for use in xpath-serialized selectors
	 * These tests can be used with their fonto-prefixed name, followed by their arguments, being strings.
	 * The arguments are bound to the predicate, making them appear first.
	 * Example of a horrible custom test:
	 * js: addXPathCustomTest('fonto-maybe', (a, b, node, blueprint) => Math.random()+.5|0);
	 * selector: self::fonto-maybe("a", 'b')
	 *
	 * @param  {string}    name        The name of this test, starts with fonto-
	 * @param  {function}  customTest  The custom test: (string.., Node, Blueprint) => boolean
	 */
	return function addXPathCustomTest (name, customTest) {
		customTestsByName[name] = customTest;
	};
});
