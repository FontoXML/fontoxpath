import { ConcreteNode } from '../../domFacade/ConcreteNode';

export abstract class IPendingUpdate {
	public readonly target: ConcreteNode;
	constructor(public type: string) {}

	public abstract toTransferable(): { type: string };
}
