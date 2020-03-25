import {
	ConcreteAttributeNode,
	ConcreteChildNode,
	ConcreteDocumentNode,
	ConcreteElementNode,
} from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoPendingUpdate extends InsertPendingUpdate {
	public readonly target: ConcreteElementNode | ConcreteDocumentNode;
	public readonly type: 'insertInto';
	constructor(
		target: ConcreteElementNode | ConcreteElementNode,
		content: (ConcreteAttributeNode | ConcreteChildNode)[]
	) {
		super(target, content, 'insertInto');
	}
}
