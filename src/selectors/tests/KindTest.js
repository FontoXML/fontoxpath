import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import Specificity from '../Specificity';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';
/**
 * @extends {Selector}
 */
class KindTest extends Selector {
	/**
	 * @param  {number}  nodeType
	 */
	constructor (nodeType) {
		super(new Specificity({
			[Specificity.NODETYPE_KIND]: 1
		}), { canBeStaticallyEvaluated: false });

		this._nodeType = nodeType;

	}

	/**
	 * @param   {!../DynamicContext}      dynamicContext
	 * @return  {!../dataTypes/Sequence}
	 */
	evaluate (dynamicContext) {
		if (this._nodeType === 3 && dynamicContext.contextItem.value.nodeType === 4) {
			// CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
			return Sequence.singletonTrueSequence();
		}
		const booleanValue = this._nodeType === dynamicContext.contextItem.value.nodeType ? trueBoolean : falseBoolean;
		return Sequence.singleton(booleanValue);
	}

	getBucket () {
		return 'type-' + this._nodeType;
	}
}
export default KindTest;
