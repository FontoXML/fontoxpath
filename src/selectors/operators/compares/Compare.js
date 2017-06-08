import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import generalCompare from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';
import createAtomicValue from '../../dataTypes/createAtomicValue';

/**
 * @extends {Selector}
 */
class Compare extends Selector {
	/**
	 * @param  {Array<string>}    kind
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	constructor (kind, firstSelector, secondSelector) {
		super(
			firstSelector.specificity.add(secondSelector.specificity),
			{
				canBeStaticallyEvaluated: false
			});
		this._firstSelector = firstSelector;
		this._secondSelector = secondSelector;

		this._compare = kind[0];
		this._operator = kind[1];
		switch (kind[0]) {
			case 'generalCompare':
				this._comparator = generalCompare;
				break;
			case 'valueCompare':
				this._comparator = valueCompare;
				break;
			case 'nodeCompare':
				this._comparator = nodeCompare;
				break;
		}


	}

	evaluate (dynamicContext) {
		const firstSequence = this._firstSelector.evaluateMaybeStatically(dynamicContext);
		const secondSequence = this._secondSelector.evaluateMaybeStatically(dynamicContext);

		if ((this._compare === 'valueCompare' || this._compare === 'nodeCompare') && (firstSequence.isEmpty() || secondSequence.isEmpty())) {
			return Sequence.empty();
		}

		if (this._compare === 'nodeCompare') {
			const nodeCompareResult = createAtomicValue(this._comparator(this._operator, firstSequence, secondSequence), 'xs:boolean');
			return Sequence.singleton(nodeCompareResult);
		}

		// Atomize both sequences
		const firstAtomizedSequence = firstSequence.atomize(dynamicContext);
		const secondAtomizedSequence = secondSequence.atomize(dynamicContext);
		const booleanValue = createAtomicValue(this._comparator(this._operator, firstAtomizedSequence, secondAtomizedSequence), 'xs:boolean');
		return Sequence.singleton(booleanValue);
	}
}

export default Compare;
