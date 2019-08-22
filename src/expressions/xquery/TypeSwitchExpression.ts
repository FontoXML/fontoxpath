import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';

import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Specificity from '../Specificity';

type TypeTest = {
	occurrenceIndicator: '*' | '?' | '+';
	typeTest: Expression;
};

export type TypeSwitchCaseClause = {
	caseClauseExpression: PossiblyUpdatingExpression;
	typeTests: TypeTest[];
};

class TypeSwitchExpression extends PossiblyUpdatingExpression {
	private _amountOfCases: number;
	private _typeTestsByCase: TypeTest[][];
	constructor(
		argExpression: Expression,
		caseClauses: TypeSwitchCaseClause[],
		defaultExpression: PossiblyUpdatingExpression
	) {
		const specificity = new Specificity({});
		super(
			specificity,
			[
				argExpression,
				...caseClauses.map(clause => clause.caseClauseExpression),
				defaultExpression
			].concat(
				...caseClauses.map(clause => clause.typeTests.map(typetest => typetest.typeTest))
			),
			{
				canBeStaticallyEvaluated: false,
				peer: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				subtree: false
			}
		);

		this._amountOfCases = caseClauses.length;
		this._typeTestsByCase = caseClauses.map(clause => clause.typeTests);
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		sequenceCallbacks: ((dynamicContext: DynamicContext) => ISequence)[]
	) {
		// Pick the argumentExpression.
		const evaluatedExpression = sequenceCallbacks[0](dynamicContext);

		// Map over all values the type test, and return the result.
		return evaluatedExpression.mapAll(allValues => {
			for (let i = 0; i < this._amountOfCases; i++) {
				const typeTests = this._typeTestsByCase[i];
				// First, we check if the multiplicity is correct.
				// By default, we assume that "no explicit multiplicity == one element".
				if (
					typeTests.some(typeTest => {
						switch (typeTest.occurrenceIndicator) {
							case '?':
								if (allValues.length > 1) {
									return false;
								}
								break;
							case '*':
								break;
							case '+':
								if (allValues.length < 1) {
									return false;
								}
								break;
							default:
								if (allValues.length !== 1) {
									return false;
								}
						}
						// Once we have checked the multiplicity, let's check the types.
						const contextItems = sequenceFactory.create(allValues);
						return allValues.every((value, j) => {
							const scopedContext = dynamicContext.scopeWithFocus(
								j,
								value,
								contextItems
							);
							return typeTest.typeTest
								.evaluateMaybeStatically(scopedContext, _executionParameters)
								.getEffectiveBooleanValue();
						});
					})
				) {
					// If the condition is satisfied, return the correspondent sequence.
					return sequenceCallbacks[i + 1](dynamicContext);
				}
			}
			// If none of the case clauses are satisfied, return the default clause.
			return sequenceCallbacks[this._amountOfCases + 1](dynamicContext);
		});
	}
}

export default TypeSwitchExpression;
