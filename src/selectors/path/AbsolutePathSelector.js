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
		super(relativePathSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._relativePathSelector = relativePathSelector;
		this._getStringifiedValue = () => `(absolute-path ${this._relativePathSelector})`;

	}

	evaluate (dynamicContext) {
		var node = dynamicContext.contextItem.value;
		var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		var contextSequence = Sequence.singleton(new NodeValue(documentNode));
		return this._relativePathSelector.evaluate(
			dynamicContext._createScopedContext({
				contextItem: new NodeValue(documentNode),
				contextItemIndex: 0,
				contextSequence: contextSequence
			}));
	}

}
export default AbsolutePathSelector;
