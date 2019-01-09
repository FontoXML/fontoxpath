import { evaluateNCNameExpression } from './nameExpression';
import Expression from '../Expression';
import Specificity from '../Specificity';

import { ready } from '../util/iterators';
import createNodeValue from '../dataTypes/createNodeValue';
import SequenceFactory from '../dataTypes/SequenceFactory';
import castToType from '../dataTypes/castToType';

function assertValidTarget (target) {
	if (/^xml$/i.test(target)) {
		throw new Error(`XQDY0064: The target of a created PI may not be "${target}"`);
	}
}

class PIConstructor extends Expression {
	_target: { targetExpr: Expression; targetValue: string; };
	_dataExpr: Expression;

	constructor (target: { targetExpr: Expression | null; targetValue: string | null; }, dataExpr: Expression) {
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

				if (this._target.targetValue !== null) {
					const target = this._target.targetValue;
					assertValidTarget(target);
					return SequenceFactory.singleton(createNodeValue(nodesFactory.createProcessingInstruction(target, data)));
				}

				const targetSequence = this._target.targetExpr.evaluateMaybeStatically(dynamicContext, executionParameters);
				const targetIterator = evaluateNCNameExpression(executionParameters, targetSequence);

				return SequenceFactory.create({ next: () => {
					const tv = targetIterator.next();
					if (tv.done || !tv.ready) {
						return tv;
					}
					const target = tv.value.value;

					assertValidTarget(target);
					return ready(createNodeValue(nodesFactory.createProcessingInstruction(target, data)));
				} });
			});
	}
}

export default PIConstructor;
