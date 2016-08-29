define([
	'./builtInFunctions'
], function (
	builtInFunctions
) {
	'use strict';

	function isValidArgument (typeDescription, argument) {
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
				if (!argument.isEmpty()) {
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
			// Item is a special case which matches anything
			return type === 'item()' || argumentItem.instanceOfType(type);
		});
	}

	function isValidArgumentList (typeDeclarations, argumentList) {
		if (typeDeclarations[typeDeclarations.length - 1] === '...') {
			typeDeclarations.splice(-1, 1);
			typeDeclarations = typeDeclarations.concat(new Array(argumentList.length - typeDeclarations.length).fill(typeDeclarations[typeDeclarations.length - 1]));
		}

		return argumentList.length === typeDeclarations.length &&
			argumentList.every(function (argument, i) {
				return isValidArgument(typeDeclarations[i], argument);
			});
	}

	var functions = Object.create(null);

	function registerFunction (name, typeDescription, callFunction) {
		if (!functions[name]) {
			functions[name] = [];
		}
		functions[name].push({typeDescription: typeDescription, callFunction: callFunction});
	}

	function hasFunction (name, arity) {
		return functions[name].some(function (functionDeclaration) {
			return functionDeclaration.typeDescription.length === arity;
		});
	}

	function getFunction (functionName, argumentList) {
		var matchingFunctions = functions[functionName];

		if (!matchingFunctions) {
			throw new Error('XPST0017: No such function ' + functionName);
		}

		var matchingFunction = matchingFunctions.find(function (functionDeclaration) {
			return isValidArgumentList(functionDeclaration.typeDescription, argumentList);
		});

		if (!matchingFunction) {
			var argumentString = argumentList.map(function (argument) {
						if (argument.isEmpty()) {
							return 'item()?';
						}

						return argument.value[0].primitiveTypeName + '+';
					}).join(', '),
				alternatives = functions[functionName].map(function (functionDeclaration) {
						return functionName + '(' + functionDeclaration.typeDescription.join(', ') + ')';
					});
			throw new Error('XPST0017: No such function ' + functionName + '(' + argumentString + ') \n Did you mean ' + alternatives);
		}

		return matchingFunction.callFunction;
	}

	builtInFunctions.forEach(function (builtInFunction) {
		registerFunction(builtInFunction.name, builtInFunction.typeDescription, builtInFunction.callFunction);
	});

	return {
		registerFunction: registerFunction,
		hasFunction: hasFunction,
		getFunction: getFunction
	};
});
