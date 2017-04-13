import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';
import Specificity from '../Specificity';

/**
 * @extends {Selector}
 */
class NodeTypeSelector extends Selector {
	/**
	 * @param  {number}  nodeType
	 */
	constructor (nodeType) {
		super(new Specificity({
			[Specificity.NODETYPE_KIND]: 1
		}), Selector.RESULT_ORDERINGS.SORTED);

		this._nodeType = nodeType;
		this._getStringifiedValue = () => `(node_type ${this._nodeType})`;
	}

	evaluate (dynamicContext) {
		if (this._nodeType === 3 && dynamicContext.contextItem.value.nodeType === 4) {
			// CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
			return Sequence.singleton(BooleanValue.TRUE);
		}
		const booleanValue = this._nodeType === dynamicContext.contextItem.value.nodeType ?
			BooleanValue.TRUE :
			BooleanValue.FALSE;
		return Sequence.singleton(booleanValue);
	}

	getBucket () {
		return 'type-' + this._nodeType;
	}
}
export default NodeTypeSelector;
