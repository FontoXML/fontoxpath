import AtomicValue from '../../../expressions/dataTypes/AtomicValue';
import castToType from '../../../expressions/dataTypes/castToType';
import createAtomicValue from '../../../expressions/dataTypes/createAtomicValue';
import isSubtypeOf from '../../../expressions/dataTypes/isSubtypeOf';
import { ValueType } from '../../../expressions/dataTypes/Value';
import { BinaryEvaluationFunction } from '../../../typeInference/binaryEvaluationFunction';
import atomize from '../../dataTypes/atomize';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType } from '../../dataTypes/Value';
import Expression from '../../Expression';
import { hash, operationMap, returnTypeMap } from './BinaryEvaluationFunctionMap';

function determineReturnType(typeA: ValueType, typeB: ValueType): ValueType {
	if (isSubtypeOf(typeA, ValueType.XSINTEGER) && isSubtypeOf(typeB, ValueType.XSINTEGER)) {
		return ValueType.XSINTEGER;
	}
	if (isSubtypeOf(typeA, ValueType.XSDECIMAL) && isSubtypeOf(typeB, ValueType.XSDECIMAL)) {
		return ValueType.XSDECIMAL;
	}
	if (isSubtypeOf(typeA, ValueType.XSFLOAT) && isSubtypeOf(typeB, ValueType.XSFLOAT)) {
		return ValueType.XSFLOAT;
	}
	return ValueType.XSDOUBLE;
}

/**
 * An array with every possible parent type contained in the returnTypeMap and the operationsMap.
 */
const allTypes = [
	ValueType.XSNUMERIC,
	ValueType.XSYEARMONTHDURATION,
	ValueType.XSDAYTIMEDURATION,
	ValueType.XSDATETIME,
	ValueType.XSDATE,
	ValueType.XSTIME,
];

export function generateBinaryOperatorFunction(
	operator: string,
	typeA: ValueType,
	typeB: ValueType
): BinaryEvaluationFunction {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (isSubtypeOf(typeA, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueA = (value) => castToType(value, ValueType.XSDOUBLE);
		typeA = ValueType.XSDOUBLE;
	}
	if (isSubtypeOf(typeB, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueB = (value) => castToType(value, ValueType.XSDOUBLE);
		typeB = ValueType.XSDOUBLE;
	}

	// Filter all the possible types to only those which the operands are a subtype of.
	const parentTypesOfA = allTypes.filter((e) => isSubtypeOf(typeA, e));
	const parentTypesOfB = allTypes.filter((e) => isSubtypeOf(typeB, e));

	function applyCastFunctions(valueA: AtomicValue, valueB: AtomicValue) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB,
		};
	}

	// As the Numeric operands need some checks done beforehand we need to evaluate them seperatly.
	if (
		parentTypesOfA.includes(ValueType.XSNUMERIC) &&
		parentTypesOfB.includes(ValueType.XSNUMERIC)
	) {
		const fun = operationMap[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, operator)];
		let retType = returnTypeMap[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, operator)];
		if (!retType) retType = determineReturnType(typeA, typeB);
		if (operator === 'divOp' && retType === ValueType.XSINTEGER) retType = ValueType.XSDECIMAL;
		if (operator === 'idivOp') return iDivOpChecksFunction(applyCastFunctions, fun)[0];
		return (a, b) => {
			const { castA, castB } = applyCastFunctions(a, b);
			return createAtomicValue(fun(castA.value, castB.value), retType);
		};
	}

	// Loop through the 2 arrays to find a combination of parentTypes and operand that has an entry in the operationsMap and the returnTypeMap.
	for (const typeOfA of parentTypesOfA) {
		for (const typeOfB of parentTypesOfB) {
			const func = operationMap[hash(typeOfA, typeOfB, operator)];
			const ret = returnTypeMap[hash(typeOfA, typeOfB, operator)];
			if (func && ret) {
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(func(castA.value, castB.value), ret);
				};
			}
		}
	}
	throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
}

export function generateBinaryOperatorType(
	operator: string,
	typeA: ValueType,
	typeB: ValueType
): ValueType {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (isSubtypeOf(typeA, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueA = (value) => castToType(value, ValueType.XSDOUBLE);
		typeA = ValueType.XSDOUBLE;
	}
	if (isSubtypeOf(typeB, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueB = (value) => castToType(value, ValueType.XSDOUBLE);
		typeB = ValueType.XSDOUBLE;
	}

	function applyCastFunctions(valueA: AtomicValue, valueB: AtomicValue) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB,
		};
	}

	// Filter all the possible types to only those which the operands are a subtype of.
	const parentTypesOfA = allTypes.filter((e) => isSubtypeOf(typeA, e));
	const parentTypesOfB = allTypes.filter((e) => isSubtypeOf(typeB, e));

	// As the Numeric operands need some checks done beforehand we need to evaluate them seperatly.
	if (
		parentTypesOfA.includes(ValueType.XSNUMERIC) &&
		parentTypesOfB.includes(ValueType.XSNUMERIC)
	) {
		let retType = returnTypeMap[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, operator)];
		if (retType === undefined) retType = determineReturnType(typeA, typeB);
		if (operator === 'idivOp')
			return iDivOpChecksFunction(applyCastFunctions, (a, b) => Math.trunc(a / b))[1];
		return retType;
	}

	// check if the types have at least 1 applicable parent type each.
	if (parentTypesOfB.length === 0 || parentTypesOfA.length === 0)
		throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);

	// Loop through the 2 arrays to find a combination of parentTypes and operand that has an entry in the operationsMap and the returnTypeMap.
	for (const typeOfA of parentTypesOfA) {
		for (const typeOfB of parentTypesOfB) {
			const ret = returnTypeMap[hash(typeOfA, typeOfB, operator)];
			if (ret !== undefined) {
				return ret;
			}
		}
	}
	throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
}

/**
 * The integerDivision needs some seperate more ellaborate checks so is moved into a seperate function.
 * @param applyCastFunctions The casting function
 * @param fun The function retrieved from the map
 * @returns A tuple of a function that needs to be applied to the operands and the returnType of the integerDivision.
 */
function iDivOpChecksFunction(
	applyCastFunctions: (a, b) => any,
	fun: (a, b) => any
): [(a: any, b: any) => AtomicValue, ValueType] {
	return [
		(a, b) => {
			const { castA, castB } = applyCastFunctions(a, b);
			if (castB.value === 0) {
				throw new Error('FOAR0001: Divisor of idiv operator cannot be (-)0');
			}
			if (
				Number.isNaN(castA.value) ||
				Number.isNaN(castB.value) ||
				!Number.isFinite(castA.value)
			) {
				throw new Error(
					'FOAR0002: One of the operands of idiv is NaN or the first operand is (-)INF'
				);
			}
			if (Number.isFinite(castA.value) && !Number.isFinite(castB.value)) {
				return createAtomicValue(0, ValueType.XSINTEGER);
			}
			return createAtomicValue(fun(castA.value, castB.value), ValueType.XSINTEGER);
		},
		ValueType.XSINTEGER,
	];
}

/**
 * A cache to store the generated functions.
 */
const operatorsByTypingKey: Record<string, BinaryEvaluationFunction> = Object.create(null);

export function getBinaryPrefabOperator(
	leftType: ValueType,
	rightType: ValueType,
	operator: string
): BinaryEvaluationFunction {
	const typingKey = `${leftType}~${rightType}~${operator}`;

	let prefabOperator = operatorsByTypingKey[typingKey];
	if (!prefabOperator) {
		prefabOperator = operatorsByTypingKey[typingKey] = generateBinaryOperatorFunction(
			operator,
			leftType,
			rightType
		);
	}

	return prefabOperator;
}

/**
 * A class representing a BinaryOperationExpression
 */
class BinaryOperator extends Expression {
	private _evaluateFunction?: BinaryEvaluationFunction;
	private _firstValueExpr: Expression;
	private _operator: string;
	private _secondValueExpr: Expression;

	/**
	 * @param  operator         One of addOp, substractOp, multiplyOp, divOp, idivOp, modOp
	 * @param  firstValueExpr   The selector evaluating to the first value to process
	 * @param  secondValueExpr  The selector evaluating to the second value to process
	 */
	constructor(
		operator: string,
		firstValueExpr: Expression,
		secondValueExpr: Expression,
		type: SequenceType,
		evaluateFunction: BinaryEvaluationFunction
	) {
		super(
			firstValueExpr.specificity.add(secondValueExpr.specificity),
			[firstValueExpr, secondValueExpr],
			{
				canBeStaticallyEvaluated: false,
			},
			false,
			type
		);
		this._firstValueExpr = firstValueExpr;
		this._secondValueExpr = secondValueExpr;

		this._operator = operator;

		this._evaluateFunction = evaluateFunction;
	}

	/**
	 * A method to evaluate the BinaryOperation.
	 * @param dynamicContext The context in which it will be evaluated
	 * @param executionParameters options
	 * @returns The value to which the operation evaluates.
	 */
	public evaluate(dynamicContext, executionParameters) {
		const firstValueSequence = atomize(
			this._firstValueExpr.evaluateMaybeStatically(dynamicContext, executionParameters),
			executionParameters
		);
		return firstValueSequence.mapAll((firstValues) => {
			if (firstValues.length === 0) {
				// Shortcut, if the first part is empty, we can return empty.
				// As per spec, we do not have to evaluate the second part, though we could.
				return sequenceFactory.empty();
			}
			const secondValueSequence = atomize(
				this._secondValueExpr.evaluateMaybeStatically(dynamicContext, executionParameters),
				executionParameters
			);
			return secondValueSequence.mapAll((secondValues) => {
				if (secondValues.length === 0) {
					return sequenceFactory.empty();
				}

				if (firstValues.length > 1 || secondValues.length > 1) {
					throw new Error(
						'XPTY0004: the operands of the "' +
							this._operator +
							'" operator should be empty or singleton.'
					);
				}

				const firstValue = firstValues[0];
				const secondValue = secondValues[0];

				// We could infer all the necessary type information to do an early return
				if (this._evaluateFunction && this.type) {
					return sequenceFactory.singleton(
						this._evaluateFunction(firstValue, secondValue)
					);
				}

				const prefabOperator = getBinaryPrefabOperator(
					firstValue.type,
					secondValue.type,
					this._operator
				);

				return sequenceFactory.singleton(prefabOperator(firstValue, secondValue));
			});
		});
	}
}

export default BinaryOperator;
