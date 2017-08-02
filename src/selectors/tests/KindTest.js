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
	evaluateToBoolean (_dynamicContext, node) {
		if (this._nodeType === 3 && node.value.nodeType === 4) {
			// CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
			return true;
		}
		return this._nodeType === node.value.nodeType;
	}

	getBucket () {
		return 'type-' + this._nodeType;
	}
}
export default KindTest;
