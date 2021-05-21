import { SequenceType, sequenceTypeToString } from '../expressions/dataTypes/Value';
import { getBinaryPrefabOperator } from '../expressions/operators/arithmetic/BinaryOperator';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateBinOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined,
	operator: string
): SequenceType | undefined {
	if (!left || !right) {
		return undefined;
	}

	if (left.mult !== right.mult) {
		throw new Error("Multiplicities in binary addition operator don't match");
	}

	const funcData = getBinaryPrefabOperator(left.type, right.type, operator);

	if (funcData) {
		const type = { type: funcData[1], mult: left.mult };
		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	throw new Error(
		`XPTY0004: ${operator} not available for types ${sequenceTypeToString(
			left
		)} and ${sequenceTypeToString(right)}`
	);
}
