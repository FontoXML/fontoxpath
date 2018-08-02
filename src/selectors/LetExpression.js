import Selector from './Selector';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

/**
 * @extends {Selector}
 */
class LetExpression extends Selector {
	/**
	 * @param  {{prefix:string, namespaceURI:string, name: string}}    rangeVariable
	 * @param  {Selector}  bindingSequence
	 * @param  {Selector}  returnExpression
	 */
	constructor (rangeVariable, bindingSequence, returnExpression) {
		super(
			bindingSequence.specificity.add(returnExpression.specificity),
			[bindingSequence, returnExpression],
			{
				resultOrder: returnExpression.expectedResultOrder,
				subtree: returnExpression.subtree,
				peer: returnExpression.peer,
				canBeStaticallyEvaluated: false
			});

		if (rangeVariable.prefix || rangeVariable.namespaceURI) {
			throw new Error('Not implemented: let expressions with namespace usage.');
		}

		this._prefix = rangeVariable.prefix;
		this._namespaceURI = rangeVariable.namespaceURI;
		this._localName = rangeVariable.name;

		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;

		this._variableBinding = null;
	}

	performStaticEvaluation (staticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);

			if (!this._namespaceURI && this._prefix) {
				throw new Error(`XPST0081: Could not resolve namespace for prefix ${this._prefix} using in a for expression`);
			}
		}

		staticContext.introduceScope();
		this._variableBinding = staticContext.registerVariable(this._namespaceURI, this._localName);

		this._bindingSequence.performStaticEvaluation(staticContext);
		this._returnExpression.performStaticEvaluation(staticContext);
		staticContext.removeScope();
	}

	evaluate (dynamicContext, executionParameters) {
		const scopedContext = dynamicContext.scopeWithVariableBindings({
			[this._variableBinding]: createDoublyIterableSequence(this._bindingSequence.evaluateMaybeStatically(dynamicContext, executionParameters))
		});

		return this._returnExpression.evaluateMaybeStatically(scopedContext, executionParameters);
	}
}
export default LetExpression;
