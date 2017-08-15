import argumentListToString from './argumentListToString';
import { transformArgument } from './argumentHelper';
import Selector from '../Selector';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

function transformArgumentList (argumentTypes, argumentList, dynamicContext, functionItem) {
	if (argumentList.length !== argumentTypes.length) {
		return null;
	}
	var transformedArguments = [];
	for (let i = 0; i < argumentList.length; ++i) {
		if (argumentList[i] === null) {
			// This is the result of partial application, it will be inserted later
			transformedArguments.push(null);
			continue;
		}
		const transformedArgument = transformArgument(argumentTypes[i], argumentList[i], dynamicContext, functionItem);
		if (transformedArgument === null) {
			return null;
		}
		transformedArguments.push(transformedArgument);
	}
	return transformedArguments;
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
		}), {
			resultOrder: Selector.RESULT_ORDERINGS.UNSORTED,
			peer: false,
			subtree: false,
			canBeStaticallyEvaluated: false //args.every(arg => arg.canBeStaticallyEvaluated) && functionReference.canBeStaticallyEvaluated
		});

		this._args = args;
		this._functionReference = functionReference;
	}

	evaluate (dynamicContext) {
		var sequence = this._functionReference.evaluateMaybeStatically(dynamicContext);
		return sequence.switchCases({
			default: () => {
				throw new Error('XPTY0004: expected base expression to evaluate to a sequence with a single item');
			},
			singleton: () => {
				return sequence.mapAll(([functionItem]) => {
					if (!isSubtypeOf(functionItem.type, 'function(*)')) {
						throw new Error('XPTY0004: expected base expression to evaluate to a function item');
					}

					if (functionItem.getArity() !== this._args.length) {
						throw new Error(`XPTY0004: expected arity of function ${functionItem.getName()} to be ${this._args.length}, got function with arity of ${functionItem.getArity()}`);
					}

					var evaluatedArgs = this._args.map(function (argument) {
						if (argument === null) {
							return null;
						}
						return argument.evaluateMaybeStatically(dynamicContext);
					});

					// Test if we have the correct arguments, and pre-convert the ones we can pre-convert
					var transformedArguments = transformArgumentList(functionItem.getArgumentTypes(), evaluatedArgs, dynamicContext, functionItem);
					if (transformedArguments === null) {
						throw new Error(`XPTY0004: expected argument list of function ${functionItem.getName()} to be [${argumentListToString(evaluatedArgs)}], got function with argument list [${functionItem.getArgumentTypes().join(', ')}].`);
					}

					if (transformedArguments.indexOf(null) >= 0) {
						return functionItem.applyArguments(transformedArguments);
					}

					return functionItem.value.apply(undefined, [dynamicContext].concat(transformedArguments));
				});
			}
		});
	}
}

export default FunctionCall;
