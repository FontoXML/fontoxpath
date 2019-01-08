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
import StaticContext from '../StaticContext';

function createAttribute(nodesFactory, name, value) {
	const attr = nodesFactory.createAttributeNS(name.namespaceURI, name.buildPrefixedName());
	attr.value = value;
	return attr;
}

/**
 * @extends {Expression}
 */
class AttributeConstructor extends Expression {
	_nameExpr: Expression;
	name: QName;
	_value: { value: string; } | { valueExprParts: Expression[]; };
	_staticContext: StaticContext;

	/**
	 * @param  {} name
	 * @param  {!} value
	 */
	constructor(
		name: { expr: Expression } | { prefix: string, namespaceURI: string, localName: string },
		value: { value: string } | { valueExprParts: Array<Expression> }
	) {
		let childExpressions = (value as any).valueExprParts || [];
		childExpressions = childExpressions.concat((name as any).expr || []);
		super(
			new Specificity({}),
			childExpressions,
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		if ((name as any).expr) {
			this._nameExpr = (name as any).expr;
		} else {
			this.name = new QName((name as any).prefix, (name as any).namespaceURI, (name as any).localName);
		}
		this._value = value;
		this._staticContext = undefined;
	}

	performStaticEvaluation(staticContext) {
		this._staticContext = staticContext.cloneContext();
		if (this.name) {
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

	evaluate(dynamicContext, executionParameters) {
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

				if ((this._value as any).valueExprParts) {
					const valueExprParts = (this._value as any) as Expression[];
					if (!valueIterator) {
						valueIterator = concatSequences(
							valueExprParts
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
					(this._value as any).value)));
			}
		});
	}
}

export default AttributeConstructor;
