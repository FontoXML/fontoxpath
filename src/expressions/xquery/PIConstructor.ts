import { TinyProcessingInstructionNode } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { IterationHint, ready } from '../util/iterators';
import { evaluateNCNameExpression } from './nameExpression';

function assertValidTarget(target) {
	if (/^xml$/i.test(target)) {
		throw new Error(`XQDY0064: The target of a created PI may not be "${target}"`);
	}
}

function createPIPointer(target: string, data: string) {
	const tinyPINode: TinyProcessingInstructionNode = {
		data,
		isTinyNode: true,
		nodeName: target,
		nodeType: NODE_TYPES.PROCESSING_INSTRUCTION_NODE,
		target,
	};
	return { node: tinyPINode, graftAncestor: null };
}

class PIConstructor extends Expression {
	private _dataExpr: Expression;
	private _target: { targetExpr: Expression; targetValue: string };

	constructor(
		target: { targetExpr: Expression | null; targetValue: string | null },
		dataExpr: Expression
	) {
		const expressions = target.targetExpr ? [target.targetExpr].concat(dataExpr) : [dataExpr];
		super(
			expressions.reduce((specificity, selector) => {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				canBeStaticallyEvaluated: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
			}
		);

		this._target = target;
		this._dataExpr = dataExpr;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const dataSequence = this._dataExpr.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);
		return atomize(dataSequence, executionParameters).mapAll((items) => {
			const data = items.map((item) => castToType(item, ValueType.XSSTRING).value).join(' ');

			if (data.indexOf('?>') !== -1) {
				throw new Error(
					'XQDY0026: The contents of the data of a processing instruction may not include "?>"'
				);
			}

			if (this._target.targetValue !== null) {
				const target = this._target.targetValue;
				assertValidTarget(target);
				return sequenceFactory.singleton(
					createPointerValue(createPIPointer(target, data), executionParameters.domFacade)
				);
			}

			const targetSequence = this._target.targetExpr.evaluateMaybeStatically(
				dynamicContext,
				executionParameters
			);
			const targetIterator = evaluateNCNameExpression(executionParameters, targetSequence);

			return sequenceFactory.create({
				next: () => {
					const tv = targetIterator.next(IterationHint.NONE);
					if (tv.done) {
						return tv;
					}
					const target = tv.value.value as string;

					assertValidTarget(target);
					return ready(
						createPointerValue(
							createPIPointer(target, data),
							executionParameters.domFacade
						)
					);
				},
			});
		});
	}
}

export default PIConstructor;
