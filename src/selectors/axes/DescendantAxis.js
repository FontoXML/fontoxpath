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
		this._getStringifiedValue = () => `(descendant ${this._isInclusive} ${this._descendantSelector.toString()})`;
	}

	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		/**
		 * @type {IDomFacade}
		 */
		const domFacade = dynamicContext.domFacade;

		function* collectDescendants (node, inclusive) {
			if (inclusive) {
				yield new NodeValue(node);
			}
			for (const child of domFacade.getChildNodes(node)) {
				yield* collectDescendants(child, true);
			}
		}

		const inclusive = this._isInclusive;
		const descendantSelector = this._descendantSelector;
		return new Sequence(function* () {
			const descendantSequence = new Sequence(() => collectDescendants(contextItem.value, inclusive));
			for (const childContext of dynamicContext.createSequenceIterator(descendantSequence)) {
				const nodeIsMatch = descendantSelector.evaluate(childContext).getEffectiveBooleanValue();
				if (nodeIsMatch) {
					yield childContext.contextItem;
				}
			}
		});
	}
}
export default DescendantAxis;
