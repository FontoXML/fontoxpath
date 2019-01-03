import Expression from './Expression';
import Specificity from './Specificity';
import SequenceFactory from './dataTypes/SequenceFactory';
import functionRegistry from './functions/functionRegistry';
import FunctionValue from './dataTypes/FunctionValue';
import { FUNCTIONS_NAMESPACE_URI } from './staticallyKnownNamespaces';

function buildFormattedFunctionName (functionReference) {
	return `${functionReference.namespaceURI ? `Q{${functionReference.namespaceURI}}` : functionReference.prefix ? `${functionReference.prefix}:` : ''}${functionReference.localName}`;
}

/**
 * @extends {Expression}
 */
class NamedFunctionRef extends Expression {
	/**
	 * @param  {{prefix:string, namespaceURI:?string, localName:string}}    functionReference
	 * @param  {number}    arity
	 */
	constructor (functionReference, arity) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			[],
			{
				canBeStaticallyEvaluated: true
			});

		this._arity = arity;
		this._functionReference = functionReference;

		this._functionProperties = null;
	}

	performStaticEvaluation (staticContext) {
		let namespaceURI = this._functionReference.namespaceURI;
		if (!namespaceURI) {
			if (!this._functionReference.prefix) {
				namespaceURI = FUNCTIONS_NAMESPACE_URI;
			}
			else {
				namespaceURI = staticContext.resolveNamespace(this._functionReference.prefix);
				if (namespaceURI === null) {
					throw new Error(`XPST0017: There is no uri registered for prefix ${this._functionReference.prefix}.`);
				}
			}
		}

		this._functionProperties = staticContext.lookupFunction(namespaceURI, this._functionReference.localName, this._arity) || null;

		if (!this._functionProperties) {
			throw new Error(`XPST0017: Function ${buildFormattedFunctionName(this._functionReference)} with arity of ${this._arity} not registered. ${functionRegistry.getAlternativesAsStringFor(this._functionReference.localName)}`);
		}

		super.performStaticEvaluation(staticContext);
	}

	evaluate (_dynamicContext) {
		const functionItem = new FunctionValue({
			value: this._functionProperties.callFunction,
			namespaceURI: this._functionProperties.namespaceURI,
			localName: this._functionProperties.localName,
			argumentTypes: this._functionProperties.argumentTypes,
			arity: this._arity,
			returnType: this._functionProperties.returnType
		});
		return SequenceFactory.singleton(functionItem);

	}
}

export default NamedFunctionRef;
