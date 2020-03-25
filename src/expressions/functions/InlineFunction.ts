import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import TypeDeclaration from '../dataTypes/TypeDeclaration';
import QName from '../dataTypes/valueTypes/QName';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class InlineFunction extends Expression {
	private _functionBody: PossiblyUpdatingExpression;
	private _parameterBindingNames: string[];
	private _parameterNames: QName[];
	private _parameterTypes: TypeDeclaration[];
	private _returnType: TypeDeclaration;

	constructor(
		paramDescriptions: { name: QName; type: TypeDeclaration }[],
		returnType: TypeDeclaration,
		functionBody: PossiblyUpdatingExpression
	) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			[functionBody],
			{
				// inline functions may never be statically evaluated because the domfacade may be used in the function body to resolve dom relations
				canBeStaticallyEvaluated: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
			}
		);

		this._parameterNames = paramDescriptions.map(({ name }) => name);
		this._parameterTypes = paramDescriptions.map(({ type }) => type);

		this._parameterBindingNames = null;
		this._returnType = returnType;
		this._functionBody = functionBody;
	}

	public evaluate(dynamicContext, executionParameters) {
		/**
		 * @param  _unboundDynamicContext  The dynamic context at the moment of the function call. This will not be used because the context of a function is the context at the moment of declaration.
		 *                                                                  This shall not be used
		 * @param  parameters              The parameters of the function
		 * @return The result of the function call
		 */
		const executeFunction = (
			_unboundDynamicContext: DynamicContext,
			_executionParameters: ExecutionParameters,
			_staticContext: StaticContext,
			...parameters: ISequence[]
		) => {
			// Since functionCall already does typechecking, we do not have to do it here
			const scopedDynamicContext = dynamicContext
				.scopeWithFocus(-1, null, sequenceFactory.empty())
				.scopeWithVariableBindings(
					this._parameterBindingNames.reduce((paramByName, bindingName, i) => {
						paramByName[bindingName] = createDoublyIterableSequence(parameters[i]);
						return paramByName;
					}, Object.create(null))
				);
			return this._functionBody.evaluateMaybeStatically(
				scopedDynamicContext,
				executionParameters
			);
		};

		const functionItem = new FunctionValue({
			argumentTypes: this._parameterTypes,
			arity: this._parameterTypes.length,
			isAnonymous: true,
			isUpdating: this._functionBody.isUpdating,
			localName: 'dynamic-function',
			namespaceURI: '',
			returnType: this._returnType,
			value: executeFunction,
		});
		return sequenceFactory.singleton(functionItem);
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		staticContext.introduceScope();
		this._parameterBindingNames = this._parameterNames.map((name) => {
			let namespaceURI = name.namespaceURI;
			const prefix = name.prefix;
			const localName = name.localName;

			if (!namespaceURI === null && prefix !== '*') {
				namespaceURI = staticContext.resolveNamespace(prefix);
			}
			return staticContext.registerVariable(namespaceURI, localName);
		});

		this._functionBody.performStaticEvaluation(staticContext);
		staticContext.removeScope();

		if (this._functionBody.isUpdating) {
			throw new Error('Not implemented: inline functions can not yet be updating.');
		}
	}
}

export default InlineFunction;
