import builtInFunctions from './builtInFunctions';
import Sequence from '../dataTypes/Sequence';
import TypeDeclaration from '../dataTypes/TypeDeclaration';

/**
 * @typedef {({localName: !string, namespaceURI: string, arity: number, callFunction: !function(*): !Sequence, argumentTypes: !Array<string>, returnType: !string})}
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
				// Remove the namespace uri part of the cache key
				return {
					name: alternativeName,
					distance: computeLevenshteinDistance(
						functionName,
						alternativeName.slice(alternativeName.lastIndexOf(':') + 1))
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

	return alternativeFunctions.map(functionDeclaration => `"Q{${functionDeclaration.namespaceURI}}${functionDeclaration.localName} (${functionDeclaration.argumentTypes.join(', ')})"`)
		.reduce((accumulator, functionName, index, array) => {
		if (index === 0) {
			return accumulator + functionName;
		}
		return accumulator += ((index !== array.length - 1) ? ', ' : ' or ') + functionName;
	}, 'Did you mean ') + '?';
}

/**
 * @param   {string}   functionNamespaceURI
 * @param   {!string}  functionLocalName
 * @param   {!number}  arity
 * @return  {?FunctionProperties}
 */
function getFunctionByArity (functionNamespaceURI, functionLocalName, arity) {
	const matchingFunctions = registeredFunctionsByName[functionNamespaceURI + ':' + functionLocalName];

	if (!matchingFunctions) {
		return null;
	}

	const matchingFunction = matchingFunctions.find(/** @type {function(FunctionProperties):boolean} */ (functionDeclaration => {
		const hasRestArgument = functionDeclaration.argumentTypes.some(argument => argument.isRestArgument);
		if (hasRestArgument) {
			return functionDeclaration.argumentTypes.length - 1 <= arity;
		}
		return functionDeclaration.argumentTypes.length === arity;
	}));

	if (!matchingFunction) {
		return null;
	}

	return {
		namespaceURI: functionNamespaceURI,
		localName: functionLocalName,
		callFunction: matchingFunction.callFunction,
		argumentTypes: matchingFunction.argumentTypes,
		arity: arity,
		returnType: matchingFunction.returnType
	};
}

/**
 * @param   {string}          type
 * @return  {TypeDeclaration}
 */
function splitType (type) {
	// argumentType is something like 'xs:string?' or 'map(*)'
	var parts = type.match(/^(.*[^+?*])([\+\*\?])?$/);
	return parts[1] === '...' ? {
		isRestArgument: true
	} : {
		type: parts[1],
		occurrence: parts[2]
	};
}

function registerFunction (namespaceURI, localName, argumentTypes, returnType, callFunction) {
	if (!registeredFunctionsByName[namespaceURI + ':' + localName]) {
		registeredFunctionsByName[namespaceURI + ':' + localName] = [];
	}

	registeredFunctionsByName[namespaceURI + ':' + localName].push({
		localName: localName,
		namespaceURI: namespaceURI,
		argumentTypes: argumentTypes.map(argumentType => splitType(argumentType)),
		arity: argumentTypes.length,
		returnType: returnType,
		callFunction: callFunction
	});
}

// bootstrap builtin functions
builtInFunctions.forEach(builtInFunction => {
	registerFunction(
		builtInFunction.namespaceURI,
		builtInFunction.localName,
		builtInFunction.argumentTypes,
		builtInFunction.returnType,
		builtInFunction.callFunction);
});

export default {
	getAlternativesAsStringFor: getAlternativesAsStringFor,
	getFunctionByArity: getFunctionByArity,
	registerFunction: registerFunction
};
