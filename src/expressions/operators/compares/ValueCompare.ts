import AtomicValue from '../../dataTypes/AtomicValue';
import castToType from '../../dataTypes/castToType';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { ValueType, valueTypeToString } from '../../dataTypes/Value';
import {
	equal as dateTimeEqual,
	greaterThan as dateTimeGreaterThan,
	lessThan as dateTimeLessThan,
} from '../../dataTypes/valueTypes/DateTime';
import {
	greaterThan as dayTimeDurationGreaterThan,
	lessThan as dayTimeDurationLessThan,
} from '../../dataTypes/valueTypes/DayTimeDuration';
import {
	greaterThan as yearMonthDurationGreaterThan,
	lessThan as yearMonthDurationLessThan,
} from '../../dataTypes/valueTypes/YearMonthDuration';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import atomizeSequence from '../../util/atomizeSequence';

function handleQName(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	if (operator === 'eqOp') {
		return (a, b, _dynamicContext) => {
			const { castA, castB } = applyCastFunctions(a, b);
			return (
				castA.value.namespaceURI === castB.value.namespaceURI &&
				castA.value.localName === castB.value.localName
			);
		};
	}
	if (operator === 'neOp') {
		return (a, b, _dynamicContext) => {
			const { castA, castB } = applyCastFunctions(a, b);
			return (
				castA.value.namespaceURI !== castB.value.namespaceURI ||
				castA.value.localName !== castB.value.localName
			);
		};
	}
	throw new Error('XPTY0004: Only the "eq" and "ne" comparison is defined for xs:QName');
}

function handleNumeric(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	switch (operator) {
		case 'eqOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value === castB.value;
			};
		case 'neOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value !== castB.value;
			};
		case 'ltOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value < castB.value;
			};
		case 'leOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value <= castB.value;
			};
		case 'gtOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value > castB.value;
			};
		case 'geOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value >= castB.value;
			};
		default:
			return undefined;
	}
}

function handleYearMonthDuration(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	switch (operator) {
		case 'ltOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return yearMonthDurationLessThan(castA.value, castB.value);
			};
		case 'leOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					castA.value.equals(castB.value) ||
					yearMonthDurationLessThan(castA.value, castB.value)
				);
			};

		case 'gtOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return yearMonthDurationGreaterThan(castA.value, castB.value);
			};
		case 'geOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					castA.value.equals(castB.value) ||
					yearMonthDurationGreaterThan(castA.value, castB.value)
				);
			};
		default:
			return undefined;
	}
}

function handleDayTimeDuration(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	switch (operator) {
		case 'eqOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value.equals(castB.value);
			};
		case 'ltOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return dayTimeDurationLessThan(castA.value, castB.value);
			};
		case 'leOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					castA.value.equals(castB.value) ||
					dayTimeDurationLessThan(castA.value, castB.value)
				);
			};
		case 'gtOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return dayTimeDurationGreaterThan(castA.value, castB.value);
			};
		case 'geOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					castA.value.equals(castB.value) ||
					dayTimeDurationGreaterThan(castA.value, castB.value)
				);
			};
		default:
			return undefined;
	}
}

function handleDuration(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	switch (operator) {
		case 'eqOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return castA.value.equals(castB.value);
			};
		case 'neOp':
			return (a, b, _dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return !castA.value.equals(castB.value);
			};
		default:
			return undefined;
	}
}

function handleDateAndTime(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	switch (operator) {
		case 'eqOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return dateTimeEqual(
					castA.value,
					castB.value,
					dynamicContext.getImplicitTimezone(),
				);
			};
		case 'neOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return !dateTimeEqual(
					castA.value,
					castB.value,
					dynamicContext.getImplicitTimezone(),
				);
			};

		case 'ltOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return dateTimeLessThan(
					castA.value,
					castB.value,
					dynamicContext.getImplicitTimezone(),
				);
			};
		case 'leOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone()) ||
					dateTimeLessThan(castA.value, castB.value, dynamicContext.getImplicitTimezone())
				);
			};

		case 'gtOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return dateTimeGreaterThan(
					castA.value,
					castB.value,
					dynamicContext.getImplicitTimezone(),
				);
			};
		case 'geOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return (
					dateTimeEqual(castA.value, castB.value, dynamicContext.getImplicitTimezone()) ||
					dateTimeGreaterThan(
						castA.value,
						castB.value,
						dynamicContext.getImplicitTimezone(),
					)
				);
			};
		default:
			return undefined;
	}
}

function handleDayMonthAndYear(
	operator: string,
	applyCastFunctions: (valA: AtomicValue, valB: AtomicValue) => any,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	switch (operator) {
		case 'eqOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return dateTimeEqual(
					castA.value,
					castB.value,
					dynamicContext.getImplicitTimezone(),
				);
			};
		case 'neOp':
			return (a, b, dynamicContext) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return !dateTimeEqual(
					castA.value,
					castB.value,
					dynamicContext.getImplicitTimezone(),
				);
			};
		default:
			return undefined;
	}
}

function generateCompareFunction(
	operator: string,
	typeA: ValueType,
	typeB: ValueType,
): (valA: any, valB: any, dynamicContext: DynamicContext) => boolean {
	let castFunctionForValueA: (x: AtomicValue) => AtomicValue = null;
	let castFunctionForValueB: (x: AtomicValue) => AtomicValue = null;

	if (
		isSubtypeOf(typeA, ValueType.XSUNTYPEDATOMIC) &&
		isSubtypeOf(typeB, ValueType.XSUNTYPEDATOMIC)
	) {
		typeA = typeB = ValueType.XSSTRING;
	} else if (isSubtypeOf(typeA, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueA = (val: AtomicValue) => castToType(val, typeB);
		typeA = typeB;
	} else if (isSubtypeOf(typeB, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueB = (val: AtomicValue) => castToType(val, typeA);
		typeB = typeA;
	}

	function applyCastFunctions(valA: AtomicValue, valB: AtomicValue) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valA) : valA,
			castB: castFunctionForValueB ? castFunctionForValueB(valB) : valB,
		};
	}

	if (isSubtypeOf(typeA, ValueType.XSQNAME) && isSubtypeOf(typeB, ValueType.XSQNAME)) {
		return handleQName(operator, applyCastFunctions);
	}

	function areBothSubtypeOf(type: ValueType) {
		return isSubtypeOf(typeA, type) && isSubtypeOf(typeB, type);
	}

	function areBothSubtypeOfOne(types: ValueType[]) {
		return (
			types.filter((x) => isSubtypeOf(typeA, x)).length > 0 &&
			types.filter((x) => isSubtypeOf(typeB, x)).length > 0
		);
	}

	if (
		areBothSubtypeOf(ValueType.XSBOOLEAN) ||
		// If something is marked as an attribute its either a string or a number
		areBothSubtypeOfOne([ValueType.XSSTRING, ValueType.ATTRIBUTE, ValueType.MAP]) ||
		areBothSubtypeOfOne([ValueType.XSNUMERIC, ValueType.ATTRIBUTE, ValueType.MAP]) ||
		areBothSubtypeOf(ValueType.XSANYURI) ||
		areBothSubtypeOf(ValueType.XSHEXBINARY) ||
		areBothSubtypeOf(ValueType.XSBASE64BINARY) ||
		areBothSubtypeOfOne([ValueType.XSSTRING, ValueType.XSANYURI])
	) {
		const result = handleNumeric(operator, applyCastFunctions);
		if (result !== undefined) {
			return result;
		}
	}

	if (areBothSubtypeOf(ValueType.XSYEARMONTHDURATION)) {
		const result = handleYearMonthDuration(operator, applyCastFunctions);
		if (result !== undefined) {
			return result;
		}
	}

	if (areBothSubtypeOf(ValueType.XSDAYTIMEDURATION)) {
		const result = handleDayTimeDuration(operator, applyCastFunctions);
		if (result !== undefined) {
			return result;
		}
	}

	if (areBothSubtypeOf(ValueType.XSDURATION)) {
		const result = handleDuration(operator, applyCastFunctions);
		if (result !== undefined) {
			return result;
		}
	}

	if (
		areBothSubtypeOf(ValueType.XSDATETIME) ||
		areBothSubtypeOf(ValueType.XSDATE) ||
		areBothSubtypeOf(ValueType.XSTIME)
	) {
		const result = handleDateAndTime(operator, applyCastFunctions);
		if (result !== undefined) {
			return result;
		}
	}

	if (
		areBothSubtypeOf(ValueType.XSGYEARMONTH) ||
		areBothSubtypeOf(ValueType.XSGYEAR) ||
		areBothSubtypeOf(ValueType.XSGMONTHDAY) ||
		areBothSubtypeOf(ValueType.XSGMONTH) ||
		areBothSubtypeOf(ValueType.XSGDAY)
	) {
		const result = handleDayMonthAndYear(operator, applyCastFunctions);
		if (result !== undefined) {
			return result;
		}
	}

	throw new Error(
		`XPTY0004: ${operator} not available for ${valueTypeToString(
			typeA,
		)} and ${valueTypeToString(typeB)}`,
	);
}

const comparatorsByTypingKey = Object.create(null);

export function valueCompare(
	operator: string,
	typeA: ValueType,
	typeB: ValueType,
): (valueA: AtomicValue, valueB: AtomicValue, dynamicContext: DynamicContext) => boolean {
	// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
	const typingKey = `${typeA as number}~${typeB as number}~${operator}`;
	let prefabComparator = comparatorsByTypingKey[typingKey];
	if (!prefabComparator) {
		prefabComparator = comparatorsByTypingKey[typingKey] = generateCompareFunction(
			operator,
			typeA,
			typeB,
		);
	}

	return prefabComparator;
}

export default class ValueCompare extends Expression {
	private _firstExpression: Expression;
	private _operator: string;
	private _secondExpression: Expression;

	constructor(kind: string, firstExpression: Expression, secondExpression: Expression) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false,
			},
		);
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;
		this._operator = kind;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
	): ISequence {
		const firstSequence = this._firstExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters,
		);
		const secondSequence = this._secondExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters,
		);

		const firstAtomizedSequence = atomizeSequence(firstSequence, executionParameters);
		const secondAtomizedSequence = atomizeSequence(secondSequence, executionParameters);

		return firstAtomizedSequence.switchCases({
			empty: () => sequenceFactory.empty(),
			singleton: () =>
				secondAtomizedSequence.switchCases({
					empty: () => sequenceFactory.empty(),
					singleton: () => {
						const onlyFirstValue = firstAtomizedSequence.first();
						const onlySecondValue = secondAtomizedSequence.first();
						const compareFunction = valueCompare(
							this._operator,
							onlyFirstValue.type,
							onlySecondValue.type,
						);

						return compareFunction(onlyFirstValue, onlySecondValue, dynamicContext)
							? sequenceFactory.singletonTrueSequence()
							: sequenceFactory.singletonFalseSequence();
					},
					multiple: () => {
						throw new Error('XPTY0004: Sequences to compare are not singleton.');
					},
				}),
			multiple: () => {
				throw new Error('XPTY0004: Sequences to compare are not singleton.');
			},
		});
	}
}
