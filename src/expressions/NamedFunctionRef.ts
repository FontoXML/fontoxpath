import FunctionValue from './dataTypes/FunctionValue';
import sequenceFactory from './dataTypes/sequenceFactory';
import Expression from './Expression';
import { FunctionProperties, getAlternativesAsStringFor } from './functions/functionRegistry';
import Specificity from './Specificity';
import StaticContext from './StaticContext';

function buildFormattedFunctionName(functionReference) {
	return `${
		functionReference.namespaceURI
			? `Q{${functionReference.namespaceURI}}`
			: functionReference.prefix
			? `${functionReference.prefix}:`
			: ''
	}${functionReference.localName}`;
}

class NamedFunctionRef extends Expression {
	public _arity: number;
	public _functionProperties: FunctionProperties;
	public _functionReference: { localName: string; namespaceURI: string; prefix: string };

	constructor(
		functionReference: { localName: string; namespaceURI: string | null; prefix: string },
		arity: number
	) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			[],
			{
				canBeStaticallyEvaluated: true
			}
		);

		this._arity = arity;
		this._functionReference = functionReference;

		this._functionProperties = null;
	}

	public evaluate() {
		const functionItem = new FunctionValue({
			argumentTypes: this._functionProperties.argumentTypes,
			arity: this._arity,
			localName: this._functionProperties.localName,
			namespaceURI: this._functionProperties.namespaceURI,
			returnType: this._functionProperties.returnType,
			value: this._functionProperties.callFunction
		});
		return sequenceFactory.singleton(functionItem);
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		let namespaceURI = this._functionReference.namespaceURI;
		if (!namespaceURI) {
			if (!this._functionReference.prefix) {
				namespaceURI = staticContext.getDefaultFunctionNamespace();
			} else {
				namespaceURI = staticContext.resolveNamespace(this._functionReference.prefix);
				if (namespaceURI === null) {
					throw new Error(
						`XPST0017: There is no uri registered for prefix ${this._functionReference.prefix}.`
					);
				}
			}
		}

		this._functionProperties =
			staticContext.lookupFunction(
				namespaceURI,
				this._functionReference.localName,
				this._arity
			) || null;

		if (!this._functionProperties) {
			throw new Error(
				`XPST0017: Function ${buildFormattedFunctionName(
					this._functionReference
				)} with arity of ${this._arity} not registered. ${getAlternativesAsStringFor(
					this._functionReference.localName
				)}`
			);
		}

		super.performStaticEvaluation(staticContext);
	}
}

export default NamedFunctionRef;
