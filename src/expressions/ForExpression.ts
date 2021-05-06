import ISequence from './dataTypes/ISequence';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value, { SequenceType } from './dataTypes/Value';
import { BaseType } from './dataTypes/BaseType';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression from './Expression';
import FlworExpression from './FlworExpression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import StaticContext from './StaticContext';
import { DONE_TOKEN, IIterator, IterationHint, ready } from './util/iterators';
import { errXUST0001 } from './xquery-update/XQueryUpdateFacilityErrors';

class ForExpression extends FlworExpression {
	private _clauseExpression: Expression;
	private _localName: string;
	private _namespaceURI: string;
	private _positionalVariableBinding: {
		localName: string;
		namespaceURI: string | null;
		prefix: string;
	} | null;
	private _positionalVariableBindingKey: string | null;
	private _prefix: string;
	private _variableBindingKey: string | null;

	constructor(
		rangeVariable: { localName: string; namespaceURI: string | null; prefix: string },
		clauseExpression: Expression,
		positionalVariableBinding: {
			localName: string;
			namespaceURI: string | null;
			prefix: string;
		} | null,
		returnExpression: PossiblyUpdatingExpression | FlworExpression
	) {
		super(
			clauseExpression.specificity.add(returnExpression.specificity),
			[clauseExpression, returnExpression],
			{
				canBeStaticallyEvaluated: false,
			},
			returnExpression
		);

		this._prefix = rangeVariable.prefix;
		this._namespaceURI = rangeVariable.namespaceURI;
		this._localName = rangeVariable.localName;

		this._variableBindingKey = null;

		this._positionalVariableBinding = positionalVariableBinding;
		this._positionalVariableBindingKey = null;

		this._clauseExpression = clauseExpression;
	}

	public doFlworExpression(
		_dynamicContext: DynamicContext,
		dynamicContextIterator: IIterator<DynamicContext>,
		executionParameters: ExecutionParameters,
		createReturnSequence: (dynamicContextIterator: IIterator<DynamicContext>) => ISequence
	): ISequence {
		let clauseIterator = null;
		let currentDynamicContext: DynamicContext = null;

		let position = 0;
		return createReturnSequence({
			next: (_hint: IterationHint) => {
				while (true) {
					if (!clauseIterator) {
						const temp = dynamicContextIterator.next(IterationHint.NONE);
						if (temp.done) {
							return DONE_TOKEN;
						}
						currentDynamicContext = temp.value;

						position = 0;

						clauseIterator = this._clauseExpression.evaluateMaybeStatically(
							currentDynamicContext,
							executionParameters
						).value;
					}

					const currentClauseValue = clauseIterator.next(IterationHint.NONE);
					if (currentClauseValue.done) {
						clauseIterator = null;
						continue;
					}

					position++;

					const variables = {
						[this._variableBindingKey]: () =>
							sequenceFactory.singleton(currentClauseValue.value),
					};

					if (this._positionalVariableBindingKey) {
						variables[this._positionalVariableBindingKey] = () =>
							sequenceFactory.singleton(
								new Value(
									{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
									position
								)
							);
					}
					return ready(currentDynamicContext.scopeWithVariableBindings(variables));
				}
			},
		});
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);

			if (!this._namespaceURI && this._prefix) {
				throw new Error(
					`XPST0081: Could not resolve namespace for prefix ${this._prefix} in a for expression`
				);
			}
		}

		this._clauseExpression.performStaticEvaluation(staticContext);
		staticContext.introduceScope();
		this._variableBindingKey = staticContext.registerVariable(
			this._namespaceURI,
			this._localName
		);

		if (this._positionalVariableBinding) {
			if (this._positionalVariableBinding.prefix) {
				this._positionalVariableBinding.namespaceURI = staticContext.resolveNamespace(
					this._positionalVariableBinding.prefix
				);

				if (
					!this._positionalVariableBinding.namespaceURI &&
					this._positionalVariableBinding.prefix
				) {
					throw new Error(
						`XPST0081: Could not resolve namespace for prefix ${this._prefix} in the positionalVariableBinding in a for expression`
					);
				}
			}

			this._positionalVariableBindingKey = staticContext.registerVariable(
				this._positionalVariableBinding.namespaceURI,
				this._positionalVariableBinding.localName
			);
		}

		this._returnExpression.performStaticEvaluation(staticContext);
		staticContext.removeScope();

		if (this._clauseExpression.isUpdating) {
			throw errXUST0001();
		}
		if (this._returnExpression.isUpdating) {
			this.isUpdating = true;
		}
	}
}

export default ForExpression;
