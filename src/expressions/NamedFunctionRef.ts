import FunctionValue from './dataTypes/FunctionValue';
import sequenceFactory from './dataTypes/sequenceFactory';
import { SequenceType } from './dataTypes/Value';
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
		arity: number,
		type?: SequenceType
	) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			[],
			{
				canBeStaticallyEvaluated: true,
			},
			false,
			type
		);

		this._arity = arity;
		this._functionReference = functionReference;

		this._functionProperties = null;
	}

	public evaluate() {
		const functionItem = new FunctionValue({
			argumentTypes: this._functionProperties.argumentTypes,
			isUpdating: this._functionProperties.isUpdating,
			arity: this._arity,
			localName: this._functionProperties.localName,
			namespaceURI: this._functionProperties.namespaceURI,
			returnType: this._functionProperties.returnType,
			value: this._functionProperties.callFunction,
		});
		return sequenceFactory.singleton(functionItem);
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		let namespaceURI = this._functionReference.namespaceURI;
		let localName = this._functionReference.localName;
		const prefix = this._functionReference.prefix;
		if (!namespaceURI) {
			const functionName = staticContext.resolveFunctionName(
				{ localName, prefix },
				this._arity
			);

			if (!functionName) {
				// Resolving failed
				throw new Error(
					`XPST0017: The function ${prefix ? prefix + ':' : ''}${localName} with arity ${
						this._arity
					} could not be resolved. ${getAlternativesAsStringFor(localName)}`
				);
			}
			namespaceURI = functionName.namespaceURI;
			localName = functionName.localName;
		}

		this._functionProperties =
			staticContext.lookupFunction(namespaceURI, localName, this._arity) || null;

		if (!this._functionProperties) {
			throw new Error(
				`XPST0017: Function ${buildFormattedFunctionName(
					this._functionReference
				)} with arity of ${this._arity} not registered. ${getAlternativesAsStringFor(
					localName
				)}`
			);
		}

		super.performStaticEvaluation(staticContext);
	}
}

export default NamedFunctionRef;
