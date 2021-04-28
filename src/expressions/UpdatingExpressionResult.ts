import Value from './dataTypes/Value';
import { IPendingUpdate } from './xquery-update/IPendingUpdate';
export default class UpdatingExpressionResult {
	public pendingUpdateList: IPendingUpdate[];
	public xdmValue: Value[];
	constructor(values: Value[], pendingUpdateList: IPendingUpdate[]) {
		this.xdmValue = values;
		this.pendingUpdateList = pendingUpdateList;
	}
}
