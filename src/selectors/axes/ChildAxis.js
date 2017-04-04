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

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;
		var nodeValues = domFacade.getChildNodes(contextItem.value[0].value)
			.map((node) => new NodeValue(node))
			.filter((node) => {
				var contextItem = Sequence.singleton(node);
				var scopedContext = dynamicContext.createScopedContext({
					contextItem: contextItem,
					contextSequence: contextItem
				});
				return this._childSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			});

		return new Sequence(nodeValues);
	}
}
export default ChildAxis;
