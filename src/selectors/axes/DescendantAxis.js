import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

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
		super(descendantSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._descendantSelector = descendantSelector;
		this._isInclusive = !!options.inclusive;
	}

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(descendant ${this._isInclusive} ${this._descendantSelector.toString()})`;
		}
		return this._stringifiedValue;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		/**
		 * @type {IDomFacade}
		 */
		const domFacade = dynamicContext.domFacade;

		function collectDescendants (node) {
			/**
			 * @type {../DynamicContext}
			 */
			const childScopedContext = dynamicContext.createScopedContext({
				contextItemIndex: 0,
				contextSequence: Sequence.singleton(new NodeValue(node))
			});

			return dynamicContext.cache.withCache(childScopedContext, '(descendant true node())', function () {
				return domFacade.getChildNodes(childScopedContext.contextItem.value)
					.map(childNode => collectDescendants(childNode))
					.reduce(
						(descendants, childDescendants) => descendants.merge(childDescendants),
						childScopedContext.contextSequence);
			});
		}

		let collectedDescendants;
		if (this._isInclusive) {
			collectedDescendants = collectDescendants(contextItem.value);
		}
		else {
			collectedDescendants = domFacade.getChildNodes(contextItem.value)
				.map(childNode => collectDescendants(childNode))
				.reduce(
					(descendants, childDescendants) => descendants.merge(childDescendants),
					Sequence.empty());
		}

		const filteredNodeValues = [];
		const scopedContext = dynamicContext.createScopedContext({
			contextItemIndex: 0,
			contextSequence: collectedDescendants
		});

		for (let i = 0, l = collectedDescendants.value.length; i < l; ++i) {
			const nodeIsMatch = this._descendantSelector.evaluate(
				scopedContext.createScopedContext({ contextItemIndex: i }))
					.getEffectiveBooleanValue();
			if (nodeIsMatch) {
				filteredNodeValues.push(collectedDescendants.value[i]);
			}
		}
		return new Sequence(filteredNodeValues);
	}
}
export default DescendantAxis;
