import Selector from './Selector';
import Specificity from './Specificity';
import Sequence from './dataTypes/Sequence';
import functionRegistry from './functions/functionRegistry';
import FunctionValue from './dataTypes/FunctionValue';

/**
 * @extends {Selector}
 */
class NamedFunctionRef extends Selector {
	/**
	 * @param  {string}    functionName
	 * @param  {number}    arity
	 */
	constructor (functionName, arity) {
		super(new Specificity({
			[Specificity.EXTERNAL_KIND]: 1
		}), Selector.RESULT_ORDERINGS.UNSORTED);

		this._functionName = functionName;
		this._arity = arity;

		var functionProperties = functionRegistry.getFunctionByArity(this._functionName, this._arity);

		if (!functionProperties) {
			throw new Error(`XPST0017: Function ${functionName} with arity of ${arity} not registered. ${functionRegistry.getAlternativesAsStringFor(functionName)}`);
		}

		this._functionItem = new FunctionValue({
			value: functionProperties.callFunction,
			name: functionName,
			argumentTypes: functionProperties.argumentTypes,
			arity: arity,
			returnType: functionProperties.returnType
		});
	}

	evaluate (_dynamicContext) {
		return Sequence.singleton(this._functionItem);
	}
}

export default NamedFunctionRef;
