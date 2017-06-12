import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import Specificity from '../Specificity';
import createAtomicValue from '../dataTypes/createAtomicValue';
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
		}), { canBeStaticallyEvaluated: false });

		this._nodeType = nodeType;

	}

	evaluate (dynamicContext) {
		if (this._nodeType === 3 && dynamicContext.contextItem.value.nodeType === 4) {
			// CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
			return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
		}
		const booleanValue = createAtomicValue(this._nodeType === dynamicContext.contextItem.value.nodeType, 'xs:boolean');
		return Sequence.singleton(booleanValue);
	}

	getBucket () {
		return 'type-' + this._nodeType;
	}
}
export default NodeTypeSelector;
