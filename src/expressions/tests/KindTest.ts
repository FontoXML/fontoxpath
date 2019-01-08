import TestAbstractExpression from './TestAbstractExpression';
import Specificity from '../Specificity';


class KindTest extends TestAbstractExpression {
	_nodeType: number;
	constructor (nodeType: number) {
		super(
			new Specificity({
			[Specificity.NODETYPE_KIND]: 1
		}));

		this._nodeType = nodeType;
	}

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
