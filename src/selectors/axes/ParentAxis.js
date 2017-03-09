import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class ParentAxis extends Selector {
	/**
	 * @param  {Selector}  parentSelector
	 */
	constructor (parentSelector) {
		super(parentSelector.specificity, Selector.RESULT_ORDERINGS.REVERSE_SORTED);

		this._parentSelector = parentSelector;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ParentAxis &&
			this._parentSelector.equals(otherSelector._parentSelector);
	}

	evaluate (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		var nodeValues = nodeSequence.value
			.map(nodeValue => {
				var parentNode = domFacade.getParentNode(nodeValue.value);
				if (!parentNode) {
					return null;
				}
				return new NodeValue(dynamicContext.domFacade, parentNode);
			})
			.filter(nodeValue => {
				if (!nodeValue) {
					return false;
				}
				var contextItem = Sequence.singleton(nodeValue);
				var scopedContext = dynamicContext.createScopedContext({
					contextItem: contextItem,
					contextSequence: contextItem
				});
				return this._parentSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			});

		return new Sequence(nodeValues);
	}
}

export default ParentAxis;
