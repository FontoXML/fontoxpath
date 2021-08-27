import ISequence from './dataTypes/ISequence';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { OptimizationOptions } from './Expression';
import PossiblyUpdatingExpression, {
	separateXDMValueFromUpdatingExpressionResult,
} from './PossiblyUpdatingExpression';
import Specificity from './Specificity';
import StaticContext from './StaticContext';
import UpdatingExpressionResult from './UpdatingExpressionResult';
import createSingleValueIterator from './util/createSingleValueIterator';
import { DONE_TOKEN, IIterator, IterationHint, ready } from './util/iterators';
import { IPendingUpdate } from './xquery-update/IPendingUpdate';
import { mergeUpdates } from './xquery-update/pulRoutines';
import { errXUST0001 } from './xquery-update/XQueryUpdateFacilityErrors';

abstract class FlworExpression extends Expression {
	protected _returnExpression: PossiblyUpdatingExpression | FlworExpression;

	constructor(
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions,
		returnExpression: PossiblyUpdatingExpression | FlworExpression
	) {
		super(specificity, childExpressions, optimizationOptions, true);

		this._returnExpression = returnExpression;
		this.isUpdating = this._returnExpression.isUpdating;
	}

	public abstract doFlworExpression(
		dynamicContext: DynamicContext,
		dynamicContextIterator: IIterator<DynamicContext>,
		executionParameters: ExecutionParameters,
		createReturnSequence: (dynamicContextIterator: IIterator<DynamicContext>) => ISequence
	): ISequence;

	public doFlworExpressionUpdating(
		outerDynamicContext: DynamicContext,
		outerDynamicContextIterator: IIterator<DynamicContext>,
		executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult> {
		let updateList: IPendingUpdate[] = [];
		const sequence = this.doFlworExpression(
			outerDynamicContext,
			outerDynamicContextIterator,
			executionParameters,
			(dynamicContextIterator) => {
				if (this._returnExpression instanceof FlworExpression) {
					// We are in a FLWOR, the return is also a FLWOR, keep piping dynamiccontext generators
					const updateListAndValue = this._returnExpression.doFlworExpressionUpdating(
						outerDynamicContext,
						dynamicContextIterator,
						executionParameters
					);

					return separateXDMValueFromUpdatingExpressionResult(
						updateListAndValue,
						(pendingUpdates) => (updateList = pendingUpdates)
					);
				}
				// We are transitioning to a non-FLWOR expression. Also apply all looping here
				let currentReturnValueGenerator: IIterator<Value> = null;
				return sequenceFactory.create({
					next: (_hint) => {
						while (true) {
							if (!currentReturnValueGenerator) {
								const currentDynamicContext = dynamicContextIterator.next(
									IterationHint.NONE
								);

								if (currentDynamicContext.done) {
									return DONE_TOKEN;
								}

								const updateListAndValue =
									this._returnExpression.evaluateWithUpdateList(
										currentDynamicContext.value,
										executionParameters
									);
								currentReturnValueGenerator =
									separateXDMValueFromUpdatingExpressionResult(
										updateListAndValue,
										(pendingUpdates) =>
											(updateList = mergeUpdates(updateList, pendingUpdates))
									).value;
							}

							const nextValue = currentReturnValueGenerator.next(IterationHint.NONE);
							if (nextValue.done) {
								currentReturnValueGenerator = null;
								continue;
							}
							return nextValue;
						}
					},
				});
			}
		);

		let done = false;
		return {
			next: (_hint: IterationHint) => {
				if (done) {
					return DONE_TOKEN;
				}
				// Ensure we fully exhaust the inner expression so that the pending update list is
				// filled
				const allValues = sequence.getAllValues();
				done = true;
				return ready(new UpdatingExpressionResult(allValues, updateList));
			},
		};
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		return this.doFlworExpression(
			dynamicContext,
			createSingleValueIterator(dynamicContext),
			executionParameters,
			(dynamicContextIterator: IIterator<DynamicContext>) => {
				if (this._returnExpression instanceof FlworExpression) {
					// We are in a FLWOR, the return is also a FLWOR, keep piping dynamiccontext generators
					return this._returnExpression.doFlworExpressionInternal(
						dynamicContext,
						dynamicContextIterator,
						executionParameters
					);
				}

				let currentSequenceIterator: IIterator<Value> = null;
				return sequenceFactory.create({
					next: (hint) => {
						while (true) {
							if (!currentSequenceIterator) {
								const temp = dynamicContextIterator.next(IterationHint.NONE);

								if (temp.done) {
									return DONE_TOKEN;
								}
								currentSequenceIterator =
									this._returnExpression.evaluateMaybeStatically(
										temp.value,
										executionParameters
									).value;
							}

							const nextValue = currentSequenceIterator.next(hint);
							if (nextValue.done) {
								currentSequenceIterator = null;
								continue;
							}
							return nextValue;
						}
					},
				});
			}
		);
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult> {
		return this.doFlworExpressionUpdating(
			dynamicContext,
			createSingleValueIterator(dynamicContext),
			executionParameters
		);
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		super.performStaticEvaluation(staticContext);
		this.isUpdating = this._returnExpression.isUpdating;

		for (const childExpression of this._childExpressions) {
			if (childExpression === this._returnExpression) {
				// Only the return expressionmay be updating
				continue;
			}

			if (childExpression.isUpdating) {
				throw errXUST0001();
			}
		}
	}

	private doFlworExpressionInternal(
		outerDynamicContext: DynamicContext,
		outerDynamicContextIterator: IIterator<DynamicContext>,
		executionParameters: ExecutionParameters
	): ISequence {
		return this.doFlworExpression(
			outerDynamicContext,
			outerDynamicContextIterator,
			executionParameters,
			(dynamicContextIterator: IIterator<DynamicContext>) => {
				if (this._returnExpression instanceof FlworExpression) {
					return this._returnExpression.doFlworExpressionInternal(
						outerDynamicContext,
						dynamicContextIterator,
						executionParameters
					);
				}
				let currentSequenceIterator: IIterator<Value> = null;
				return sequenceFactory.create({
					next: (_hint) => {
						while (true) {
							if (!currentSequenceIterator) {
								const temp = dynamicContextIterator.next(IterationHint.NONE);

								if (temp.done) {
									return DONE_TOKEN;
								}
								currentSequenceIterator =
									this._returnExpression.evaluateMaybeStatically(
										temp.value,
										executionParameters
									).value;
							}

							const nextValue = currentSequenceIterator.next(IterationHint.NONE);
							if (nextValue.done) {
								currentSequenceIterator = null;
								continue;
							}
							return nextValue;
						}
					},
				});
			}
		);
	}
}

export default FlworExpression;
