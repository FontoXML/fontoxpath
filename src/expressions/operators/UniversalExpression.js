import Expression from '../Expression';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Expression}
 */
class UniversalExpression extends Expression {
	constructor () {
		super(new Specificity({
				[Specificity.UNIVERSAL_KIND]: 1
		}),[],  {
			canBeStaticallyEvaluated: true
		});
	}

	evaluate () {
		return Sequence.singletonTrueSequence();
	}
}
export default UniversalExpression;
