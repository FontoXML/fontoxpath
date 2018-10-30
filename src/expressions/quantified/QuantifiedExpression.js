import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';

/**
 * @typedef {{name:{prefix:?string,namespaceURI:?string,name:!string},sourceExpr:Expression}} InClause
 */
let InClause;

/**
 * @extends {Expression}
 */
class QuantifiedExpression extends Expression {
	/**
	 * @param  {string}              quantifier
	 * @param  {!Array<InClause>}    inClauses
	 * @param  {!Expression}         satisfiesExpr
	 */
	constructor (quantifier, inClauses, satisfiesExpr) {
		const inClauseExpressions = inClauses.map(inClause => inClause.sourceExpr);
		const inClauseNames = inClauses.map(inClause => inClause.name);

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
		this._inClauseVariableNames = [];
		for (let i = 0, l = this._inClauseNames.length; i < l; ++i) {
			const expr = this._inClauseExpressions[i];
			expr.performStaticEvaluation(staticContext);

			// The existance of this variable should be known for the next expression
			staticContext.introduceScope();
			const inClauseName = this._inClauseNames[i];
			const inClauseNameNamespaceURI = staticContext.resolveNamespace(inClauseName.prefix);
			const varBindingName = staticContext.registerVariable(inClauseNameNamespaceURI, inClauseName.localName);
			this._inClauseVariableNames[i] = varBindingName;
		}

		this._satisfiesExpr.performStaticEvaluation(staticContext);

		for (let i = 0, l = this._inClauseNames.length; i < l; ++i) {
			staticContext.removeScope();
		}
	}

	evaluate (dynamicContext, executionParameters) {
		let scopingContext = dynamicContext;
		const evaluatedInClauses = this._inClauseVariableNames.map((variableBinding, i) => {
			/**
			 * @type {!Array<!Object>}
			 */
			const allValuesInInClause = this._inClauseExpressions[i]
				.evaluateMaybeStatically(scopingContext, executionParameters).getAllValues();

			scopingContext = dynamicContext.scopeWithVariableBindings({
				[variableBinding]: () => new Sequence(allValuesInInClause)
			});

			return allValuesInInClause;
		});

		const indices = new Array(evaluatedInClauses.length).fill(0);
		indices[0] = -1;

		let hasOverflowed = true;
		while (hasOverflowed) {
			hasOverflowed = false;
			for (let i = 0, l = indices.length; i < l; ++i) {
				const valueArray = evaluatedInClauses[i];
				if (++indices[i] > valueArray.length - 1) {
					indices[i] = 0;
					continue;
				}

				const variables = Object.create(null);

				for (let y = 0; y < indices.length; y++) {
					const value = evaluatedInClauses[y][indices[y]];
					variables[this._inClauseVariableNames[y]] = () => Sequence.singleton(value);
				}

				const context = dynamicContext.scopeWithVariableBindings(variables);
				const result = this._satisfiesExpr.evaluateMaybeStatically(context, executionParameters);

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
