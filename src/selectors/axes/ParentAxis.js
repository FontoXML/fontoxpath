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
			.map(function (nodeValue) {
				var parentNode = domFacade.getParentNode(nodeValue.value);
				if (!parentNode) {
					return null;
				}
				return new NodeValue(dynamicContext.domFacade, parentNode);
			})
			.filter(function (nodeValue) {
				if (!nodeValue) {
					return false;
				}
				var result = this._parentSelector.evaluate(dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(nodeValue),
						contextSequence: null
					}));
				return result.getEffectiveBooleanValue();
			}.bind(this));

		return new Sequence(nodeValues);
	}
}

export default ParentAxis;
