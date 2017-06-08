import Selector from './Selector';
import Specificity from './Specificity';

/**
 * @extends {Selector}
 */
class ForExpression extends Selector {
	/**
	 * @param  {!Array<!{varName, expression}>}  clauses
	 * @param  {!Selector}                       expression
	 */
	constructor (clauses, expression) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false
		});

		this._clauses = clauses;
		this._expression = expression;

	}

	evaluate (dynamicContext) {
		const contextWithClauses = this._clauses.reduce((scopedContext, clause) => {
			const clauseValue = clause.expression.evaluateMaybeStatically(scopedContext);
			return scopedContext.createScopedContext({
				variables: {
					[clause.varName]: clauseValue
				}
			});
		}, dynamicContext);

		return this._expression.evaluateMaybeStatically(contextWithClauses);
	}
}

export default ForExpression;
