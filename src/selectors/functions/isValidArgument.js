define([

], function (

	) {
	'use strict';

	return function isValidArgument (typeDescription, argument) {
		// typeDescription is something like 'xs:string?'
		var parts = typeDescription.match(/^([^+?*]*)([\+\*\?])?$/);
		var type = parts[1],
			multiplicity = parts[2];
		switch (multiplicity) {
			case '?':
				if (!argument.isEmpty() && !argument.isSingleton()) {
					return false;
				}
				break;

			case '+':
				if (argument.isEmpty()) {
					return false;
				}
				break;

			case '*':
				break;

			default:
				if (!argument.isSingleton()) {
					return false;
				}
		}

		return argument.value.every(function (argumentItem) {
			return argumentItem.instanceOfType(type);
		});
	};
});
