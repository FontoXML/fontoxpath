import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { BaseType, SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Specificity from '../Specificity';
import TestAbstractExpression from './TestAbstractExpression';

class KindTest extends TestAbstractExpression {
	private _nodeType: number;
	constructor(nodeType: number) {
		super(
			new Specificity({
				[Specificity.NODETYPE_KIND]: 1,
			})
		);

		this._nodeType = nodeType;
	}

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		node: Value,
		executionParameters: ExecutionParameters
	) {
		if (!isSubtypeOf(node.type.kind, BaseType.NODE)) {
			return false;
		}
		const nodeType = executionParameters.domFacade.getNodeType(node.value);
		if (this._nodeType === 3 && nodeType === 4) {
			// CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
			return true;
		}
		return this._nodeType === nodeType;
	}

	public getBucket() {
		return 'type-' + this._nodeType;
	}
}
export default KindTest;
