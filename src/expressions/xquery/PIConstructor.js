import Expression from '../Expression';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

function assertValidTarget (target) {
	if (/^xml$/i.test(target)) {
		throw new Error(`XQDY0064: The target of a created PI may not be "${target}"`);
	}
}

/**
 * @extends {Expression}
 */
class PIConstructor extends Expression {
	/**
	 * @param  {!{targetExpr: ?Expression, targetValue: ?string}}  target
	 * @param  {!Expression}  dataExpr
	 */
	constructor (target, dataExpr) {
		const expressions = target.targetExpr ? [target.targetExpr].concat(dataExpr) : [dataExpr];
		super(
			expressions.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._target = target;
		this._dataExpr = dataExpr;
	}

	evaluate (dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		const dataSequence = this._dataExpr.evaluateMaybeStatically(dynamicContext, executionParameters);
		return dataSequence
			.atomize(executionParameters)
			.mapAll(items => {
				const data = items.map(item => castToType(item, 'xs:string').value).join(' ');

				if (data.indexOf('?>') !== -1) {
					throw new Error('XQDY0026: The contents of the data of a processing instruction may not include "?>"');
				}

				// Get the target
				if (this._target.targetValue !== null) {
					assertValidTarget(this._target.targetValue);
					return Sequence.singleton(createNodeValue(
						nodesFactory.createProcessingInstruction(this._target.targetValue, data)));
				}

				return this._target.targetExpr.evaluateMaybeStatically(dynamicContext, executionParameters)
					.atomize(executionParameters)
					.switchCases({
						singleton: targetSequence => {
							const target = targetSequence.first();

							if (!isSubtypeOf(target.type, 'xs:NCName') &&
								!isSubtypeOf(target.type, 'xs:string') &&
								!isSubtypeOf(target.type, 'xs:untypedAtomic')) {
								throw new Error('XPTY0004: The target of a constructed PI should be a xs:NCname, xs:string, or untyped atomic value.');
							}

							assertValidTarget(target.value);

							return Sequence.singleton(createNodeValue(
								nodesFactory.createProcessingInstruction(target.value, data)));
						},
						default: () => {
							throw new Error('XPTY0004: The target of a constructed PI should be a singleton sequence.');
						}
					});
			});
	}
}

export default PIConstructor;
