import Expression, { RESULT_ORDERINGS } from '../Expression';

import Specificity from '../Specificity';
import SequenceFactory from '../dataTypes/SequenceFactory';

class UniversalExpression extends Expression {
	constructor() {
		super(
			new Specificity({
				[Specificity.UNIVERSAL_KIND]: 1
			}),
			[],
			{
				canBeStaticallyEvaluated: true
			}
		);
	}

	evaluate() {
		return SequenceFactory.singletonTrueSequence();
	}
}
export default UniversalExpression;
