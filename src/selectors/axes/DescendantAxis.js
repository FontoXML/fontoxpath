import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import createSingleValueIterator from '../util/createSingleValueIterator';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

/**
 * @param   {!IDomFacade}       domFacade
 * @param   {!Node}             node
 * @return  {!Iterator<!Node>}
 */
function createChildGenerator (domFacade, node) {
	const childNodes = domFacade.getChildNodes(node);
	let i = 0;
	const l = childNodes.length;
	return /** @type {!Iterator<!Node>} */ ({
		next () {
			if (i >= l) {
				return DONE_TOKEN;
			}
			return ready(childNodes[i++]);
		}
	});
}

function createDescendantGenerator (domFacade, node) {
	/**
	 * @type {!Array<!Iterator<!Node>>}
	 */
	const descendantIteratorStack = [createSingleValueIterator(node)];
	return {
		next: () => {
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next();
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next();
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value));
			return ready(createNodeValue(value.value));
		}
	};
}

/**
 * @extends {Selector}
 */
class DescendantAxis extends Selector {
	/**
	 * @param  {!../tests/TestAbstractExpression}  descendantSelector
	 * @param  {{inclusive:boolean}=}    options
	 */
	constructor (descendantSelector, options) {
		options = options || { inclusive: false };
		super(descendantSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: false,
			canBeStaticallyEvaluated: false
		});

		this._descendantSelector = descendantSelector;
		this._isInclusive = !!options.inclusive;

	}

	evaluate (dynamicContext) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const inclusive = this._isInclusive;
		const iterator = createDescendantGenerator(
			dynamicContext.domFacade,
			dynamicContext.contextItem.value);
		if (!inclusive) {
			iterator.next();
		}
		/**
		 * @type {!Sequence}
		 */
		const descendantSequence = new Sequence(iterator);
		return descendantSequence.filter(item => {
			return this._descendantSelector.evaluateToBoolean(dynamicContext, item);
		});
	}
}
export default DescendantAxis;
