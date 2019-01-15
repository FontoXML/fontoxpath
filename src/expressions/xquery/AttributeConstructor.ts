import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { errXPST0081 } from '../XPathErrors';
import { errXQDY0044 } from './XQueryErrors';

import createAtomicValue from '../dataTypes/createAtomicValue';
import createNodeValue from '../dataTypes/createNodeValue';
import SequenceFactory from '../dataTypes/sequenceFactory';
import QName from '../dataTypes/valueTypes/QName';
import { DONE_TOKEN, ready } from '../util/iterators';
import { evaluateQNameExpression } from './nameExpression';

import StaticContext from '../StaticContext';
import concatSequences from '../util/concatSequences';

function createAttribute(nodesFactory, name, value) {
	const attr = nodesFactory.createAttributeNS(name.namespaceURI, name.buildPrefixedName());
	attr.value = value;
	return attr;
}

class AttributeConstructor extends Expression {
	public name: QName;
	private _nameExpr: Expression;
	private _staticContext: StaticContext;
	private _value: { value: string } | { valueExprParts: Expression[] };

	constructor(
		name: { expr: Expression } | { localName: string; namespaceURI: string; prefix: string },
		value: { value: string } | { valueExprParts: Expression[] }
	) {
		let childExpressions = (value as any).valueExprParts || [];
		childExpressions = childExpressions.concat((name as any).expr || []);
		super(new Specificity({}), childExpressions, {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});

		if ((name as any).expr) {
			this._nameExpr = (name as any).expr;
		} else {
			this.name = new QName(
				(name as any).prefix,
				(name as any).namespaceURI,
				(name as any).localName
			);
		}
		this._value = value;
		this._staticContext = undefined;
	}

	public evaluate(dynamicContext, executionParameters) {
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
							const nameSequence = this._nameExpr.evaluate(
								dynamicContext,
								executionParameters
							);
							nameIterator = evaluateQNameExpression(
								this._staticContext,
								executionParameters,
								nameSequence
							);
						}
						const nv = nameIterator.next();
						if (!nv.ready) {
							return nv;
						}
						name = nv.value.value;
					} else {
						name = this.name;
					}

					if (
						name &&
						(name.prefix === 'xmlns' ||
							(!name.prefix && name.localName === 'xmlns') ||
							name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
							(name.prefix === 'xml' &&
								name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
							(name.prefix &&
								name.prefix !== 'xml' &&
								name.namespaceURI === 'http://www.w3.org/XML/1998/namespace'))
					) {
						throw errXQDY0044(name);
					}
				}

				if ((this._value as any).valueExprParts) {
					const valueExprParts = (this._value as any).valueExprParts as Expression[];
					if (!valueIterator) {
						valueIterator = concatSequences(
							valueExprParts.map(expr => {
								return expr
									.evaluate(dynamicContext, executionParameters)
									.atomize(executionParameters)
									.mapAll(allValues =>
										SequenceFactory.singleton(
											createAtomicValue(
												allValues.map(val => val.value).join(' '),
												'xs:string'
											)
										)
									);
							})
						).mapAll(allValueParts =>
							SequenceFactory.singleton(
								createNodeValue(
									createAttribute(
										nodesFactory,
										name,
										allValueParts.map(val => val.value).join('')
									)
								)
							)
						).value;
					}
					return valueIterator.next();
				}

				done = true;

				return ready(
					createNodeValue(createAttribute(nodesFactory, name, (this._value as any).value))
				);
			}
		});
	}

	public performStaticEvaluation(staticContext) {
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
}

export default AttributeConstructor;
