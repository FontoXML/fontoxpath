import { errXPST0081 } from '../XPathErrors';
import { errXQDY0044 } from './XQueryErrors';
import Expression from '../Expression';
import Specificity from '../Specificity';

import { evaluateQNameExpression } from './nameExpressions';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';
import QName from '../dataTypes/valueTypes/QName';

import concatSequences from '../util/concatSequences';

function createAttribute (nodesFactory, name, value) {
	const attr = nodesFactory.createAttributeNS(name.namespaceURI, name.buildPrefixedName());
	attr.value = value;
	return attr;
}

/**
 * @extends {Expression}
 */
class AttributeConstructor extends Expression {
	/**
	 * @param  {{expr: Expression}|{prefix:string, namespaceURI: ?string, localName: string}} name
	 * @param  {!{valueString: ?string}|{valueExprParts: Array<!Expression>}} value
	 */
	constructor (name, value) {
		let childExpressions = value.valueExprParts || [];
		childExpressions = childExpressions.concat(name.expr || []);
		super(
			new Specificity({}),
			childExpressions,
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		if (name.expr) {
			this._nameExpr = name.expr;
		} else {
			this.name = new QName(name.prefix, name.namespaceURI, name.localName);
		}
		this._value = value;
		this._staticContext = undefined;
	}

	performStaticEvaluation (staticContext) {
		this._staticContext = staticContext.cloneContext();
		if (this.name ) {
			if (this.name.prefix && !this.name.namespaceURI) {
				const namespaceURI = staticContext.resolveNamespace(this.name.prefix);
				if (namespaceURI === undefined && this.name.prefix) {
					throw errXPST0081(this.name.prefix);
				}
				this.name.namespaceURI = namespaceURI || null;
			}
		}
		super.performStaticEvaluation(staticContext);
	}

	evaluate (dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;

		if (this._nameExpr) {
			const nameSequence = this._nameExpr.evaluate(dynamicContext, executionParameters);
			this.name = evaluateQNameExpression(this._staticContext, executionParameters, nameSequence);
		}

		if (this.name.prefix === 'xmlns' ||
		(!this.name.prefix && this.name.localPart === 'xmlns') ||
		this.name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
		(this.name.prefix === 'xml' && this.name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
		(this.name.prefix && this.name.prefix !== 'xml' && this.name.namespaceURI === 'http://www.w3.org/XML/1998/namespace')) {
			throw errXQDY0044(this.name);
		}

		if (this._value.valueExprParts) {
			return concatSequences(
				this._value.valueExprParts
					.map(expr => {
						return expr
							.evaluate(dynamicContext, executionParameters)
							.atomize(executionParameters)
							.mapAll(allValues => Sequence.singleton(
								createAtomicValue(
									allValues.map(val => val.value).join(' '),
									'xs:string')
							));
					}))
				.mapAll(
					allValueParts =>
						Sequence.singleton(
							createNodeValue(
								createAttribute(
									nodesFactory,
									this.name,
									allValueParts
										.map(val => val.value)
										.join('')
								)
							)
						)
				);
		}

		return Sequence.singleton(createNodeValue(createAttribute(
			nodesFactory,
			this.name,
			this._value.value)));

	}
}

export default AttributeConstructor;
