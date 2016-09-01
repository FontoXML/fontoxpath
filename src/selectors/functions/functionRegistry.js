define([
	'./builtInFunctions',
	'./isValidArgument'
], function (
	builtInFunctions,
	isValidArgument
) {
	'use strict';

	function isValidArgumentList (typeDeclarations, argumentList) {
		var indexOfSpread = typeDeclarations.indexOf('...');
		if (indexOfSpread > -1) {
			var replacePart = new Array(argumentList.length - (typeDeclarations.length - 1))
				.fill(typeDeclarations[indexOfSpread - 1]);
			typeDeclarations = typeDeclarations.slice(0, indexOfSpread)
				.concat(replacePart, typeDeclarations.slice(indexOfSpread + 1));
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
		var matchingFunctions = functions[name];
		if (!matchingFunctions) {
			return false;
		}
		return matchingFunctions.some(function (functionDeclaration) {
			if (functionDeclaration.typeDescription.indexOf('...') > -1) {
				return functionDeclaration.typeDescription.length >= arity;
			}
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

					if (argument.isSingleton()) {
						return argument.value[0].primitiveTypeName;
					}
					return argument.value[0].primitiveTypeName + '+';
				}).join(', ');
			var alternatives = functions[functionName].map(function (functionDeclaration) {
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
