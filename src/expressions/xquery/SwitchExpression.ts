import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import sequenceDeepEqual, {
	itemDeepEqual,
} from '../functions/builtInFunctions_sequences_deepEqual';
import PossiblyUpdatingExpression, { SequenceCallbacks } from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import atomizeSequence from '../util/atomizeSequence';
import { IterationHint } from '../util/iterators';
import { errXUST0001 } from '../xquery-update/XQueryUpdateFacilityErrors';
import { errXPTY0004 } from './XQueryErrors';

export type SwitchExpressionClause = {
	caseClauseExpression: PossiblyUpdatingExpression;
	tests: Expression[];
};

class SwitchExpression extends PossiblyUpdatingExpression {
	private _amountOfCases: number;
	private _argExpression: Expression;
	private _testsByCase: Expression[][];

	constructor(
		argExpression: Expression,
		caseClauses: SwitchExpressionClause[],
		defaultExpression: PossiblyUpdatingExpression,
		type: SequenceType,
	) {
		const specificity = new Specificity({});
		super(
			specificity,
			[
				argExpression,
				defaultExpression,
				...caseClauses.map((clause) => clause.caseClauseExpression),
			].concat(...caseClauses.map((clause) => clause.tests.map((test) => test))),
			{
				canBeStaticallyEvaluated: false,
				peer: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				subtree: false,
			},
			type,
		);
		this._argExpression = argExpression;
		this._amountOfCases = caseClauses.length;
		this._testsByCase = caseClauses.map((clause) => clause.tests);
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		sequenceCallbacks: ((dynamicContext: DynamicContext) => ISequence)[],
	) {
		// Pick the argumentExpression.
		const evaluatedExpression = atomizeSequence(
			sequenceCallbacks[0](dynamicContext),
			executionParameters,
		);
		const [
			_argSequenceCallback,
			defaultSequenceCallback,
			...caseClauseAndTestSequenceCallbacks
		] = sequenceCallbacks;
		// Map over all values the type test, and return the result.
		return evaluatedExpression.switchCases({
			multiple: () => {
				throw errXPTY0004(
					'The operand for a switch expression should result in zero or one item',
				);
			},
			default: () => {
				const singleValue = evaluatedExpression.first();
				const isEmpty = !singleValue;

				for (let i = 0; i < this._amountOfCases; i++) {
					const results = this._testsByCase[i].map((x) =>
						x.evaluateMaybeStatically(dynamicContext, executionParameters),
					);

					for (const result of results) {
						const atomizedResult = atomizeSequence(result, executionParameters);
						if (atomizedResult.isEmpty()) {
							if (isEmpty) {
								return caseClauseAndTestSequenceCallbacks[i](dynamicContext);
							}
							continue;
						}

						if (!atomizedResult.isSingleton()) {
							throw errXPTY0004(
								'The operand for a switch case should result in zero or one item',
							);
						}

						if (isEmpty) {
							continue;
						}

						const first = atomizedResult.first();

						if (
							itemDeepEqual(
								dynamicContext,
								executionParameters,
								null,
								singleValue,
								first,
							).next(IterationHint.NONE).value
						) {
							return caseClauseAndTestSequenceCallbacks[i](dynamicContext);
						}
					}
				}

				return defaultSequenceCallback(dynamicContext);
			},
		});
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		super.performStaticEvaluation(staticContext);

		if (this._argExpression.isUpdating) {
			throw errXUST0001();
		}
	}
}

export default SwitchExpression;
