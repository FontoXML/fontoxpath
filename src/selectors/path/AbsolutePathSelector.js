import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class AbsolutePathSelector extends Selector {
	/**
	 * @param  {Selector}  relativePathSelector
	 */
	constructor (relativePathSelector) {
		super(relativePathSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			subtree: false,
			peer: false
		});

		this._relativePathSelector = relativePathSelector;
	}

	evaluate (dynamicContext) {
		var node = dynamicContext.contextItem.value;
		var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		var contextSequence = Sequence.singleton(NodeValue.createFromNode(documentNode, 'node()'));
		return this._relativePathSelector.evaluate(
			dynamicContext.createScopedContext({
				contextItem: contextSequence.first(),
				contextItemIndex: 0,
				contextSequence: contextSequence
			}));
	}

}
export default AbsolutePathSelector;
