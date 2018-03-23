import Selector from './Selector';
import Specificity from './Specificity';
import Sequence from './dataTypes/Sequence';
import functionRegistry from './functions/functionRegistry';
import FunctionValue from './dataTypes/FunctionValue';
import { FUNCTIONS_NAMESPACE_URI, staticallyKnownNamespaceByPrefix } from './staticallyKnownNamespaces';

function getFunctionItem (functionReference, arity) {
	let namespaceURI = functionReference.namespaceURI;
	if (!namespaceURI) {
		if (!functionReference.prefix) {
			namespaceURI = FUNCTIONS_NAMESPACE_URI;
		}
		else {
			namespaceURI = staticallyKnownNamespaceByPrefix[functionReference.prefix] || null;
			if (namespaceURI === null) {
				throw new Error(`XPST0017: There is no uri registered for prefix ${functionReference.prefix}.`);
			}
		}
	}

	return functionRegistry.getFunctionByArity(namespaceURI, functionReference.name, arity) || null;
}

/**
 * @extends {Selector}
 */
class NamedFunctionRef extends Selector {
	/**
	 * @param  {{prefix:string, namespaceURI:string, name:string}}    functionReference
	 * @param  {number}    arity
	 */
	constructor (functionReference, arity) {
		super(new Specificity({
			[Specificity.EXTERNAL_KIND]: 1
		}), {
			canBeStaticallyEvaluated: true
		});

		this._arity = arity;

		this._functionProperties = getFunctionItem(
			functionReference,
			arity);
		if (!this._functionProperties) {
			const formattedFunctionName = `${functionReference.namespaceURI ? `Q{${functionReference.namespaceURI}}` : functionReference.prefix ? `${functionReference.prefix}:` : ''}${functionReference.name}`;
			throw new Error(`XPST0017: Function ${formattedFunctionName} with arity of ${this._arity} not registered. ${functionRegistry.getAlternativesAsStringFor(functionReference.name)}`);
		}
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
		return Sequence.singleton(functionItem);

	}
}

export default NamedFunctionRef;
