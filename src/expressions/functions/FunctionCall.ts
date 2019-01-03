import { transformArgument } from './argumentHelper';
import Expression from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import FunctionValue from '../dataTypes/FunctionValue';

function transformArgumentList (argumentTypes, argumentList, executionParameters, functionItem) {
	var transformedArguments = [];
	for (let i = 0; i < argumentList.length; ++i) {
		if (argumentList[i] === null) {
			// This is the result of partial application, it will be inserted later
			transformedArguments.push(null);
			continue;
		}
		const transformedArgument = transformArgument(argumentTypes[i], argumentList[i], executionParameters, functionItem);
		transformedArguments.push(transformedArgument);
	}
	return transformedArguments;
}

class FunctionCall extends PossiblyUpdatingExpression {
	private _callArity: number;
	private _isGapByOffset: boolean[];
	private _staticContext: any;

	/**
	 * @param  functionReference  Reference to the function to execute.
	 * @param  args               The arguments to be evaluated and passed to the function
	 */
	constructor(functionReference: Expression, args: Array<PossiblyUpdatingExpression | Expression | null>) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			[functionReference].concat(args.filter(arg => !!arg)),
			{
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED,
				peer: false,
				subtree: false,
				canBeStaticallyEvaluated: false // args.every(arg => arg.canBeStaticallyEvaluated) && functionReference.canBeStaticallyEvaluated
			});

		this._callArity = args.length;

		this._isGapByOffset = args.map(arg => arg === null);

		this._staticContext = null;
	}

	performStaticEvaluation (staticContext) {
		this._staticContext = staticContext.cloneContext();
		super.performStaticEvaluation(staticContext);
	}

	performFunctionalEvaluation (dynamicContext, executionParameters, [createFunctionReferenceSequence, ...createArgumentSequences]) {
		const sequence = createFunctionReferenceSequence(dynamicContext);
		return sequence.switchCases({
			default: () => {
				throw new Error('XPTY0004: expected base expression to evaluate to a sequence with a single item');
			},
			singleton: () => {
				return sequence.mapAll(([item]) => {
					if (!isSubtypeOf(item.type, 'function(*)')) {
						throw new Error('XPTY0004: expected base expression to evaluate to a function item');
					}

					const functionItem = item as FunctionValue;

					if (functionItem.getArity() !== this._callArity) {
						throw new Error(`XPTY0004: expected arity of function ${functionItem.getName()} to be ${this._callArity}, got function with arity of ${functionItem.getArity()}`);
					}

					let argumentOffset = 0;
					const evaluatedArgs = this._isGapByOffset.map(isGap => {
						if (isGap) {
							return null;
						}
						return createArgumentSequences[argumentOffset++](dynamicContext);
					});

					// Test if we have the correct arguments, and pre-convert the ones we can pre-convert
					const transformedArguments = transformArgumentList(
						functionItem.getArgumentTypes(),
						evaluatedArgs,
						executionParameters,
						functionItem.getName());

					if (transformedArguments.indexOf(null) >= 0) {
						return functionItem.applyArguments(transformedArguments);
					}

					return functionItem.value.apply(
						undefined,
						[
							dynamicContext,
							executionParameters,
							this._staticContext
						].concat(transformedArguments));
				});
			}
		});
	}
}

export default FunctionCall;
