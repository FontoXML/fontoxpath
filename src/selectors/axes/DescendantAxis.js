import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import createSingleValueIterator from '../util/createSingleValueIterator';


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
				return { done: true, value: undefined };
			}
			return {
				done: false,
				value: childNodes[i++]
			};
		}
	});
}

function createDescendantGenerator (domFacade, node) {
	const descendantIteratorStack = [createSingleValueIterator(node)];
	return {
		next: () => {
			if (!descendantIteratorStack.length) {
				return { done: true, value: undefined };
			}
			let value = descendantIteratorStack[0].next();
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return { done: true, value: undefined };
				}
				value = descendantIteratorStack[0].next();
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value));
			return {
				done: false,
				value: createNodeValue(value.value)
			};
		}
	};
}

/**
 * @extends {Selector}
 */
class DescendantAxis extends Selector {
	/**
	 * @param  {!Selector}  descendantSelector
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
		return descendantSequence.filter((item, i) => {
			const result = this._descendantSelector.evaluateMaybeStatically(dynamicContext.scopeWithFocus(
				i,
				item,
				descendantSequence));

			return result.getEffectiveBooleanValue();
		});
	}
}
export default DescendantAxis;
