import Selector from './Selector';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

/**
 * @extends {Selector}
 */
class LetExpression extends Selector {
	/**
	 * @param  {{prefix:string, namespaceURI:string, name}}    rangeVariable
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

		this._rangeVariable = rangeVariable.name;
		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;
	}

	performStaticEvaluation (staticContext) {
		const scopedStaticContext = staticContext.introduceScope();
		scopedStaticContext.registerVariable(null, this._rangeVariable, (executionParameters) => {
			return this._bindingSequence.evaluateMaybeStatically(null, executionParameters);
		});

		this._bindingSequence.performStaticEvaluation(staticContext);
		this._returnExpression.performStaticEvaluation(scopedStaticContext);
	}

	evaluate (dynamicContext, executionParameters) {
		return this._returnExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
	}
}
export default LetExpression;
