import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from './Expression';
import FlworExpression from './FlworExpression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import Specificity from './Specificity';
import { DONE_TOKEN, IAsyncIterator, IterationHint, notReady, ready } from './util/iterators';

class WhereExpression extends FlworExpression {
	private _testExpression: Expression;

	constructor(
		testExpression: Expression,
		returnExpression: PossiblyUpdatingExpression | FlworExpression
	) {
		const specificity = new Specificity({});
		super(
			specificity,
			[testExpression, returnExpression],
			{
				canBeStaticallyEvaluated: false,
				peer: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				subtree: false,
			},
			returnExpression
		);

		this._testExpression = testExpression;
	}

	public doFlworExpression(
		_dynamicContext: DynamicContext,
		dynamicContextIterator: IAsyncIterator<DynamicContext>,
		executionParameters: ExecutionParameters,
		createReturnSequence: (dynamicContextIterator: IAsyncIterator<DynamicContext>) => ISequence
	): ISequence {
		let currentDynamicContext: DynamicContext = null;
		let testExpressionResult: ISequence = null;
		return createReturnSequence({
			next: () => {
				while (true) {
					if (!testExpressionResult) {
						const currentDynamicContextValue = dynamicContextIterator.next(
							IterationHint.NONE
						);
						if (!currentDynamicContextValue.ready) {
							return notReady(currentDynamicContextValue.promise);
						}
						if (currentDynamicContextValue.done) {
							return DONE_TOKEN;
						}
						currentDynamicContext = currentDynamicContextValue.value;
						testExpressionResult = this._testExpression.evaluateMaybeStatically(
							currentDynamicContext,
							executionParameters
						);
					}

					const effectiveBooleanValue = testExpressionResult.tryGetEffectiveBooleanValue();

					if (!effectiveBooleanValue.ready) {
						return notReady(effectiveBooleanValue.promise);
					}
					// Prepare for next iteration
					const dynamicContextToReturn = currentDynamicContext;
					currentDynamicContext = null;
					testExpressionResult = null;

					if (!effectiveBooleanValue.value) {
						continue;
					}
					return ready(dynamicContextToReturn);
				}
			},
		});
	}
}

export default WhereExpression;
