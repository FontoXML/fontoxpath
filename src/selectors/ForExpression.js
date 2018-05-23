import Selector from './Selector';
import Sequence from './dataTypes/Sequence';
import Specificity from './Specificity';
import { DONE_TOKEN } from './util/iterators';

function buildVarName ({ prefix, namespaceURI, name }, staticContext) {
	if (namespaceURI) {
		return `Q{${namespaceURI}}${name}}`;
	}
	return `Q${staticContext.lookupNamespaceURI(prefix)}${name}`;
}

/**
 * @extends {Selector}
 */
class ForExpression extends Selector {
	/**
	 * @param  {!{varName:{prefix:string, namespaceURI:string, name:string}, expression}}  clause
	 * @param  {!Selector}                       expression
	 */
	constructor (clause, expression) {
		super(
			new Specificity({}),
			[expression],
			{
				canBeStaticallyEvaluated: false
			});

		this._varName = clause.varName;

		this._variableBindingKey = null;

		/**
		 * @type {!Selector}
		 */
		this._clauseExpression = clause.expression;
		/**
		 * @type {!Selector}
		 */
		this._returnExpression = expression;
	}

	performStaticEvaluation (staticContext) {
		this._variableBindingKey = buildVarName(this._varName, staticContext);
	}

	evaluate (dynamicContext, executionParameters) {
		/**
		 * @type {!./util/iterators.AsyncIterator<!./dataTypes/Value>}
		 */
		const clauseIterator = this._clauseExpression.evaluateMaybeStatically(dynamicContext, executionParameters).value();
		/**
		 * @type {?./util/iterators.AsyncIterator<!./dataTypes/Value>}
		 */
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
						/**
						 * @type {!./DynamicContext}
						 */
						const contextWithVars = dynamicContext.scopeWithVariableBindings({
							[this._varName]: () => {
								return Sequence.singleton(currentClauseValue.value);
							}
						});
						returnIterator = this._returnExpression.evaluateMaybeStatically(
							contextWithVars,
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
