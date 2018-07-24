import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class QuantifiedExpression extends Selector {
	/**
	 * @param  {!string}                                                     quantifier
	 * @param  {!Array<{prefix:?string,namespaceURI:?string,name:!string}>}  inClauseNames
	 * @param  {!Array<!Selector>}                                           inClauseExpressions
	 * @param  {!Selector}                                                   satisfiesExpr
	 */
	constructor (quantifier, inClauseNames, inClauseExpressions, satisfiesExpr) {
		const specificity = inClauseExpressions.reduce(
			(specificity, inClause) => specificity.add(inClause.specificity),
			satisfiesExpr.specificity);
		super(
			specificity,
			inClauseExpressions.concat(satisfiesExpr),
			{
				canBeStaticallyEvaluated: false
			});

		this._quantifier = quantifier;
		this._inClauseNames = inClauseNames;
		this._inClauseExpressions = inClauseExpressions;
		this._satisfiesExpr = satisfiesExpr;

		this._inClauseVariableNames = null;
	}

	performStaticEvaluation (staticContext) {
		let scopedContext = staticContext.introduceScope();
		this._inClauseVariableNames = this._inClauseNames.map(inClauseName => {
			scopedContext = scopedContext.introduceScope();
			return scopedContext.registerVariable(inClauseName.namespaceURI, inClauseName.name);
		});
		this._inClauseExpressions.forEach(expr => expr.performStaticEvaluation(staticContext));
		this._satisfiesExpr.performStaticEvaluation(scopedContext);
	}

	evaluate (dynamicContext, executionParameters) {
		const evaluatedInClauses = this._inClauseVariableNames.map((variableBinding, i) => ({
			name: variableBinding,
			valueArray: this._inClauseExpressions[i]
				.evaluateMaybeStatically(dynamicContext, executionParameters).getAllValues()
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

				const context = dynamicContext.scopeWithVariableBindings(variables);

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
