import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';

import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import { IAsyncIterator, IterationHint, notReady } from '../util/iterators';

class TypeSwitchExpression extends PossiblyUpdatingExpression {
	constructor(
		argExpression: Expression,
		// caseClauseTypeTests: Expression[],
		caseClauseExpressions: PossiblyUpdatingExpression[],
		defaultExpression: PossiblyUpdatingExpression
	) {
		const specificity = new Specificity({});

		super(specificity, [argExpression, ...caseClauseExpressions, defaultExpression], {
			canBeStaticallyEvaluated: false,
			peer: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
			subtree: false
		});
	}

	public evaluateToBoolean(_dynamicContext, node) {
		// TODO: make MArtin figure out WTF
		return true;
	}

	public performStaticEvaluation() {
		// TODO: Static evaluateion is where we need to declare the variables for each caseClause, if needed
		// Look at LetExpression for inspiration.
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		sequenceCallbacks: ((dynamicContext: DynamicContext) => ISequence)[]
	) {
		const [getArgExpressionSequence, ...caseClauseExpressionsAndDefault] = sequenceCallbacks;
		const [getCaseClaseSequences, getDefaultSequence] = sequenceCallbacks;

		let resultIterator: IAsyncIterator<Value> | null = null;
		const ifExpressionResultSequence = sequenceCallbacks[0](dynamicContext);

		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				if (!resultIterator) {
					const ifExpressionResult = ifExpressionResultSequence.tryGetEffectiveBooleanValue();

					if (!ifExpressionResult.ready) {
						return notReady(ifExpressionResult.promise);
					}
					const resultSequence = ifExpressionResult.value
						? sequenceCallbacks[1](dynamicContext)
						: sequenceCallbacks[2](dynamicContext);
					resultIterator = resultSequence.value;
				}
				return resultIterator.next(hint);
			}
		});
	}
}

export default TypeSwitchExpression;
