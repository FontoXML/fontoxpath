import { NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import Value, { SequenceMultiplicity, ValueType } from './Value';

function getNodeSubType(pointer: NodePointer, domFacade: DomFacade): ValueType {
	switch (domFacade.getNodeType(pointer)) {
		case 2:
			return ValueType.ATTRIBUTE;
		case 1:
			return ValueType.ELEMENT;
		case 3:
		case 4: // CDATA nodes are text too
			return ValueType.TEXT;
		case 7:
			return ValueType.PROCESSINGINSTRUCTION;
		case 8:
			return ValueType.COMMENT;
		case 9:
			return ValueType.DOCUMENTNODE;
		default:
			return ValueType.NODE;
	}
}

export default function createPointerValue(pointer: NodePointer, domFacade: DomFacade): Value {
	const nodeValue: Value = { type: getNodeSubType(pointer, domFacade), value: pointer };
	return nodeValue;
}
