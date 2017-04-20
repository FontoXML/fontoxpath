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
		super(new Specificity({}));

		this._clauses = clauses;
		this._expression = expression;

	}

	evaluate (dynamicContext) {
		const contextWithClauses = this._clauses.reduce((scopedContext, clause) => {
			const clauseValue = clause.expression.evaluate(scopedContext);
			return scopedContext.createScopedContext({
				variables: {
					[clause.varName]: clauseValue
				}
			});
		}, dynamicContext);

		return this._expression.evaluate(contextWithClauses);
	}
}

export default ForExpression;
