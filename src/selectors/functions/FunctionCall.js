define([
	'./argumentListToString',
	'./isValidArgument',
	'../dataTypes/Sequence',
	'../Selector',
	'../Specificity'
], function (
	argumentListToString,
	isValidArgument,
	Sequence,
	Selector,
	Specificity
) {
	'use strict';

	/**
	 * @param  {Selector}    functionReference  Reference to the function to execute.
	 * @param  {Selector[]}  args              The arguments to be evaluated and passed to the function
	 */
	function FunctionCall (functionReference, args) {
		Selector.call(this, new Specificity({external: 1}), Selector.RESULT_ORDER_UNSORTED);

		this._args = args;
		this._functionReference = functionReference;
	}

	FunctionCall.prototype = Object.create(Selector.prototype);
	FunctionCall.prototype.constructor = FunctionCall;

	FunctionCall.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof FunctionCall &&
			this._functionReference.equals(otherSelector._functionReference) &&
			this._args.length === otherSelector._args.length &&
			this._args.every(function (arg, i) {
				return arg.equals(otherSelector._args[i]);
			});
	};

	function isValidArgumentList (argumentTypes, argumentList) {
		var indexOfRest = argumentTypes.indexOf('...');
		if (indexOfRest > -1) {
			var replacePart = new Array(argumentList.length - (argumentTypes.length - 1))
				.fill(argumentTypes[indexOfRest - 1]);
			argumentTypes = argumentTypes.slice(0, indexOfRest)
				.concat(replacePart, argumentTypes.slice(indexOfRest + 1));
		}

		return argumentList.length === argumentTypes.length &&
			argumentList.every(function (argument, i) {
				return isValidArgument(argumentTypes[i], argument);
			});
	}

	FunctionCall.prototype.evaluate = function (dynamicContext) {
		var sequence = this._functionReference.evaluate(dynamicContext);

		if (!sequence.isSingleton()) {
			throw new Error('XPTY0004: expected base expression to evaluate to a sequence with a single item');
		}

		var evaluatedArgs = this._args.map(function (argument) {
					return argument.evaluate(dynamicContext);
				}),
			functionItem = sequence.value[0];

		if (!functionItem.instanceOfType('function(*)')) {
			throw new Error('XPTY0004: expected base expression to evaluate to a function item');
		}

		if (functionItem.getArity() !== this._args.length) {
			throw new Error('XPTY0004: expected arity of dynamic function to be ' + this._args.length + ', got function with arity of ' + functionItem.getArity());
		}

		if (!isValidArgumentList(functionItem.getArgumentTypes(), evaluatedArgs)) {
			throw new Error('XPTY0004: expected argument list of dynamic function to be [' + argumentListToString(evaluatedArgs) + '], got function with argument list [' + functionItem.getArgumentTypes().join(', ') + '].');
		}

		return functionItem.value.apply(undefined, [dynamicContext].concat(evaluatedArgs));
	};

	return FunctionCall;
});
