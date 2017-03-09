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
	}

	equals (otherSelector) {
		return otherSelector instanceof AbsolutePathSelector &&
			this._relativePathSelector.equals(otherSelector._relativePathSelector);
	}

	evaluate (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;
		var node = nodeSequence.value[0].value;
		var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		var contextSequence = Sequence.singleton(
			new NodeValue(domFacade, documentNode));
		return this._relativePathSelector.evaluate(
			dynamicContext.createScopedContext({
				contextItem: contextSequence,
				contextSequence: contextSequence
			}));
	}

}
export default AbsolutePathSelector;
