import Expression from '../Expression';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

import concatSequences from '../util/concatSequences';

function createAttribute (nodesFactory, namespaceURI, name, value) {
	const attr = nodesFactory.createAttributeNS(namespaceURI, name);
	attr.value = value;
	return attr;
}

/**
 * @extends {Expression}
 */
class DirAttributeConstructor extends Expression {
	/**
	 * @param  {!QName}                                            name
	 * @param  {!{valueString: ?string, valueExprParts: Array<!Expression>}}  value
	 */
	constructor (name, value) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._name = name.prefix ? name.prefix + ':' + name.localName : name.localName;
		this._prefix = name.prefix;
		this._namespaceURI = null;
		this._value = value;
	}

	performStaticEvaluation (staticContext) {
		const namespaceURI = staticContext.resolveNamespace(this._prefix);

		if (namespaceURI === undefined && this._prefix) {
			throw new Error(`XPST0081: The prefix ${this._prefix} could not be resolved.`);
		}
		this._namespaceURI = namespaceURI || null;
	}

	evaluate (dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;

		if (this._value.valueExprParts) {
			return concatSequences(
				this._value.valueExprParts
					.map(expr => {
						return expr
							.evaluate(dynamicContext, executionParameters)
							.atomize(executionParameters)
							.mapAll(allValues => Sequence.singleton(
								createAtomicValue(allValues.map(val => val.value).join(' '), 'xs:string')
							));
					})
					.mapAll(
						allValueParts =>
							Sequence.singleton(
								createNodeValue(
									createAttribute(
										nodesFactory,
										this._namespaceURI,
										this._name,
										allValueParts.map(val => val.value).join('')
									)
								)
							)
					));
		}

		return Sequence.singleton(createNodeValue(createAttribute(
			nodesFactory,
			this._namespaceURI,
			this._name,
			this._value.value)));

	}
}

export default DirAttributeConstructor;
