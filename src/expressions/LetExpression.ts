import Expression from './Expression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

class LetExpression extends PossiblyUpdatingExpression {
	public _bindingSequence: Expression;
	public _localName: string;
	public _namespaceURI: string;
	public _prefix: string;
	public _returnExpression: Expression;
	public _variableBinding: any;

	constructor(
		rangeVariable: { localName: string; namespaceURI: string | null; prefix: string },
		bindingSequence: Expression,
		returnExpression: Expression
	) {
		super(
			bindingSequence.specificity.add(returnExpression.specificity),
			[bindingSequence, returnExpression],
			{
				resultOrder: returnExpression.expectedResultOrder,
				subtree: returnExpression.subtree,
				peer: returnExpression.peer,
				canBeStaticallyEvaluated: false
			}
		);

		if (rangeVariable.prefix || rangeVariable.namespaceURI) {
			throw new Error('Not implemented: let expressions with namespace usage.');
		}

		this._prefix = rangeVariable.prefix;
		this._namespaceURI = rangeVariable.namespaceURI;
		this._localName = rangeVariable.localName;

		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;

		this._variableBinding = null;
	}

	public performFunctionalEvaluation(
		dynamicContext,
		_executionParameters,
		[createBindingSequence, createReturnExpression]
	) {
		const scopedContext = dynamicContext.scopeWithVariableBindings({
			[this._variableBinding]: createDoublyIterableSequence(
				createBindingSequence(dynamicContext)
			)
		});

		return createReturnExpression(scopedContext);
	}

	public performStaticEvaluation(staticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);

			if (!this._namespaceURI && this._prefix) {
				throw new Error(
					`XPST0081: Could not resolve namespace for prefix ${
						this._prefix
					} using in a for expression`
				);
			}
		}

		this._bindingSequence.performStaticEvaluation(staticContext);

		staticContext.introduceScope();
		this._variableBinding = staticContext.registerVariable(this._namespaceURI, this._localName);
		this._returnExpression.performStaticEvaluation(staticContext);
		staticContext.removeScope();
	}
}
export default LetExpression;
