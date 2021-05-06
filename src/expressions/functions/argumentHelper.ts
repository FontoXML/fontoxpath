import { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import promoteToType from '../dataTypes/promoteToType';
import Value, { SequenceType, ValueType, valueTypeToString } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';
import ExecutionParameters from '../ExecutionParameters';

function mapItem(
	argumentItem: Value,
	type: ValueType,
	executionParameters: ExecutionParameters,
	functionName: string,
	isReturn: boolean
) {
	if (isSubtypeOf(argumentItem.type.kind, type.kind)) {
		return argumentItem;
	}

	if (
		isSubtypeOf(type.kind, BaseType.XSANYATOMICTYPE) &&
		isSubtypeOf(argumentItem.type.kind, BaseType.NODE)
	) {
		// Assume here that a node always atomizes to a singlevalue. This will not work
		// anymore when schema support will be imlemented.
		argumentItem = atomizeSingleValue(argumentItem, executionParameters).first();
	}

	// Maybe after atomization, we have the correct type
	if (isSubtypeOf(argumentItem.type.kind, type.kind)) {
		return argumentItem;
	}

	// Everything is an anyAtomicType, so no casting necessary.
	if (type.kind === BaseType.XSANYATOMICTYPE) {
		return argumentItem;
	}
	if (isSubtypeOf(argumentItem.type.kind, BaseType.XSUNTYPEDATOMIC)) {
		// We might be able to cast this to the wished type
		const convertedItem = castToType(argumentItem, type);
		if (!convertedItem) {
			throw new Error(
				`XPTY0004 Unable to convert ${
					isReturn ? 'return' : 'argument'
				} of type ${valueTypeToString(argumentItem.type)} to type ${valueTypeToString(
					type
				)} while calling ${functionName}`
			);
		}
		return convertedItem;
	}

	// We need to promote this
	const item = promoteToType(argumentItem, type.kind);
	if (!item) {
		throw new Error(
			`XPTY0004 Unable to cast ${
				isReturn ? 'return' : 'argument'
			} of type ${valueTypeToString(argumentItem.type)} to type ${valueTypeToString(
				type
			)} while calling ${functionName}`
		);
	}
	return item;
}

/**
 * Test whether the provided argument is valid to be used as an function argument of the given type
 */
export const performFunctionConversion = (
	argumentType: ValueType,
	argument: ISequence,
	executionParameters: ExecutionParameters,
	functionName: string,
	isReturn: boolean
): ISequence => {
	if (argumentType.seqType === SequenceType.ZERO_OR_ONE) {
		return argument.switchCases({
			default: () =>
				argument.map((value) =>
					mapItem(value, argumentType, executionParameters, functionName, isReturn)
				),
			multiple: () => {
				throw new Error(
					`XPTY0004: Multiplicity of ${
						isReturn ? 'function return value' : 'function argument'
					} of type ${argumentType}${
						argumentType.kind || ''
					} for ${functionName} is incorrect. Expected "?", but got "+".`
				);
			},
		});
	}
	if (argumentType.seqType === SequenceType.ONE_OR_MORE) {
		return argument.switchCases({
			empty: () => {
				throw new Error(
					`XPTY0004: Multiplicity of ${
						isReturn ? 'function return value' : 'function argument'
					} of type ${argumentType}${
						argumentType.kind || ''
					} for ${functionName} is incorrect. Expected "+", but got "empty-sequence()"`
				);
			},
			default: () =>
				argument.map((value) =>
					mapItem(value, argumentType, executionParameters, functionName, isReturn)
				),
		});
	}
	if (argumentType.seqType === SequenceType.ZERO_OR_MORE) {
		return argument.map((value) =>
			mapItem(value, argumentType, executionParameters, functionName, isReturn)
		);
	}

	return argument.switchCases({
		singleton: () =>
			argument.map((value) =>
				mapItem(value, argumentType, executionParameters, functionName, isReturn)
			),
		default: () => {
			throw new Error(
				`XPTY0004: Multiplicity of ${
					isReturn ? 'function return value' : 'function argument'
				} of type ${argumentType}${
					argumentType.kind || ''
				} for ${functionName} is incorrect. Expected exactly one`
			);
		},
	});
};
