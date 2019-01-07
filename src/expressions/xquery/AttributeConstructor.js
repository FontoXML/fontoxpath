import { errXPST0081 } from '../XPathErrors';
import { errXQDY0044 } from './XQueryErrors';
import Expression from '../Expression';
import Specificity from '../Specificity';

import { evaluateQNameExpression } from './nameExpressions';
import { DONE_TOKEN, ready } from '../util/iterators';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createNodeValue from '../dataTypes/createNodeValue';
import SequenceFactory from '../dataTypes/SequenceFactory';
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
	 * @param  {!{value: ?string}|{valueExprParts: Array<!Expression>}} value
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
		let nameIterator;
		let name;

		let valueIterator;

		let done = false;
		return SequenceFactory.create({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}

				if (!name) {
					if (this._nameExpr) {
						if (!nameIterator) {
							const nameSequence = this._nameExpr.evaluate(dynamicContext, executionParameters);
							nameIterator = evaluateQNameExpression(this._staticContext, executionParameters, nameSequence);
						}
						const nv = nameIterator.next();
						if (!nv.ready) {
							return nv;
						}
						name = nv.value.value;
					} else {
						name = this.name;
					}

					if (name && (name.prefix === 'xmlns' ||
					(!name.prefix && name.localPart === 'xmlns') ||
					name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
					(name.prefix === 'xml' && name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
					(name.prefix && name.prefix !== 'xml' && name.namespaceURI === 'http://www.w3.org/XML/1998/namespace'))) {
						throw errXQDY0044(name);
					}
				}

				if (this._value.valueExprParts) {
					if (!valueIterator) {
						valueIterator = concatSequences(
							this._value.valueExprParts
								.map(expr => {
									return expr
										.evaluate(dynamicContext, executionParameters)
										.atomize(executionParameters)
										.mapAll(allValues => SequenceFactory.singleton(
											createAtomicValue(
												allValues.map(val => val.value).join(' '),
												'xs:string')
										));
								}))
							.mapAll(
								allValueParts =>
									SequenceFactory.singleton(
										createNodeValue(
											createAttribute(
												nodesFactory,
												name,
												allValueParts
													.map(val => val.value)
													.join('')
											)
										)
									)
							).value;
					}
					return valueIterator.next();
				}

				done = true;

				return ready(createNodeValue(createAttribute(
					nodesFactory,
					name,
					this._value.value)));
			}
		});
	}
}

export default AttributeConstructor;
