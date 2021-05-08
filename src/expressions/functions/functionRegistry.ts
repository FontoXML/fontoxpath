import { FunctionSignature } from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import RestArgument, { REST_ARGUMENT_INSTANCE } from '../dataTypes/RestArgument';
import {
	EllipsisType,
	ParameterType,
	SequenceType,
	sequenceTypeToString,
} from '../dataTypes/Value';

export type FunctionProperties = {
	argumentTypes: (SequenceType | RestArgument)[];
	arity: number;
	callFunction: FunctionSignature<ISequence>;
	isUpdating: boolean;
	localName: string;
	namespaceURI: string;
	returnType: SequenceType;
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

export function getAlternativesAsStringFor(functionName: string): string {
	let alternativeFunctions: FunctionProperties[];
	if (!registeredFunctionsByName[functionName]) {
		// Get closest functions by levenstein distance
		alternativeFunctions = Object.keys(registeredFunctionsByName)
			.map((alternativeName) => {
				// Remove the namespace uri part of the cache key
				return {
					name: alternativeName,
					distance: computeLevenshteinDistance(
						functionName,
						alternativeName.slice(alternativeName.lastIndexOf(':') + 1)
					),
				};
			})
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 5)
			// If we need to change more than half the string, it cannot be a match
			.filter(
				(alternativeNameWithScore) =>
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
				(functionDeclaration) =>
					`"Q{${functionDeclaration.namespaceURI}}${
						functionDeclaration.localName
					} (${functionDeclaration.argumentTypes
						.map((argumentType) =>
							(argumentType as RestArgument).isRestArgument
								? '...'
								: sequenceTypeToString(argumentType as SequenceType)
						)
						.join(', ')})"`
			)
			.reduce((accumulator, alternativeFunctionName, index, array) => {
				if (index === 0) {
					return accumulator + alternativeFunctionName;
				}
				return (accumulator +=
					(index !== array.length - 1 ? ', ' : ' or ') + alternativeFunctionName);
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

	const matchingFunction = matchingFunctions.find((functionDeclaration) => {
		const hasRestArgument = functionDeclaration.argumentTypes.some(
			(argument) => (argument as RestArgument).isRestArgument
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
		argumentTypes: matchingFunction.argumentTypes,
		arity,
		callFunction: matchingFunction.callFunction,
		isUpdating: matchingFunction.isUpdating,
		localName: functionLocalName,
		namespaceURI: functionNamespaceURI,
		returnType: matchingFunction.returnType,
	};
}

export function registerFunction(
	namespaceURI,
	localName,
	argumentTypes: ParameterType[],
	returnType: SequenceType,
	callFunction
) {
	if (!registeredFunctionsByName[namespaceURI + ':' + localName]) {
		registeredFunctionsByName[namespaceURI + ':' + localName] = [];
	}

	registeredFunctionsByName[namespaceURI + ':' + localName].push({
		argumentTypes: argumentTypes.map((argumentType: ParameterType) =>
			argumentType === EllipsisType.ELLIPSIS ? REST_ARGUMENT_INSTANCE : argumentType
		),
		arity: argumentTypes.length,
		callFunction,
		isUpdating: false,
		localName,
		namespaceURI,
		returnType,
	});
}

export default {
	getAlternativesAsStringFor,
	getFunctionByArity,
	registerFunction,
};
