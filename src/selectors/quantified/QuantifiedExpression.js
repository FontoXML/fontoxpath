import Selector from '../Selector';
import BooleanValue from '../dataTypes/BooleanValue';
import Sequence from '../dataTypes/Sequence';

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
		var specificity = inClauses.reduce(
				function (specificity, inClause) {
					return specificity.add(inClause[1].specificity);
				}, satisfiesExpr.specificity);
		super(specificity);

		this._quantifier = quantifier;
		this._inClauses = inClauses;
		this._satisfiesExpr = satisfiesExpr;


	}

	evaluate (dynamicContext) {
		var evaluatedInClauses = this._inClauses.map(function (inClause) {
				return {
					name: inClause[0],
					valueArray: Array.from(inClause[1].evaluate(dynamicContext).value())
				};
			});

		var indices = new Array(evaluatedInClauses.length).fill(0);
		indices[0] = -1;

		var hasOverflowed = true;
		while (hasOverflowed) {
			hasOverflowed = false;
			for (let i = 0, l = indices.length; i < l; ++i) {
				const valueArray = evaluatedInClauses[i].valueArray;
				if (++indices[i] > valueArray.length - 1) {
					indices[i] = 0;
					continue;
				}

				var variables = Object.create(null);

				for (var y = 0; y < indices.length; y++) {
					var value = evaluatedInClauses[y].valueArray[indices[y]];
					variables[evaluatedInClauses[y].name] = Sequence.singleton(value);
				}

				var context = dynamicContext._createScopedContext({
						variables: variables
					});

				var result = this._satisfiesExpr.evaluate(context);

				if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
					return Sequence.singleton(BooleanValue.TRUE);
				}
				else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
					return Sequence.singleton(BooleanValue.FALSE);
				}
				hasOverflowed = true;
				break;
			}
		}

		// An every quantifier is true if all items match, a some is false if none of the items match
		return Sequence.singleton(this._quantifier === 'every' ? BooleanValue.TRUE : BooleanValue.FALSE);
	}
}
	export default QuantifiedExpression;
