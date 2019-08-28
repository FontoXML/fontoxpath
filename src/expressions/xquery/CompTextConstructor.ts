import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

import castToType from '../dataTypes/castToType';
import createNodeValue from '../dataTypes/createNodeValue';
import sequenceFactory from '../dataTypes/sequenceFactory';

class CompTextConstructor extends Expression {
	private _expr: Expression;
	constructor(expr: Expression | null) {
		super(expr ? expr.specificity : new Specificity({}), expr ? [expr] : [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});

		this._expr = expr;
	}

	public evaluate(_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		if (!this._expr) {
			return sequenceFactory.empty();
		}
		const sequence = this._expr.evaluateMaybeStatically(_dynamicContext, executionParameters);
		return sequence.atomize(executionParameters).mapAll(items => {
			if (items.length === 0) {
				return sequenceFactory.empty();
			}
			const content = items.map(item => castToType(item, 'xs:string').value).join(' ');

			return sequenceFactory.singleton(createNodeValue(nodesFactory.createTextNode(content)));
		});
	}
}

export default CompTextConstructor;
