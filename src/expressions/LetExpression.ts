import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression from './Expression';
import FlworExpression from './FlworExpression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import StaticContext from './StaticContext';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';
import { DONE_TOKEN, IAsyncIterator, IterationHint, ready } from './util/iterators';
import { errXUST0001 } from './xquery-update/XQueryUpdateFacilityErrors';

class LetExpression extends FlworExpression {
	public _bindingSequence: Expression;
	public _localName: string;
	public _namespaceURI: string | null;
	public _prefix: string;
	public _variableBinding: string | null;

	constructor(
		rangeVariable: { localName: string; namespaceURI: string | null; prefix: string },
		bindingSequence: Expression,
		returnExpression: PossiblyUpdatingExpression | FlworExpression
	) {
		super(
			bindingSequence.specificity.add(returnExpression.specificity),
			[bindingSequence, returnExpression],
			{
				canBeStaticallyEvaluated: false,
				peer: returnExpression.peer,
				resultOrder: returnExpression.expectedResultOrder,
				subtree: returnExpression.subtree,
			},
			returnExpression
		);

		if (rangeVariable.prefix || rangeVariable.namespaceURI) {
			throw new Error('Not implemented: let expressions with namespace usage.');
		}

		this._prefix = rangeVariable.prefix;
		this._namespaceURI = rangeVariable.namespaceURI;
		this._localName = rangeVariable.localName;

		this._bindingSequence = bindingSequence;

		this._variableBinding = null;
	}

	public doFlworExpression(
		_dynamicContext: DynamicContext,
		dynamicContextIterator: IAsyncIterator<DynamicContext>,
		executionParameters: ExecutionParameters,
		createReturnSequence: (dynamicContextIterator: IAsyncIterator<DynamicContext>) => ISequence
	): ISequence {
		return createReturnSequence({
			next: (_hint) => {
				let currentDynamicContext: DynamicContext = null;
				const temp = dynamicContextIterator.next(IterationHint.NONE);
				if (temp.done) {
					return DONE_TOKEN;
				}

				currentDynamicContext = temp.value;
				const scopedContext = currentDynamicContext.scopeWithVariableBindings({
					[this._variableBinding]: createDoublyIterableSequence(
						this._bindingSequence.evaluateMaybeStatically(
							currentDynamicContext,
							executionParameters
						)
					),
				});
				return ready(scopedContext);
			},
		});
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

		this.isUpdating = this._returnExpression.isUpdating;

		if (this._bindingSequence.isUpdating) {
			throw errXUST0001();
		}
	}
}
export default LetExpression;
