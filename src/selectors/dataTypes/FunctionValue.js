import Sequence from './Sequence';

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
	 * @param  {{value: !function(!../DynamicContext, !Sequence): !Sequence, name: string, argumentTypes: !Array<string>, arity: number, returnType: string}}  properties
	 */
	constructor ({ value, name, argumentTypes, arity, returnType }) {
		this.value = value;
		this._argumentTypes = expandRestArgumentToArity(argumentTypes, arity);
		this._name = name;
		this._arity = arity;
		this._returnType = returnType;

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
		function curriedFunction (dynamicContext) {
			var newArguments = Array.from(arguments).slice(1);
			var allArguments = appliedArguments.map(function (argument) {
				// If argument === null, it is a placeholder, so use a provided one
				return argument || newArguments.shift();
			});
			return fn.apply(undefined, [dynamicContext].concat(allArguments));
		}
		var argumentTypes = appliedArguments.reduce(function (indices, arg, index) {
			if (arg === null) {
				indices.push(this._argumentTypes[index]);
			}
			return indices;
		}.bind(this), []);

		var functionItem = new FunctionValue({
			value: curriedFunction,
			name: 'bound function',
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
		return this._name;
	}
}

export default FunctionValue;
