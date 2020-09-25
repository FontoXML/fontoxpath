import { NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import Value from './Value';

function getNodeSubType(pointer: NodePointer, domFacade: DomFacade) {
	switch (domFacade.getNodeType(pointer)) {
		case 2:
			return 'attribute()';
		case 1:
			return 'element()';
		case 3:
		case 4: // CDATA nodes are text too
			return 'text()';
		case 7:
			return 'processing-instruction()';
		case 8:
			return 'comment()';
		case 9:
			return 'document()';
		default:
			return 'node()';
	}
}

export default function createPointerValue(pointer: NodePointer, domFacade: DomFacade): Value {
	const nodeValue: Value = { type: getNodeSubType(pointer, domFacade), value: pointer };
	return nodeValue;
}
