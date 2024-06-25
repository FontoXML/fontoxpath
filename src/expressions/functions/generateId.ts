import { ConcreteNode } from '../../domFacade/ConcreteNode';
import { NodePointer, TinyNode } from '../../domClone/Pointer';

const generateIdMap: WeakMap<TinyNode | ConcreteNode, string> = new WeakMap();
let generateIdCounter = 0;

function generateId(ptr: NodePointer): string {
	const node = ptr.node;
	if (!generateIdMap.has(node)) {
		generateIdMap.set(node, `id${++generateIdCounter}`);
	}
	return generateIdMap.get(node);
}

export default generateId;
