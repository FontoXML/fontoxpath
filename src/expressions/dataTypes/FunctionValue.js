import Sequence from './Sequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import TypeDeclaration from './TypeDeclaration';
import RestArgument from './RestArgument';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

/**
 * @param  {!Array<!TypeDeclaration|!RestArgument>}  argumentTypes
 * @param  {!number}  arity
 * @return {!Array<!TypeDeclaration>}
 */
function expandRestArgumentToArity (argumentTypes, arity) {
	let indexOfRest = -1;
	for (let i = 0; i < argumentTypes.length; i++) {
		if (argumentTypes[i].isRestArgument) {
			indexOfRest = i;
		}
	}

	if (indexOfRest > -1) {
		const replacePart = new Array(arity - (argumentTypes.length - 1))
			.fill(argumentTypes[indexOfRest - 1]);

		return argumentTypes.slice(0, indexOfRest)
			.concat(replacePart);
	}
	return argumentTypes;
}

class FunctionValue {
	/**
	 * @param  {{value: !function(!DynamicContext, !ExecutionParameters, !StaticContext, ...!Sequence): !Sequence, localName: string, argumentTypes: !Array<!TypeDeclaration|!RestArgument>, arity: number, returnType: TypeDeclaration, namespaceURI: string}}  properties
	 */
	constructor ({ value, localName, namespaceURI, argumentTypes, arity, returnType }) {
		this.value = value;
		this._argumentTypes = expandRestArgumentToArity(argumentTypes, arity);
		this._localName = localName;
		this._arity = arity;
		this._returnType = returnType;
		this._namespaceURI = namespaceURI;

		this.type = 'function(*)';
	}

	/**
	 * Apply these arguments to curry them into a new function
	 * @param   {!Array<?Sequence>}  appliedArguments
	 * @return  {!Sequence}
	 */
	applyArguments (appliedArguments) {
		const fn = this.value;

		const argumentSequenceCreators = appliedArguments.map(arg => {
			if (arg === null) {
				return null;
			}
			return createDoublyIterableSequence(arg);
		});

		// fn (dynamicContext, ...arg)
		function curriedFunction (dynamicContext, executionParameters, staticContext) {
			const newArguments = Array.from(arguments).slice(3);
			const allArguments = argumentSequenceCreators.map(function (createArgumentSequence) {
				// If createArgumentSequence === null, it is a placeholder, so use a provided one
				if (createArgumentSequence === null) {
					return newArguments.shift();
				}
				return createArgumentSequence();
			});
			return fn.apply(undefined, [dynamicContext, executionParameters, staticContext].concat(allArguments));
		}
		const argumentTypes = appliedArguments.reduce(function (indices, arg, index) {
			if (arg === null) {
				indices.push(this._argumentTypes[index]);
			}
			return indices;
		}.bind(this), []);

		const functionItem = new FunctionValue({
			value: curriedFunction,
			localName: 'boundFunction',
			namespaceURI: this._namespaceURI,
			argumentTypes: argumentTypes,
			arity: argumentTypes.length,
			returnType: this._returnType
		});

		return Sequence.singleton(functionItem);
	}

	/**
	 * @return {!Array<!TypeDeclaration>}
	 */
	getArgumentTypes () {
		return this._argumentTypes;
	}

	getReturnType () {
		return this._returnType;
	}

	getArity () {
		return this._arity;
	}

	getName () {
		return this._localName;
	}
}

export default FunctionValue;
