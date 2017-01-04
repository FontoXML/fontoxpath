import Sequence from '../../dataTypes/Sequence';
import BooleanValue from '../../dataTypes/BooleanValue';
import Selector from '../../Selector';
import generalCompare from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';

/**
 * @constructor
 * @extends Selector
 * @param  {Array<string>}    kind
 * @param  {Selector}  firstSelector
 * @param  {Selector}  secondSelector
 */
function Compare (kind, firstSelector, secondSelector) {
    Selector.call(
        this,
        firstSelector.specificity.add(secondSelector.specificity),
        Selector.RESULT_ORDER_SORTED);
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

Compare.prototype = Object.create(Selector.prototype);
Compare.prototype.constructor = Compare;

Compare.prototype.equals = function (otherSelector) {
    if (otherSelector === this) {
        return true;
    }
    return otherSelector instanceof Compare &&
        this._firstSelector.equals(otherSelector._firstSelector) &&
        this._secondSelector.equals(otherSelector._secondSelector);
};

Compare.prototype.evaluate = function (dynamicContext) {
    var firstSequence = this._firstSelector.evaluate(dynamicContext),
        secondSequence = this._secondSelector.evaluate(dynamicContext);

	if ((this._compare === 'valueCompare' || this._compare === 'nodeCompare') && (firstSequence.isEmpty() || secondSequence.isEmpty())) {
		return Sequence.empty();
	}

	if (this._compare === 'nodeCompare') {
		var nodeCompareResult = this._comparator(this._operator, firstSequence, secondSequence) ?
			BooleanValue.TRUE :
			BooleanValue.FALSE;
		return Sequence.singleton(nodeCompareResult);
	}

    // Atomize both sequences
    var firstAtomizedSequence = firstSequence.atomize();
    var secondAtomizedSequence = secondSequence.atomize();
    var booleanValue = this._comparator(this._operator, firstAtomizedSequence, secondAtomizedSequence) ?
        BooleanValue.TRUE :
        BooleanValue.FALSE;
    return Sequence.singleton(booleanValue);
};

export default Compare;
