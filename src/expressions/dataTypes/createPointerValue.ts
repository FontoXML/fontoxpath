import { NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import Value, { BaseType, ValueType } from './Value';

function getNodeSubType(pointer: NodePointer, domFacade: DomFacade): ValueType {
	switch (domFacade.getNodeType(pointer)) {
		case 2:
			return { kind: BaseType.ATTRIBUTE };
		case 1:
			return { kind: BaseType.ELEMENT };
		case 3:
		case 4: // CDATA nodes are text too
			return { kind: BaseType.TEXT };
		case 7:
			return { kind: BaseType.PROCESSINGINSTRUCTION };
		case 8:
			return { kind: BaseType.COMMENT };
		case 9:
			return { kind: BaseType.DOCUMENTNODE };
		default:
			return {
				kind: BaseType.NODE,
			};
	}
}

export default function createPointerValue(pointer: NodePointer, domFacade: DomFacade): Value {
	const nodeValue: Value = { type: getNodeSubType(pointer, domFacade), value: pointer };
	return nodeValue;
}
