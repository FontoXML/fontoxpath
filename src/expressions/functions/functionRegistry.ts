import { FunctionSignature } from '../dataTypes/FunctionValue';
import RestArgument, { REST_ARGUMENT_INSTANCE } from '../dataTypes/RestArgument';
import TypeDeclaration from '../dataTypes/TypeDeclaration';

export type FunctionProperties = {
	argumentTypes: (TypeDeclaration | RestArgument)[];
	arity: number;
	callFunction: FunctionSignature;
	localName: string;
	namespaceURI: string;
	returnType: TypeDeclaration;
};

const registeredFunctionsByName: { [s: string]: FunctionProperties[] } = Object.create(null);

function computeLevenshteinDistance(a, b) {
	const computedDistances = [];
	for (let i = 0; i < a.length + 1; ++i) {
		computedDistances[i] = [];
	}
	return (function computeStep(aLen, bLen) {
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
			computeStep(aLen - 1, bLen - 1) + cost
		);

		computedDistances[aLen][bLen] = distance;
		return distance;
	})(a.length, b.length);
}

export function getAlternativesAsStringFor(functionName) {
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
						alternativeName.slice(alternativeName.lastIndexOf(':') + 1)
					)
				};
			})
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 5)
			// If we need to change more than half the string, it cannot be a match
			.filter(
				alternativeNameWithScore =>
					alternativeNameWithScore.distance < functionName.length / 2
			)
			.reduce(
				(alternatives, alternativeNameWithScore) =>
					alternatives.concat(registeredFunctionsByName[alternativeNameWithScore.name]),
				[]
			)
			.slice(0, 5);
	} else {
		alternativeFunctions = registeredFunctionsByName[functionName];
	}

	if (!alternativeFunctions.length) {
		return 'No similar functions found.';
	}

	return (
		alternativeFunctions
			.map(
				functionDeclaration =>
					`"Q{${functionDeclaration.namespaceURI}}${
						functionDeclaration.localName
					} (${functionDeclaration.argumentTypes
						.map(argumentType => argumentType.type + argumentType.occurrence)
						.join(', ')})"`
			)
			.reduce((accumulator, functionName, index, array) => {
				if (index === 0) {
					return accumulator + functionName;
				}
				return (accumulator += (index !== array.length - 1 ? ', ' : ' or ') + functionName);
			}, 'Did you mean ') + '?'
	);
}

export function getFunctionByArity(
	functionNamespaceURI: string,
	functionLocalName: string,
	arity: number
): FunctionProperties | null {
	const matchingFunctions =
		registeredFunctionsByName[functionNamespaceURI + ':' + functionLocalName];

	if (!matchingFunctions) {
		return null;
	}

	const matchingFunction = matchingFunctions.find(functionDeclaration => {
		const hasRestArgument = functionDeclaration.argumentTypes.some(
			argument => (argument as RestArgument).isRestArgument
		);
		if (hasRestArgument) {
			return functionDeclaration.argumentTypes.length - 1 <= arity;
		}
		return functionDeclaration.argumentTypes.length === arity;
	});

	if (!matchingFunction) {
		return null;
	}

	return {
		namespaceURI: functionNamespaceURI,
		localName: functionLocalName,
		callFunction: matchingFunction.callFunction,
		argumentTypes: matchingFunction.argumentTypes,
		arity,
		returnType: matchingFunction.returnType
	};
}

function splitType(type: string): TypeDeclaration {
	// argumentType is something like 'xs:string?' or 'map(*)'
	const parts = type.match(/^(.*[^+?*])([+*?])?$/);
	return {
		type: parts[1],
		occurrence: (parts[2] as '?' | '+' | '*' | '') || null
	};
}

export function registerFunction(namespaceURI, localName, argumentTypes, returnType, callFunction) {
	if (!registeredFunctionsByName[namespaceURI + ':' + localName]) {
		registeredFunctionsByName[namespaceURI + ':' + localName] = [];
	}

	registeredFunctionsByName[namespaceURI + ':' + localName].push({
		localName,
		namespaceURI,
		argumentTypes: argumentTypes.map(argumentType =>
			argumentType === '...' ? REST_ARGUMENT_INSTANCE : splitType(argumentType)
		),
		arity: argumentTypes.length,
		returnType: splitType(returnType),
		callFunction
	});
}

export default {
	getAlternativesAsStringFor,
	getFunctionByArity,
	registerFunction
};
