import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import {} from '../Expression';
import Specificity from '../Specificity';
import { Bucket } from '../util/Bucket';
import TestAbstractExpression from './TestAbstractExpression';

class KindTest extends TestAbstractExpression {
	private _nodeType: NODE_TYPES;
	constructor(nodeType: NODE_TYPES) {
		super(
			new Specificity({
				[Specificity.NODETYPE_KIND]: 1,
			}),
		);

		this._nodeType = nodeType;
	}

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		node: Value,
		executionParameters: ExecutionParameters,
	) {
		if (!isSubtypeOf(node.type, ValueType.NODE)) {
			return false;
		}
		const nodeType = executionParameters.domFacade.getNodeType(node.value);
		if (this._nodeType === 3 && nodeType === 4) {
			// CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
			return true;
		}
		return this._nodeType === nodeType;
	}
	public override getBucket(): Bucket {
		return `type-${this._nodeType}`;
	}
}
export default KindTest;
