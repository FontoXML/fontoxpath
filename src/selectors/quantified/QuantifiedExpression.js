import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

function buildVarName ({ prefix, namespaceURI, name }) {
	if (namespaceURI) {
		throw new Error('Not implemented: quantified expressions with a namespace URI in the binding.');
	}
	return prefix ? `${prefix}:${name}` : name;
}

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
			name: buildVarName(inClause[0]),
			valueArray: inClause[1].evaluateMaybeStatically(dynamicContext).getAllValues()
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
					variables[evaluatedInClauses[y].name] = () => Sequence.singleton(value);
				}

				const context = dynamicContext.scopeWithVariables(variables);

				const result = this._satisfiesExpr.evaluateMaybeStatically(context);

				if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
					return Sequence.singletonTrueSequence();
				}
				else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
					return Sequence.singletonFalseSequence();
				}
				hasOverflowed = true;
				break;
			}
		}

		// An every quantifier is true if all items match, a some is false if none of the items match
		return this._quantifier === 'every' ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}
}
export default QuantifiedExpression;
