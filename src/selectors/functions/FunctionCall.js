import argumentListToString from './argumentListToString';
import isValidArgument from './isValidArgument';
import Selector from '../Selector';
import Specificity from '../Specificity';

function isValidArgumentList (argumentTypes, argumentList) {
    return argumentList.length === argumentTypes.length &&
        argumentList.every(function (argument, i) {
            return isValidArgument(argumentTypes[i], argument);
        });
}
/**
 * @extends Selector
 */
class FunctionCall extends Selector {
	/**
	 * @param  {!Selector}    functionReference  Reference to the function to execute.
	 * @param  {!Array<!Selector>}  args              The arguments to be evaluated and passed to the function
	 */
	constructor (functionReference, args) {
		super(new Specificity({
			[Specificity.EXTERNAL_KIND]: 1
		}), Selector.RESULT_ORDERINGS.UNSORTED);

		this._args = args;
		this._functionReference = functionReference;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		if (!(otherSelector instanceof FunctionCall)) {
			return false;
		}
		const otherFunctionCall = /** @type {FunctionCall} */ (otherSelector);

		return this._functionReference.equals(otherFunctionCall._functionReference) &&
			this._args.length === otherFunctionCall._args.length &&
			this._args.every(function (arg, i) {
				return arg.equals(otherFunctionCall._args[i]);
			});
	}

	evaluate (dynamicContext) {
		var sequence = this._functionReference.evaluate(dynamicContext),
		functionItem = sequence.value[0];

		if (!sequence.isSingleton()) {
			throw new Error('XPTY0004: expected base expression to evaluate to a sequence with a single item');
		}

		if (!functionItem.instanceOfType('function(*)')) {
			throw new Error('XPTY0004: expected base expression to evaluate to a function item');
		}

		if (functionItem.getArity() !== this._args.length) {
			throw new Error('XPTY0004: expected arity of dynamic function to be ' + this._args.length + ', got function with arity of ' + functionItem.getArity());
		}

		var evaluatedArgs = this._args.map(function (argument) {
				if (argument === null) {
					return null;
				}
				return argument.evaluate(dynamicContext);
			});

		if (!isValidArgumentList(functionItem.getArgumentTypes(), evaluatedArgs)) {
			throw new Error('XPTY0004: expected argument list of dynamic function to be [' + argumentListToString(evaluatedArgs) + '], got function with argument list [' + functionItem.getArgumentTypes().join(', ') + '].');
		}

		if (evaluatedArgs.indexOf(null) >= 0) {
			return functionItem.applyArguments(evaluatedArgs);
		}


		return functionItem.value.apply(undefined, [dynamicContext].concat(evaluatedArgs));
	}
}

export default FunctionCall;
