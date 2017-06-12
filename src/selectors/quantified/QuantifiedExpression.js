import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

/**
 * @extends {Selector}
 */
class QuantifiedExpression extends Selector {
	/**
	 * @param  {!string}           quantifier
	 * @param  {!Array<!Array<!Selector>>}  inClauses
	 * @param  {!Selector}         satisfiesExpr
	 */
	constructor (quantifier, inClauses, satisfiesExpr) {
		const specificity = inClauses.reduce(
			(specificity, inClause) => specificity.add(inClause[1].specificity),
			satisfiesExpr.specificity);
		super(specificity, {
			canBeStaticallyEvaluated: false
		});

		this._quantifier = quantifier;
		this._inClauses = inClauses;
		this._satisfiesExpr = satisfiesExpr;
	}

	evaluate (dynamicContext) {
		const evaluatedInClauses = this._inClauses.map(inClause => ({
			name: inClause[0],
			valueArray: Array.from(inClause[1].evaluateMaybeStatically(dynamicContext).value())
		}));

		const indices = new Array(evaluatedInClauses.length).fill(0);
		indices[0] = -1;

		let hasOverflowed = true;
		while (hasOverflowed) {
			hasOverflowed = false;
			for (let i = 0, l = indices.length; i < l; ++i) {
				const valueArray = evaluatedInClauses[i].valueArray;
				if (++indices[i] > valueArray.length - 1) {
					indices[i] = 0;
					continue;
				}

				const variables = Object.create(null);

				for (let y = 0; y < indices.length; y++) {
					const value = evaluatedInClauses[y].valueArray[indices[y]];
					variables[evaluatedInClauses[y].name] = Sequence.singleton(value);
				}

				const context = dynamicContext.scopeWithVariables(variables);

				const result = this._satisfiesExpr.evaluateMaybeStatically(context);

				if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
					return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
				}
				else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
					return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
				}
				hasOverflowed = true;
				break;
			}
		}

		// An every quantifier is true if all items match, a some is false if none of the items match
		return Sequence.singleton(createAtomicValue(this._quantifier === 'every', 'xs:boolean'));
	}
}
export default QuantifiedExpression;
