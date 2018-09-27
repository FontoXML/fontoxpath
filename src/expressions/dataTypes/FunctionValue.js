import Sequence from './Sequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';

/**
 * @param  {!Array<!string>}  argumentTypes
 * @param  {!number}  arity
 * @return {!Array<!string>}
 */
function expandRestArgumentToArity (argumentTypes, arity) {
	var indexOfRest = argumentTypes.indexOf('...');
	if (indexOfRest > -1) {
		var replacePart = new Array(arity - (argumentTypes.length - 1))
			.fill(argumentTypes[indexOfRest - 1]);

		return argumentTypes.slice(0, indexOfRest)
			.concat(replacePart);
	}
	return argumentTypes;
}

class FunctionValue {
	/**
	 * @param  {{value: !function(!DynamicContext, !ExecutionParameters, !StaticContext, ...!Sequence): !Sequence, localName: string, argumentTypes: !Array<string>, arity: number, returnType: string, namespaceURI: string}}  properties
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
		var fn = this.value;
		// fn (dynamicContext, ...arg)
		function curriedFunction (dynamicContext, executionParameters, staticContext) {
			var newArguments = Array.from(arguments).slice(3);
			var allArguments = appliedArguments.map(function (argument) {
				// If argument === null, it is a placeholder, so use a provided one
				return argument || newArguments.shift();
			});
			return fn.apply(undefined, [dynamicContext, executionParameters, staticContext].concat(allArguments));
		}
		var argumentTypes = appliedArguments.reduce(function (indices, arg, index) {
			if (arg === null) {
				indices.push(this._argumentTypes[index]);
			}
			return indices;
		}.bind(this), []);

		var functionItem = new FunctionValue({
			value: curriedFunction,
			localName: 'boundFunction',
			namespaceURI: this._namespaceURI,
			argumentTypes: argumentTypes,
			arity: argumentTypes.length,
			returnType: this._returnType
		});

		return Sequence.singleton(functionItem);
	}

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
