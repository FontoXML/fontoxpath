import Selector from './Selector';
import Specificity from './Specificity';

function buildVarName ({ prefix, namespaceURI, name }) {
	if (namespaceURI) {
		throw new Error('Not implemented: for expressions with a namespace URI in the binding.');
	}
	return prefix ? `${prefix}:${name}` : name;
}

/**
 * @extends {Selector}
 */
class ForExpression extends Selector {
	/**
	 * @param  {!Array<!{varName:{prefix:string, namespaceURI:string, name:string}, expression}>}  clauses
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
			return scopedContext.scopeWithVariables({
				[buildVarName(clause.varName)]: clauseValue
			});
		}, dynamicContext);

		return this._expression.evaluateMaybeStatically(contextWithClauses);
	}
}

export default ForExpression;
