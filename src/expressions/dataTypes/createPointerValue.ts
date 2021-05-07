import { NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import { BaseType } from './BaseType';
import Value, { SequenceMultiplicity, ValueType } from './Value';

function getNodeSubType(pointer: NodePointer, domFacade: DomFacade): ValueType {
	switch (domFacade.getNodeType(pointer)) {
		case 2:
			return { kind: BaseType.ATTRIBUTE, seqType: SequenceMultiplicity.EXACTLY_ONE };
		case 1:
			return { kind: BaseType.ELEMENT, seqType: SequenceMultiplicity.EXACTLY_ONE };
		case 3:
		case 4: // CDATA nodes are text too
			return { kind: BaseType.TEXT, seqType: SequenceMultiplicity.EXACTLY_ONE };
		case 7:
			return {
				kind: BaseType.PROCESSINGINSTRUCTION,
				seqType: SequenceMultiplicity.EXACTLY_ONE,
			};
		case 8:
			return { kind: BaseType.COMMENT, seqType: SequenceMultiplicity.EXACTLY_ONE };
		case 9:
			return { kind: BaseType.DOCUMENTNODE, seqType: SequenceMultiplicity.EXACTLY_ONE };
		default:
			return {
				kind: BaseType.NODE,
				seqType: SequenceMultiplicity.EXACTLY_ONE,
			};
	}
}

export default function createPointerValue(pointer: NodePointer, domFacade: DomFacade): Value {
	const nodeValue: Value = { type: getNodeSubType(pointer, domFacade), value: pointer };
	return nodeValue;
}
