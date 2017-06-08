import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

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
		return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
	}
}
export default UniversalSelector;
