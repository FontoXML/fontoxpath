import Expression from './Expression';
import Sequence from './dataTypes/Sequence';
import Specificity from './Specificity';
import { DONE_TOKEN } from './util/iterators';

/**
 * @extends {Expression}
 */
class ForExpression extends Expression {
	/**
	 * @param  {{prefix:string, namespaceURI:string, name: string}}    rangeVariable
	 * @param  {Expression}  clauseExpression
	 * @param  {Expression}  returnExpression
	 */
	constructor (rangeVariable, clauseExpression, returnExpression) {
		super(
			clauseExpression.specificity.add(returnExpression.specificity),
			[clauseExpression, returnExpression],
			{
				canBeStaticallyEvaluated: false
			});

		this._prefix = rangeVariable.prefix;
		this._namespaceURI = rangeVariable.namespaceURI;
		this._localName = rangeVariable.localName;

		this._variableBindingKey = null;

		/**
		 * @type {!Expression}
		 */
		this._clauseExpression = clauseExpression;
		/**
		 * @type {!Expression}
		 */
		this._returnExpression = returnExpression;
	}

	performStaticEvaluation (staticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);

			if (!this._namespaceURI && this._prefix) {
				throw new Error(`XPST0081: Could not resolve namespace for prefix ${this._prefix} using in a for expression`);
			}
		}

		this._clauseExpression.performStaticEvaluation(staticContext);
		staticContext.introduceScope();
		this._variableBindingKey = staticContext.registerVariable(this._namespaceURI, this._localName);

		this._returnExpression.performStaticEvaluation(staticContext);
		staticContext.removeScope();
	}

	evaluate (dynamicContext, executionParameters) {
		const clauseIterator = this._clauseExpression.evaluateMaybeStatically(dynamicContext, executionParameters).value();
		let returnIterator = null;
		let done = false;
		return new Sequence({
			next: () => {
				while (!done) {
					if (returnIterator === null) {
						var currentClauseValue = clauseIterator.next();
						if (!currentClauseValue.ready) {
							return currentClauseValue;
						}
						if (currentClauseValue.done) {
							done = true;
							break;
						}

						const nestedContext = dynamicContext.scopeWithVariableBindings({
							[this._variableBindingKey]: () => Sequence.singleton(currentClauseValue.value)
						});

						returnIterator = this._returnExpression.evaluateMaybeStatically(
							nestedContext,
							executionParameters
						).value();
					}
					const returnValue = returnIterator.next();
					if (returnValue.done) {
						returnIterator = null;
						// Get the next one
						continue;
					}
					return returnValue;
				}
				return DONE_TOKEN;
			}
		});
	}
}

export default ForExpression;
