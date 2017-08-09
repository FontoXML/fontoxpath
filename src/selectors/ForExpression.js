import Selector from './Selector';
import Sequence from './dataTypes/Sequence';
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
	 * @param  {!{varName:{prefix:string, namespaceURI:string, name:string}, expression}}  clauses
	 * @param  {!Selector}                       expression
	 */
	constructor (clause, expression) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false
		});

		this._varName = buildVarName(clause.varName);
		this._clauseExpression = clause.expression;
		this._returnExpression = expression;
	}

	evaluate (dynamicContext) {
		const clauseIterator = this._clauseExpression.evaluateMaybeStatically(dynamicContext).value();
		let returnIterator = null;
		let done = false;
		return new Sequence({
			next: () => {
				while (!done) {
					if (returnIterator === null) {
						const currentClauseValue = clauseIterator.next();
						if (!currentClauseValue.ready) {
							return currentClauseValue;
						}
						if (currentClauseValue.done) {
							done = true;
							break;
						}
						const contextWithVars = dynamicContext.scopeWithVariables({ [this._varName]: () => {
							return Sequence.singleton(currentClauseValue.value);
						}});
						returnIterator = this._returnExpression.evaluateMaybeStatically(contextWithVars).value();
					}
					const returnValue = returnIterator.next();
					if (returnValue.done) {
						returnIterator = null;
						// Get the next one
						continue;
					}
					return returnValue;
				}
				return { done: true, value: undefined, ready: true };
			}
		});
	}
}

export default ForExpression;
