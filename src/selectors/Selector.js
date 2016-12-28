import DomFacade from '../DomFacade';
import DynamicContext from './DynamicContext';
import Specificity from './Specificity';
import Sequence from './dataTypes/Sequence';
import NodeValue from './dataTypes/NodeValue';

/**
 * @constructor
 * @abstract
 *
 * @param  {!Specificity}  specificity
 * @param  {!string}       expectedResultOrder  Describe what the expected sorting order is, will be used to shortcut sorting at various places.
 *                                               Either 'sorted', 'reverse-sorted' or 'unsorted'. Sorted sequences are expected to be deduplicated.
 */
function Selector (specificity, expectedResultOrder) {
    this.specificity = specificity;
    this.expectedResultOrder = expectedResultOrder;
}

/**
 * @const {string}
 */
Selector.RESULT_ORDER_SORTED = Selector.prototype.RESULT_ORDER_SORTED = 'sorted';

/**
 * @const {string}
 */
Selector.RESULT_ORDER_REVERSE_SORTED = Selector.prototype.RESULT_ORDER_REVERSE_SORTED = 'reverse-sorted';

/**
 * @const {string}
 */
Selector.RESULT_ORDER_UNSORTED = Selector.prototype.RESULT_ORDER_UNSORTED = 'unsorted';

/**
 * @deprecated use evaluate instead
 * @param   {!Node}       node
 * @param   {!DomFacade}  domFacade
 * @return  {boolean}
 */
Selector.prototype.matches = function (node, domFacade) {
    var result = this.evaluate(new DynamicContext({
        contextItem: Sequence.singleton(new NodeValue(domFacade, node)),
        contextSequence: null,
        domFacade: new DomFacade(domFacade),
        variables: {}
    }));

    return result.getEffectiveBooleanValue();
};

/**
 * Compare this selector to the other selector, checking equivalence
 *
 * @abstract
 *
 * @param   {!Selector}  _otherSelector
 * @return  {boolean}    Whether this selector is equivalent to the other
 */
Selector.prototype.equals = function (_otherSelector) {
//    throw new Error('Not Implemented');
};

/**
 * Retrieve the bucket name, if any, in which this selector can be presorted.
 *
 * Buckets can be used for quickly filtering a set of selectors to only those potentially applicable to a givne
 * node. Use getBucketsForNode to determine the buckets to consider for a given node.
 *
 * @return  {string|null}  Bucket name, or null if the selector is not bucketable.
 */
Selector.prototype.getBucket = function () {
    return null;
};

/**
 * @abstract
 * @param   {!DynamicContext}  _dynamicContext
 * @return  {!Sequence}
 */
Selector.prototype.evaluate = function (_dynamicContext) {
//    throw new Error('Not Implemented');
};

export default Selector;
