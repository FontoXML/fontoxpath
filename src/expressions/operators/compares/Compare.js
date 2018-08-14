import Sequence from '../../dataTypes/Sequence';
import Expression from '../../Expression';
import generalCompare from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';

/**
 * @extends {Expression}
 */
class Compare extends Expression {
	/**
	 * @param  {Array<string>}    kind
	 * @param  {!Expression}  firstExpression
	 * @param  {!Expression}  secondExpression
	 */
	constructor (kind, firstExpression, secondExpression) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false
			});
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;

		this._compare = kind[0];
		this._operator = kind[1];
	}

	evaluate (dynamicContext, executionParameters) {
		const firstSequence = this._firstExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
		const secondSequence = this._secondExpression.evaluateMaybeStatically(dynamicContext, executionParameters);

		return firstSequence.switchCases({
			empty: () => {
				if (this._compare === 'valueCompare' || this._compare === 'nodeCompare') {
					return Sequence.empty();
				}
				return Sequence.singletonFalseSequence();
			},
			default: () => secondSequence.switchCases({
				empty: () => {
					if (this._compare === 'valueCompare' || this._compare === 'nodeCompare') {
						return Sequence.empty();
					}
					return Sequence.singletonFalseSequence();
				},
				default: () => {
					if (this._compare === 'nodeCompare') {
						return nodeCompare(this._operator, executionParameters.domFacade, firstSequence, secondSequence);
					}
					// Atomize both sequences
					const firstAtomizedSequence = firstSequence.atomize(executionParameters);
					const secondAtomizedSequence = secondSequence.atomize(executionParameters);

					if (this._compare === 'valueCompare') {
						return firstAtomizedSequence.switchCases({
							singleton: () => secondAtomizedSequence.switchCases({
								singleton: () => firstAtomizedSequence.mapAll(
									([onlyFirstValue]) => secondAtomizedSequence.mapAll(
										([onlySecondValue]) => valueCompare(
											this._operator,
											onlyFirstValue,
											onlySecondValue,
											dynamicContext) ?
											Sequence.singletonTrueSequence() :
											Sequence.singletonFalseSequence())),
								default: (() => {
									throw new Error('XPTY0004: Sequences to compare are not singleton.');
								})
							}),
							default: (() => {
								throw new Error('XPTY0004: Sequences to compare are not singleton.');
							})
						});
					}
					// Only generalCompare left
					return generalCompare(this._operator, firstAtomizedSequence, secondAtomizedSequence, dynamicContext);
				}
			})
		});
	}
}

export default Compare;
