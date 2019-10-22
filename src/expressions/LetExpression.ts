import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression from './Expression';
import PossiblyUpdatingExpression, { SequenceCallbacks } from './PossiblyUpdatingExpression';
import StaticContext from './StaticContext';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';
import { errXUST0001 } from './xquery-update/XQueryUpdateFacilityErrors';

class LetExpression extends PossiblyUpdatingExpression {
	public _bindingSequence: Expression;
	public _localName: string;
	public _namespaceURI: string | null;
	public _prefix: string;
	public _returnExpression: Expression;
	public _variableBinding: string | null;

	constructor(
		rangeVariable: { localName: string; namespaceURI: string | null; prefix: string },
		bindingSequence: Expression,
		returnExpression: Expression
	) {
		super(
			bindingSequence.specificity.add(returnExpression.specificity),
			[bindingSequence, returnExpression],
			{
				canBeStaticallyEvaluated: false,
				peer: returnExpression.peer,
				resultOrder: returnExpression.expectedResultOrder,
				subtree: returnExpression.subtree
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
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		[createBindingSequence, createReturnExpression]: SequenceCallbacks
	) {
		const scopedContext = dynamicContext.scopeWithVariableBindings({
			[this._variableBinding]: createDoublyIterableSequence(
				createBindingSequence(dynamicContext)
			)
		});

		return createReturnExpression(scopedContext);
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);

			if (!this._namespaceURI && this._prefix) {
				throw new Error(
					`XPST0081: Could not resolve namespace for prefix ${this._prefix} using in a for expression`
				);
			}
		}

		this._bindingSequence.performStaticEvaluation(staticContext);

		staticContext.introduceScope();
		this._variableBinding = staticContext.registerVariable(this._namespaceURI, this._localName);
		this._returnExpression.performStaticEvaluation(staticContext);
		staticContext.removeScope();

		this.determineUpdatingness();

		if (this._bindingSequence.isUpdating) {
			throw errXUST0001();
		}
	}
}
export default LetExpression;
