import builtInFunctions from './builtInFunctions';
import Sequence from '../dataTypes/Sequence';

/**
 * @typedef {({name: !string, callFunction: !function(*): !Sequence, argumentTypes: !Array<string>, returnType: !string})}
 */
let FunctionProperties;

/**
 * @dict
 * @type {!Object<string,!Array<!FunctionProperties>>}
 */
const registeredFunctionsByName = Object.create(null);

function computeLevenshteinDistance (a, b) {
	const computedDistances = [];
	for (let i = 0; i < a.length + 1; ++i) {
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

		let cost = 0;
		if (a[aLen - 1] !== b[bLen - 1]) {
			// need to change this character
			cost = 1;
		}

		// Return the minimum of deleting from a, deleting from b or deleting from both
		const distance = Math.min(
				computeStep(aLen - 1, bLen) + 1,
				computeStep(aLen, bLen - 1) + 1,
				computeStep(aLen - 1, bLen - 1) + cost);

		computedDistances[aLen][bLen] = distance;
		return distance;
	})(a.length, b.length);
}

function getAlternativesAsStringFor (functionName) {
	let alternativeFunctions;
	if (!registeredFunctionsByName[functionName]) {
		// Get closest functions by levenstein distance
		alternativeFunctions = Object.keys(registeredFunctionsByName)
			.map(alternativeName => {
				return {
					name: alternativeName,
					distance: computeLevenshteinDistance(functionName, alternativeName)
				};
			})
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 5)
		// If we need to change more than half the string, it cannot be a match
			.filter(alternativeNameWithScore => alternativeNameWithScore.distance < functionName.length / 2)
			.reduce((alternatives, alternativeNameWithScore) =>
					alternatives.concat(registeredFunctionsByName[alternativeNameWithScore.name]), [])
			.slice(0, 5);
	}
	else {
		alternativeFunctions = registeredFunctionsByName[functionName];
	}

	if (!alternativeFunctions.length) {
		return 'No similar functions found.';
	}

	return alternativeFunctions.map(functionDeclaration => `"${functionDeclaration.name} (${functionDeclaration.argumentTypes.join(', ')})"`)
		.reduce((accumulator, functionName, index, array) => {
		if (index === 0) {
			return accumulator + functionName;
		}
		return accumulator += ((index !== array.length - 1) ? ', ' : ' or ') + functionName;
	}, 'Did you mean ') + '?';
}

/**
 * @param	{!string}  functionName
 * @param	{!number}  arity
 * @return	{?FunctionProperties}
 */
function getFunctionByArity (functionName, arity) {
	let matchingFunctions = registeredFunctionsByName[functionName];

	if (!matchingFunctions && functionName.startsWith('fn:')) {
		matchingFunctions = registeredFunctionsByName[functionName.substr(3)];
	}

	if (!matchingFunctions) {
		return null;
	}

	const matchingFunction = matchingFunctions.find(/** @type {function(FunctionProperties):boolean} */ (functionDeclaration => {
		const indexOfRest = functionDeclaration.argumentTypes.indexOf('...');
		if (indexOfRest > -1) {
			return indexOfRest <= arity;
		}
		return functionDeclaration.argumentTypes.length === arity;
	}));

	if (!matchingFunction) {
		return null;
	}

	return {
		name: functionName,
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
builtInFunctions.forEach(builtInFunction => {
	registerFunction(
		builtInFunction.name,
		builtInFunction.argumentTypes,
		builtInFunction.returnType,
		builtInFunction.callFunction);
});

export default {
	getAlternativesAsStringFor: getAlternativesAsStringFor,
	getFunctionByArity: getFunctionByArity,
	registerFunction: registerFunction
};
