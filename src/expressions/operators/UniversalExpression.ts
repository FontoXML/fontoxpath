import sequenceFactory from '../dataTypes/sequenceFactory';
import Expression from '../Expression';
import Specificity from '../Specificity';

class UniversalExpression extends Expression {
	constructor() {
		super(
			new Specificity({
				[Specificity.UNIVERSAL_KIND]: 1,
			}),
			[],
			{
				canBeStaticallyEvaluated: true,
			}
		);
	}

	public evaluate() {
		return sequenceFactory.singletonTrueSequence();
	}
}
export default UniversalExpression;
