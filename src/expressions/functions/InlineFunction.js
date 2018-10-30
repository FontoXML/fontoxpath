import Expression from '../Expression';
import DynamicContext from '../DynamicContext';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import FunctionValue from '../dataTypes/FunctionValue';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import TypeDeclaration from '../dataTypes/TypeDeclaration';

/**
 * @typedef {{prefix: string, namespaceURI: (string|null), localName: string}} QName
 */
let QName;

/**
 * @extends Expression
 */
class InlineFunction extends Expression {
	/**
	 * @param  {Array<{name:QName, type: TypeDeclaration}>}  paramDescriptions
	 * @param  {TypeDeclaration}         returnType
	 * @param  {Expression}              functionBody
	 */
	constructor (paramDescriptions, returnType, functionBody) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			[functionBody],
			{
			// inline functions may never be statically evaluated because the domfacade may be used in the function body to resolve dom relations
			canBeStaticallyEvaluated: false,
			expectedResultOrder: Expression.RESULT_ORDERINGS.UNSORTED
		});

		this._parameterNames = paramDescriptions.map(({ name }) => name);
		this._parameterTypes = paramDescriptions.map(({ type }) => type);

		this._parameterBindingNames = null;
		this._returnType = returnType;
		this._functionBody = functionBody;
	}

	performStaticEvaluation (staticContext) {
		staticContext.introduceScope();
		this._parameterBindingNames = this._parameterNames
			.map(name => {
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
	}

	evaluate (dynamicContext, executionParameters) {
		/**
		 * @param   {DynamicContext}           _unboundDynamicContext  The dynamic context at the moment of the function call. This will not be used because the context of a function is the context at the moment of declaration.
		 *                                                                  This shall not be used
		 * @param   {...!Sequence}   parameters              The parameters of the function
		 * @return  {!Sequence}      The result of the function call
		 */
		const executeFunction = (_unboundDynamicContext, _executionContext, _staticContext, ...parameters) => {
			// Since functionCall already does typechecking, we do not have to do it here
			const scopedDynamicContext = dynamicContext
				.scopeWithFocus(-1, null, Sequence.empty())
				.scopeWithVariableBindings(this._parameterBindingNames.reduce((paramByName, bindingName, i) => {
					paramByName[bindingName] = createDoublyIterableSequence(parameters[i]);
					return paramByName;
				}, Object.create(null)));
			return this._functionBody.evaluateMaybeStatically(scopedDynamicContext, executionParameters);
		};

		const functionItem = new FunctionValue({
			value: executeFunction,
			localName: 'dynamic-function',
			namespaceURI: '',
			argumentTypes: this._parameterTypes,
			arity: this._parameterTypes.length,
			returnType: this._returnType
		});
		return Sequence.singleton(functionItem);
	}
}

export default InlineFunction;
