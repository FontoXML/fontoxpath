import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class UniversalSelector extends Selector {
	constructor () {
		super(new Specificity({
				[Specificity.UNIVERSAL_KIND]: 1
		}), {
			canBeStaticallyEvaluated: true
		});
	}

	evaluate () {
		return Sequence.singletonTrueSequence();
	}
}
export default UniversalSelector;
