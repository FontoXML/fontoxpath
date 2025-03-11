import { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import promoteToType from '../dataTypes/promoteToType';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, {
	SequenceMultiplicity,
	SequenceType,
	sequenceTypeToString,
	ValueType,
	valueTypeToString,
} from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import { errXPDY0002 } from '../XPathErrors';
import FunctionDefinitionType from './FunctionDefinitionType';

function mapItem(
	argumentItem: Value,
	type: SequenceType,
	executionParameters: ExecutionParameters,
	functionName: string,
	isReturn: boolean,
) {
	if (isSubtypeOf(argumentItem.type, type.type)) {
		return argumentItem;
	}

	if (
		isSubtypeOf(type.type, ValueType.XSANYATOMICTYPE) &&
		isSubtypeOf(argumentItem.type, ValueType.NODE)
	) {
		// Assume here that a node always atomizes to a singlevalue. This will not work
		// anymore when schema support will be imlemented.
		argumentItem = atomizeSingleValue(argumentItem, executionParameters).first();
	}

	// Maybe after atomization, we have the correct type
	if (isSubtypeOf(argumentItem.type, type.type)) {
		return argumentItem;
	}

	// Everything is an anyAtomicType, so no casting necessary.
	if (type.type === ValueType.XSANYATOMICTYPE) {
		return argumentItem;
	}
	if (isSubtypeOf(argumentItem.type, ValueType.XSUNTYPEDATOMIC)) {
		// We might be able to cast this to the wished type
		const convertedItem = castToType(argumentItem, type.type);
		if (!convertedItem) {
			throw new Error(
				`XPTY0004 Unable to convert ${
					isReturn ? 'return' : 'argument'
				} of type ${valueTypeToString(argumentItem.type)} to type ${sequenceTypeToString(
					type,
				)} while calling ${functionName}`,
			);
		}
		return convertedItem;
	}

	// We need to promote this
	const item = promoteToType(argumentItem, type.type);
	if (!item) {
		throw new Error(
			`XPTY0004 Unable to cast ${
				isReturn ? 'return' : 'argument'
			} of type ${valueTypeToString(argumentItem.type)} to type ${sequenceTypeToString(
				type,
			)} while calling ${functionName}`,
		);
	}
	return item;
}

function multiplicityToString(mult: SequenceMultiplicity): string {
	switch (mult) {
		case SequenceMultiplicity.ZERO_OR_MORE:
			return '*';
		case SequenceMultiplicity.ONE_OR_MORE:
			return '+';
		case SequenceMultiplicity.ZERO_OR_ONE:
			return '?';
		case SequenceMultiplicity.EXACTLY_ONE:
			return '';
	}
}

/**
 * Test whether the provided argument is valid to be used as an function argument of the given type
 */
export const performFunctionConversion = (
	argumentType: SequenceType,
	argument: ISequence,
	executionParameters: ExecutionParameters,
	functionName: string,
	isReturn: boolean,
): ISequence => {
	if (argumentType.mult === SequenceMultiplicity.ZERO_OR_ONE) {
		return argument.switchCases({
			default: () =>
				argument.map((value) =>
					mapItem(value, argumentType, executionParameters, functionName, isReturn),
				),
			multiple: () => {
				throw new Error(
					`XPTY0004: Multiplicity of ${
						isReturn ? 'function return value' : 'function argument'
					} of type ${valueTypeToString(argumentType.type)}${multiplicityToString(
						argumentType.mult,
					)} for ${functionName} is incorrect. Expected "?", but got "+".`,
				);
			},
		});
	}
	if (argumentType.mult === SequenceMultiplicity.ONE_OR_MORE) {
		return argument.switchCases({
			empty: () => {
				throw new Error(
					`XPTY0004: Multiplicity of ${
						isReturn ? 'function return value' : 'function argument'
					} of type ${valueTypeToString(argumentType.type)}${multiplicityToString(
						argumentType.mult,
					)} for ${functionName} is incorrect. Expected "+", but got "empty-sequence()"`,
				);
			},
			default: () =>
				argument.map((value) =>
					mapItem(value, argumentType, executionParameters, functionName, isReturn),
				),
		});
	}
	if (argumentType.mult === SequenceMultiplicity.ZERO_OR_MORE) {
		return argument.map((value) =>
			mapItem(value, argumentType, executionParameters, functionName, isReturn),
		);
	}

	return argument.switchCases({
		singleton: () =>
			argument.map((value) =>
				mapItem(value, argumentType, executionParameters, functionName, isReturn),
			),
		default: () => {
			throw new Error(
				`XPTY0004: Multiplicity of ${
					isReturn ? 'function return value' : 'function argument'
				} of type ${valueTypeToString(argumentType.type)}${multiplicityToString(
					argumentType.mult,
				)} for ${functionName} is incorrect. Expected exactly one`,
			);
		},
	});
};

export function contextItemAsFirstArgument(
	functionName: string,
	parameterType: ValueType,
	fn: FunctionDefinitionType,
): FunctionDefinitionType {
	return (
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		staticContext: StaticContext,
	): ISequence => {
		if (dynamicContext.contextItem === null) {
			throw errXPDY0002(
				`The function ${functionName} depends on dynamic context, which is absent.`,
			);
		}

		const contextItemArgument = performFunctionConversion(
			{ type: parameterType, mult: SequenceMultiplicity.EXACTLY_ONE },
			sequenceFactory.singleton(dynamicContext.contextItem),
			executionParameters,
			functionName,
			false,
		);

		return fn(dynamicContext, executionParameters, staticContext, contextItemArgument);
	};
}
