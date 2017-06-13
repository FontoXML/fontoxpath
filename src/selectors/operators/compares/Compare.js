import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import generalCompare from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';

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
	}

	evaluate (dynamicContext) {
		const firstSequence = this._firstSelector.evaluateMaybeStatically(dynamicContext);
		const secondSequence = this._secondSelector.evaluateMaybeStatically(dynamicContext);

		if ((this._compare === 'valueCompare' || this._compare === 'nodeCompare') && (firstSequence.isEmpty() || secondSequence.isEmpty())) {
			return Sequence.empty();
		}

		if (this._compare === 'nodeCompare') {
			const nodeCompareResult = nodeCompare(this._operator, firstSequence, secondSequence);
			return nodeCompareResult ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
		}

		// Atomize both sequences
		const firstAtomizedSequence = firstSequence.atomize(dynamicContext);
		const secondAtomizedSequence = secondSequence.atomize(dynamicContext);

		let result;
		switch (this._compare) {
			case 'valueCompare':
				if (!firstAtomizedSequence.isSingleton() || !secondAtomizedSequence.isSingleton()) {
					throw new Error('XPTY0004: Sequences to compare are not singleton');
				}
				result = valueCompare(this._operator, firstAtomizedSequence.first(), secondAtomizedSequence.first());
				break;
			case 'generalCompare':
				result = generalCompare(this._operator, firstAtomizedSequence, secondAtomizedSequence);
				break;
		}
		return result ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}
}

export default Compare;
