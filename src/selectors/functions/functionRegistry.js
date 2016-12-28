import builtInFunctions from './builtInFunctions';
import BooleanValue from '../dataTypes/BooleanValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @typedef {({name: !string, callFunction: !function(*): !Sequence, argumentTypes: !Array<string>, returnType: !string})}
 */
var FunctionProperties;

/**
 * @dict
 * @type {!Object<string,Array<FunctionProperties>>}
 */
var registeredFunctionsByName = Object.create(null);

function computeLevenshteinDistance (a, b) {
    var computedDistances = [];
    for (var i = 0; i < a.length + 1; ++i) {
        computedDistances[i] = [];
    }
    return (function computeStep (aLen, bLen) {
        if (aLen === 0) {
            // At the end of the a string, need to add / delete b characters
            return bLen;
        }
        if (bLen === 0) {
            // At the end of the b string, need to add / delete bLen characters
            return aLen;
        }

        if (computedDistances[aLen][bLen] !== undefined) {
            return computedDistances[aLen][bLen];
        }

        var cost = 0;
        if (a[aLen - 1] !== b[bLen - 1]) {
            // need to change this character
            cost = 1;
        }

        // Return the minimum of deleting from a, deleting from b or deleting from both
        var distance = Math.min(
				computeStep(aLen - 1, bLen) + 1,
				computeStep(aLen, bLen - 1) + 1,
				computeStep(aLen - 1, bLen - 1) + cost);

        computedDistances[aLen][bLen] = distance;
        return distance;
    })(a.length, b.length);
}

function getAlternativesAsStringFor (functionName) {
    var alternativeFunctions;
    if (!registeredFunctionsByName[functionName]) {
        // Get closest functions by levenstein distance
        alternativeFunctions = Object.keys(registeredFunctionsByName)
            .map(function (alternativeName) {
                return {
                    name: alternativeName,
                    distance: computeLevenshteinDistance(functionName, alternativeName)
                };
            })
            .sort(function (a, b) {
                return a.distance - b.distance;
            })
            .slice(0, 5)
            .filter(function (alternativeNameWithScore) {
                // If we need to change more than half the string, it cannot be a match
                return alternativeNameWithScore.distance < functionName.length / 2;
            })
            .reduce(function (alternatives, alternativeNameWithScore) {
                return alternatives.concat(registeredFunctionsByName[alternativeNameWithScore.name]);
            }, [])
            .slice(0, 5);
    }
	else {
        alternativeFunctions = registeredFunctionsByName[functionName];
    }

    if (!alternativeFunctions.length) {
        return 'No similar functions found.';
    }

    return alternativeFunctions.map(function (functionDeclaration) {
        return '"' + functionDeclaration.name + '(' + functionDeclaration.argumentTypes.join(', ') + ')"';
    }).reduce(function (accumulator, functionName, index, array) {
        if (index === 0) {
            return accumulator + functionName;
        }
        return accumulator += ((index !== array.length - 1) ? ', ' : ' or ') + functionName;
    }, 'Did you mean ') + '?';
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
						args.map(function (arg) {
							return arg.value[0].value;
						}).concat(
							[dynamicContext.contextItem.value[0].value,
                             dynamicContext.domFacade
							]));

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

/**
 * @param   {!string}  functionName
 * @param   {!number}  arity
 * @return  {FunctionProperties}
 */
function getFunctionByArity (functionName, arity) {
    var matchingFunctions = registeredFunctionsByName[functionName];

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

function registerFunction (name, argumentTypes, returnType, callFunction) {
    if (!registeredFunctionsByName[name]) {
        registeredFunctionsByName[name] = [];
    }
    registeredFunctionsByName[name].push({
        name: name,
        argumentTypes: argumentTypes,
        returnType: returnType,
        callFunction: callFunction
    });
}

// bootstrap builtin functions
builtInFunctions.forEach(function (builtInFunction) {
    registerFunction(builtInFunction.name, builtInFunction.argumentTypes, builtInFunction.returnType, builtInFunction.callFunction);
});

export default {
    getAlternativesAsStringFor: getAlternativesAsStringFor,
    getFunctionByArity: getFunctionByArity,
    registerFunction: registerFunction
};
