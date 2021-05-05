import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { BaseType, ValueType, SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression, {
	separateXDMValueFromUpdatingExpressionResult,
} from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { DONE_TOKEN, IIterator, ready } from '../util/iterators';
import { errXPTY0004 } from '../XPathErrors';
import { IPendingUpdate } from '../xquery-update/IPendingUpdate';
import { mergeUpdates } from '../xquery-update/pulRoutines';
import UpdatingFunctionValue from '../xquery-update/UpdatingFunctionValue';
import { errXUDY0038 } from '../xquery-update/XQueryUpdateFacilityErrors';
import { performFunctionConversion } from './argumentHelper';

const functionXPTY0004 = () =>
	errXPTY0004(
		'Expected base expression of a function call to evaluate to a sequence of single function item'
	);

export function transformArgumentList(
	argumentTypes: ValueType[],
	argumentList: ISequence[],
	executionParameters: ExecutionParameters,
	functionItem: string
): ISequence[] {
	const transformedArguments = [];
	for (let i = 0; i < argumentList.length; ++i) {
		if (argumentList[i] === null) {
			// This is the result of partial application, it will be inserted later
			transformedArguments.push(null);
			continue;
		}
		const transformedArgument = performFunctionConversion(
			argumentTypes[i],
			argumentList[i],
			executionParameters,
			functionItem,
			false
		);
		transformedArguments.push(transformedArgument);
	}
	return transformedArguments;
}

function validateFunctionItem(item: Value, callArity: number): FunctionValue {
	if (!isSubtypeOf(item.type.kind, BaseType.FUNCTION)) {
		throw errXPTY0004('Expected base expression to evaluate to a function item');
	}

	const functionItem = item as FunctionValue;

	if (functionItem.getArity() !== callArity) {
		throw functionXPTY0004();
	}
	return functionItem;
}

function callFunction(
	functionItem: FunctionValue<any>,
	functionCall: (
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		staticContext: StaticContext,
		...args: ISequence[]
	) => ISequence,
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	isGapByOffset: boolean[],
	createArgumentSequences: ((dynamicContext: DynamicContext) => ISequence)[],
	staticContext: StaticContext
): ISequence {
	let argumentOffset = 0;
	const evaluatedArgs = isGapByOffset.map((isGap) => {
		if (isGap) {
			return null;
		}
		return createArgumentSequences[argumentOffset++](dynamicContext);
	});

	// Test if we have the correct arguments, and pre-convert the ones we can pre-convert
	const transformedArguments = transformArgumentList(
		functionItem.getArgumentTypes() as ValueType[],
		evaluatedArgs,
		executionParameters,
		functionItem.getName()
	);

	if (transformedArguments.indexOf(null) >= 0) {
		return functionItem.applyArguments(transformedArguments);
	}

	const toReturn = functionCall.apply(undefined, [
		dynamicContext,
		executionParameters,
		staticContext,
		...transformedArguments,
	]);

	return performFunctionConversion(
		functionItem.getReturnType(),
		toReturn,
		executionParameters,
		functionItem.getName(),
		true
	);
}

class FunctionCall extends PossiblyUpdatingExpression {
	private _argumentExpressions: Expression[];
	private _callArity: number;
	private _functionReference: FunctionValue | UpdatingFunctionValue | null;
	private _functionReferenceExpression: Expression;
	private _isGapByOffset: boolean[];
	private _staticContext: StaticContext | null;

	/**
	 * @param  functionReference  Reference to the function to execute.
	 * @param  args               The arguments to be evaluated and passed to the function
	 */
	constructor(functionReference: Expression, args: (Expression | null)[]) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			[functionReference].concat(args.filter((arg) => !!arg)),
			{
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				peer: false,
				subtree: false,
				canBeStaticallyEvaluated: false, // args.every(arg => arg.canBeStaticallyEvaluated) && functionReference.canBeStaticallyEvaluated
			}
		);

		this._callArity = args.length;

		this._isGapByOffset = args.map((arg) => arg === null);

		this._staticContext = null;

		this._functionReferenceExpression = functionReference;
		this._argumentExpressions = args;
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult> {
		if (!this._functionReference || !this._functionReference.isUpdating) {
			// The function reference can not be updating at this point
			// We need to call the performFunctionalEvaluation, using the base implementation of evaluateWithUpdateList
			return super.evaluateWithUpdateList(dynamicContext, executionParameters);
		}
		let pendingUpdateList: IPendingUpdate[] = [];
		const functionCall = (
			innerDynamicContext: DynamicContext,
			innerExecutionParameters: ExecutionParameters,
			staticContext: StaticContext,
			...args: ISequence[]
		) => {
			return separateXDMValueFromUpdatingExpressionResult(
				(this._functionReference as UpdatingFunctionValue).value(
					innerDynamicContext,
					innerExecutionParameters,
					staticContext,
					...args
				),
				(pendingUpdates) => {
					pendingUpdateList = mergeUpdates(pendingUpdateList, pendingUpdates);
				}
			);
		};

		const returnSequence = callFunction(
			this._functionReference,
			functionCall,
			dynamicContext,
			executionParameters,
			this._isGapByOffset,
			this._argumentExpressions.map((expr) => () => {
				if (!expr.isUpdating) {
					return expr.evaluateMaybeStatically(dynamicContext, executionParameters);
				}
				return separateXDMValueFromUpdatingExpressionResult(
					(expr as PossiblyUpdatingExpression).evaluateWithUpdateList(
						dynamicContext,
						executionParameters
					),
					(pendingUpdates) => {
						pendingUpdateList = mergeUpdates(pendingUpdateList, pendingUpdates);
					}
				);
			}),
			this._staticContext
		);

		let done = false;
		return {
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				const allValues = returnSequence.getAllValues();
				done = true;
				return ready({
					pendingUpdateList,
					xdmValue: allValues,
				});
			},
		};
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		[createFunctionReferenceSequence, ...createArgumentSequences]
	): ISequence {
		if (this._functionReference) {
			// We can assume this function is not updating
			return callFunction(
				this._functionReference,
				(innerDynamicContext, innerExecutionParameters, staticContext, ...args) =>
					(this._functionReference as FunctionValue<ISequence>).value(
						innerDynamicContext,
						innerExecutionParameters,
						staticContext,
						...args
					),
				dynamicContext,
				executionParameters,
				this._isGapByOffset,
				createArgumentSequences,
				this._staticContext
			);
		}
		const sequence = createFunctionReferenceSequence(dynamicContext);
		return sequence.switchCases({
			default: () => {
				throw functionXPTY0004();
			},
			singleton: () => {
				return sequence.mapAll(([item]) => {
					const functionItem = validateFunctionItem(item, this._callArity);
					if (functionItem.isUpdating) {
						// dynamic function invocations can not be updating
						throw errXUDY0038();
					}
					return callFunction(
						functionItem,
						functionItem.value,
						dynamicContext,
						executionParameters,
						this._isGapByOffset,
						createArgumentSequences,
						this._staticContext
					);
				});
			},
		});
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		this._staticContext = staticContext.cloneContext();

		super.performStaticEvaluation(staticContext);

		// Try to get hold of the function reference, to see whether it is updating or not
		if (this._functionReferenceExpression.canBeStaticallyEvaluated) {
			const functionRefSequence = this._functionReferenceExpression.evaluateMaybeStatically(
				null,
				null
			);
			if (!functionRefSequence.isSingleton()) {
				throw functionXPTY0004();
			}
			this._functionReference = validateFunctionItem(
				functionRefSequence.first(),
				this._callArity
			);

			if (this._functionReference.isUpdating) {
				// We are sure we are updating. Do note that FunctionCalls also allow updating
				// arguments, which can make this expression updating by itself.
				this.isUpdating = true;
			}
		}
	}
}

export default FunctionCall;
