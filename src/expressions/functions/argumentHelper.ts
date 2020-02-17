import { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import promoteToType from '../dataTypes/promoteToType';
import TypeDeclaration from '../dataTypes/TypeDeclaration';
import Value, { ValueType } from '../dataTypes/Value';
import ExecutionParameters from '../ExecutionParameters';

function mapItem(
	argumentItem: Value,
	type: ValueType,
	executionParameters: ExecutionParameters,
	functionName: string,
	isReturn: boolean
) {
	if (isSubtypeOf(argumentItem.type, type)) {
		return argumentItem;
	}

	if (isSubtypeOf(argumentItem.type, 'node()')) {
		// Assume here that a node always atomizes to a singlevalue. This will not work
		// anymore when schema support will be imlemented.
		argumentItem = atomizeSingleValue(argumentItem, executionParameters).first();
	}

	// Maybe after atomization, we have the correct type
	if (isSubtypeOf(argumentItem.type, type)) {
		return argumentItem;
	}

	// Everything is an anyAtomicType, so no casting necessary.
	if (type === 'xs:anyAtomicType') {
		return argumentItem;
	}
	if (isSubtypeOf(argumentItem.type, 'xs:untypedAtomic')) {
		// We might be able to cast this to the wished type
		const item = castToType(argumentItem, type);
		if (!item) {
			throw new Error(
				`XPTY0004 Unable to convert ${isReturn ? 'return' : 'argument'} of type ${
					argumentItem.type
				} to type ${type} while calling ${functionName}`
			);
		}
		return item;
	}

	// We need to promote this
	const item = promoteToType(argumentItem, type);
	if (!item) {
		throw new Error(
			`XPTY0004 Unable to cast ${isReturn ? 'return' : 'argument'} of type ${
				argumentItem.type
			} to type ${type} while calling ${functionName}`
		);
	}
	return item;
}

/**
 * Test whether the provided argument is valid to be used as an function argument of the given type
 */
export const performFunctionConversion = (
	argumentType: TypeDeclaration,
	argument: ISequence,
	executionParameters: ExecutionParameters,
	functionName: string,
	isReturn: boolean
): ISequence => {
	switch (argumentType.occurrence) {
		case '?':
			return argument.switchCases({
				default: () =>
					argument.map(value =>
						mapItem(
							value,
							argumentType.type,
							executionParameters,
							functionName,
							isReturn
						)
					),
				multiple: () => {
					throw new Error(
						`XPTY0004: Multiplicity of ${
							isReturn ? 'function return value' : 'function argument'
						} of type ${argumentType.type}${argumentType.occurrence ||
							''} for ${functionName} is incorrect. Expected "?", but got "+".`
					);
				}
			});
		case '+':
			return argument.switchCases({
				empty: () => {
					throw new Error(
						`XPTY0004: Multiplicity of ${
							isReturn ? 'function return value' : 'function argument'
						} of type ${argumentType.type}${argumentType.occurrence ||
							''} for ${functionName} is incorrect. Expected "+", but got "empty-sequence()"`
					);
				},
				default: () =>
					argument.map(value =>
						mapItem(
							value,
							argumentType.type,
							executionParameters,
							functionName,
							isReturn
						)
					)
			});
		case '*':
			return argument.map(value =>
				mapItem(value, argumentType.type, executionParameters, functionName, isReturn)
			);
		default:
			// excactly one
			return argument.switchCases({
				singleton: () =>
					argument.map(value =>
						mapItem(
							value,
							argumentType.type,
							executionParameters,
							functionName,
							isReturn
						)
					),
				default: () => {
					throw new Error(
						`XPTY0004: Multiplicity of ${
							isReturn ? 'function return value' : 'function argument'
						} of type ${argumentType.type}${argumentType.occurrence ||
							''} for ${functionName} is incorrect. Expected exactly one`
					);
				}
			});
	}
};
