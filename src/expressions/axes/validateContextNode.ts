import { NodePointer } from '../../domClone/Pointer';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { ValueType } from '../dataTypes/Value';

export default function validateContextNode(value: Value): NodePointer {
	if (value === null) {
		throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
	}
	if (!isSubtypeOf(value.type, ValueType.NODE)) {
		throw new Error('XPTY0020: Axes can only be applied to nodes.');
	}

	return value.value as NodePointer;
}
