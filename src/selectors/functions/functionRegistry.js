define([
	'./builtInFunctions',

	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence',

	'../../parsing/customTestsByName'
], function (
	builtInFunctions,

	BooleanValue,
	Sequence,

	customTestsByName
) {
	'use strict';

	var functions = Object.create(null);

	function getAlternativesAsStringFor (functionName) {
		return functions[functionName].map(function (functionDeclaration) {
			return functionName + '(' + functionDeclaration.argumentTypes.join(', ') + ')';
		}).reduce(function (accumulator, functionName, index, array) {
			return accumulator += (index !== array.length - 1) ? ', ' : ' or '  + functionName;
		});
	}

	// Deprecated
	function getCustomTestByArity (functionName, arity) {
		var customFunctionViaCustomTestsByName = customTestsByName[functionName];

		if (customFunctionViaCustomTestsByName) {
			var callFunction = function () {
				var args = Array.from(arguments),
					dynamicContext = args.shift(),
					result = customFunctionViaCustomTestsByName.apply(
						undefined,
						args.map(function (arg) { return arg.value[0].value; }).concat(
							[dynamicContext.contextItem.value[0].value,
							dynamicContext.domFacade]));

				return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
			};

			return {
					callFunction: callFunction,
					argumentTypes: new Array(arity).fill('xs:string'),
					returnType: 'xs:boolean'
				};
		}

		return null;
	}

	function getBuiltinOrCustomFunctionByArity (functionName, arity) {
		var matchingFunctions = functions[functionName];

		if (!matchingFunctions) {
			return null;
		}

		var matchingFunction = matchingFunctions.find(function (functionDeclaration) {
			var indexOfRest = functionDeclaration.argumentTypes.indexOf('...');
			if (indexOfRest > -1) {
				return indexOfRest <= arity;
			}
			return functionDeclaration.argumentTypes.length === arity;
		});

		if (!matchingFunction) {
			return null;
		}

		return {
				callFunction: matchingFunction.callFunction,
				argumentTypes: matchingFunction.argumentTypes,
				returnType: matchingFunction.returnType
			};
	}

	function getFunctionByArity (functionName, arity) {
		var fn = getBuiltinOrCustomFunctionByArity(functionName, arity);

		// Deprecated
		if (!fn && functionName.startsWith('fonto:')) {
			var test = getCustomTestByArity(functionName, arity);
			if (test) {
				return test;
			}
		}

		return fn;
	}

	function registerFunction (name, argumentTypes, returnType, callFunction) {
		if (!functions[name]) {
			functions[name] = [];
		}
		functions[name].push({argumentTypes: argumentTypes, returnType: returnType, callFunction: callFunction});
	}

	builtInFunctions.forEach(function (builtInFunction) {
		registerFunction(builtInFunction.name, builtInFunction.argumentTypes, builtInFunction.returnType, builtInFunction.callFunction);
	});

	return {
		getAlternativesAsStringFor: getAlternativesAsStringFor,
		getFunctionByArity: getFunctionByArity,
		registerFunction: registerFunction
	};
});
