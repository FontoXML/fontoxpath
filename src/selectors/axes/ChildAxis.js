import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class ChildAxis extends Selector {
	constructor (childSelector) {
		super(childSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._childSelector = childSelector;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ChildAxis &&
			this._childSelector.equals(otherSelector._childSelector);
	}

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;
		var nodeValues = domFacade.getChildNodes(contextItem.value[0].value)
			.filter(function (node) {
				return this._childSelector.evaluate(
					dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
						contextSequence: null
					})).getEffectiveBooleanValue();
			}.bind(this))
			.map(function (node) {
				return new NodeValue(dynamicContext.domFacade, node);
			});

		return new Sequence(nodeValues);
	}
}
export default ChildAxis;
