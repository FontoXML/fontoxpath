import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

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
			peer: false,
			canBeStaticallyEvaluated: false
		});

		this._relativePathSelector = relativePathSelector;
	}

	evaluate (dynamicContext) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use paths.');
		}
		var node = dynamicContext.contextItem.value;
		var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		var contextSequence = Sequence.singleton(createNodeValue(documentNode));
		return this._relativePathSelector.evaluateMaybeStatically(
			dynamicContext.scopeWithFocus(0, contextSequence.first(), contextSequence));
	}

}
export default AbsolutePathSelector;
