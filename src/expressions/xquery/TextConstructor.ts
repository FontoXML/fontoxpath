import atomize from '../dataTypes/atomize';
import { TextNodePointer, TinyTextNode } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import castToType from '../dataTypes/castToType';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class TextConstructor extends Expression {
	private _expr: Expression;
	constructor(expr: Expression | null) {
		super(expr ? expr.specificity : new Specificity({}), expr ? [expr] : [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		this._expr = expr;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		if (!this._expr) {
			return sequenceFactory.empty();
		}
		const sequence = this._expr.evaluateMaybeStatically(dynamicContext, executionParameters);
		return atomize(sequence, executionParameters).mapAll((items) => {
			if (items.length === 0) {
				return sequenceFactory.empty();
			}
			const content = items.map((item) => castToType(item, 'xs:string').value).join(' ');

			const tinyTextNode: TinyTextNode = {
				data: content,
				isTinyNode: true,
				nodeType: NODE_TYPES.TEXT_NODE,
			};
			const textNodePointer = { node: tinyTextNode, graftAncestor: null };

			return sequenceFactory.singleton(
				createPointerValue(textNodePointer, executionParameters.domFacade)
			);
		});
	}
}

export default TextConstructor;
