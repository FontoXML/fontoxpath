"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isSubtypeOf_1 = require("../../dataTypes/isSubtypeOf");
const castToType_1 = require("../../dataTypes/castToType");
const SequenceFactory_1 = require("../../dataTypes/SequenceFactory");
const Expression_1 = require("../../Expression");
const createAtomicValue_1 = require("../../dataTypes/createAtomicValue");
const DateTime_1 = require("../../dataTypes/valueTypes/DateTime");
const YearMonthDuration_1 = require("../../dataTypes/valueTypes/YearMonthDuration");
const DayTimeDuration_1 = require("../../dataTypes/valueTypes/DayTimeDuration");
function generateBinaryOperatorFunction(operator, typeA, typeB) {
    let castFunctionForValueA = null;
    let castFunctionForValueB = null;
    if (isSubtypeOf_1.default(typeA, 'xs:untypedAtomic')) {
        castFunctionForValueA = value => castToType_1.default(value, 'xs:double');
        typeA = 'xs:double';
    }
    if (isSubtypeOf_1.default(typeB, 'xs:untypedAtomic')) {
        castFunctionForValueB = value => castToType_1.default(value, 'xs:double');
        typeB = 'xs:double';
    }
    function applyCastFunctions(valueA, valueB) {
        return {
            castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
            castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB
        };
    }
    if (isSubtypeOf_1.default(typeA, 'xs:numeric') && isSubtypeOf_1.default(typeB, 'xs:numeric')) {
        switch (operator) {
            case 'addOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(castA.value + castB.value, typeA === typeB ? typeA : 'xs:decimal');
                };
            case 'subtractOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(castA.value - castB.value, typeA === typeB ? typeA : 'xs:decimal');
                };
            case 'multiplyOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(castA.value * castB.value, typeA === typeB ? typeA : 'xs:decimal');
                };
            case 'divOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(castA.value / castB.value, 'xs:decimal');
                };
            case 'idivOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    if (castB.value === 0) {
                        throw new Error('FOAR0001: Divisor of idiv operator cannot be (-)0');
                    }
                    if (Number.isNaN(castA.value) || Number.isNaN(castB.value) || !Number.isFinite(castA.value)) {
                        throw new Error('FOAR0002: One of the operands of idiv is NaN or the first operand is (-)INF');
                    }
                    if (Number.isFinite(castA.value) && !Number.isFinite(castB.value)) {
                        return createAtomicValue_1.default(0, 'xs:integer');
                    }
                    return createAtomicValue_1.default(Math.trunc(castA.value / castB.value), 'xs:integer');
                };
            case 'modOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(castA.value % castB.value, 'xs:decimal');
                };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:yearMonthDuration') && isSubtypeOf_1.default(typeB, 'xs:yearMonthDuration')) {
        switch (operator) {
            case 'addOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(YearMonthDuration_1.add(castA.value, castB.value), 'xs:yearMonthDuration');
                };
            case 'subtractOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(YearMonthDuration_1.subtract(castA.value, castB.value), 'xs:yearMonthDuration');
                };
            case 'divOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(YearMonthDuration_1.divideByYearMonthDuration(castA.value, castB.value), 'xs:double');
                };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:yearMonthDuration') && isSubtypeOf_1.default(typeB, 'xs:numeric')) {
        switch (operator) {
            case 'multiplyOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(YearMonthDuration_1.multiply(castA.value, castB.value), 'xs:yearMonthDuration');
                };
            case 'divOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(YearMonthDuration_1.divide(castA.value, castB.value), 'xs:yearMonthDuration');
                };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:numeric') && isSubtypeOf_1.default(typeB, 'xs:yearMonthDuration')) {
        if (operator === 'multiplyOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(YearMonthDuration_1.multiply(castB.value, castA.value), 'xs:yearMonthDuration');
            };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:dayTimeDuration') && isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration')) {
        switch (operator) {
            case 'addOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(DayTimeDuration_1.add(castA.value, castB.value), 'xs:dayTimeDuration');
                };
            case 'subtractOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(DayTimeDuration_1.subtract(castA.value, castB.value), 'xs:dayTimeDuration');
                };
            case 'divOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(DayTimeDuration_1.divideByDayTimeDuration(castA.value, castB.value), 'xs:decimal');
                };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:dayTimeDuration') && isSubtypeOf_1.default(typeB, 'xs:numeric')) {
        switch (operator) {
            case 'multiplyOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(DayTimeDuration_1.multiply(castA.value, castB.value), 'xs:dayTimeDuration');
                };
            case 'divOp':
                return (a, b) => {
                    const { castA, castB } = applyCastFunctions(a, b);
                    return createAtomicValue_1.default(DayTimeDuration_1.divide(castA.value, castB.value), 'xs:dayTimeDuration');
                };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:numeric') && isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration')) {
        if (operator === 'multiplyOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DayTimeDuration_1.multiply(castB.value, castA.value), 'xs:dayTimeDuration');
            };
        }
    }
    if ((isSubtypeOf_1.default(typeA, 'xs:dateTime') && isSubtypeOf_1.default(typeB, 'xs:dateTime')) ||
        (isSubtypeOf_1.default(typeA, 'xs:date') && isSubtypeOf_1.default(typeB, 'xs:date')) ||
        (isSubtypeOf_1.default(typeA, 'xs:time') && isSubtypeOf_1.default(typeB, 'xs:time'))) {
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtract(castA.value, castB.value), 'xs:dayTimeDuration');
            };
        }
        throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
    }
    if ((isSubtypeOf_1.default(typeA, 'xs:dateTime') && isSubtypeOf_1.default(typeB, 'xs:yearMonthDuration')) ||
        (isSubtypeOf_1.default(typeA, 'xs:dateTime') && isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration'))) {
        if (operator === 'addOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.addDuration(castA.value, castB.value), 'xs:dateTime');
            };
        }
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtractDuration(castA.value, castB.value), 'xs:dateTime');
            };
        }
    }
    if ((isSubtypeOf_1.default(typeA, 'xs:date') && isSubtypeOf_1.default(typeB, 'xs:yearMonthDuration')) ||
        (isSubtypeOf_1.default(typeA, 'xs:date') && isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration'))) {
        if (operator === 'addOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.addDuration(castA.value, castB.value), 'xs:date');
            };
        }
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtractDuration(castA.value, castB.value), 'xs:date');
            };
        }
    }
    if (isSubtypeOf_1.default(typeA, 'xs:time') && isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration')) {
        if (operator === 'addOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.addDuration(castA.value, castB.value), 'xs:time');
            };
        }
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtractDuration(castA.value, castB.value), 'xs:time');
            };
        }
    }
    if ((isSubtypeOf_1.default(typeB, 'xs:yearMonthDuration') && isSubtypeOf_1.default(typeA, 'xs:dateTime')) ||
        (isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration') && isSubtypeOf_1.default(typeA, 'xs:dateTime'))) {
        if (operator === 'addOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.addDuration(castB.value, castA.value), 'xs:dateTime');
            };
        }
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtractDuration(castB.value, castA.value), 'xs:dateTime');
            };
        }
    }
    if ((isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration') && isSubtypeOf_1.default(typeA, 'xs:date')) ||
        ((isSubtypeOf_1.default(typeB, 'xs:yearMonthDuration') && isSubtypeOf_1.default(typeA, 'xs:date')))) {
        if (operator === 'addOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.addDuration(castB.value, castA.value), 'xs:date');
            };
        }
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtractDuration(castB.value, castA.value), 'xs:date');
            };
        }
    }
    if (isSubtypeOf_1.default(typeB, 'xs:dayTimeDuration') && isSubtypeOf_1.default(typeA, 'xs:time')) {
        if (operator === 'addOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.addDuration(castB.value, castA.value), 'xs:time');
            };
        }
        if (operator === 'subtractOp') {
            return (a, b) => {
                const { castA, castB } = applyCastFunctions(a, b);
                return createAtomicValue_1.default(DateTime_1.subtractDuration(castB.value, castA.value), 'xs:time');
            };
        }
    }
    throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
}
const operatorsByTypingKey = Object.create(null);
class BinaryOperator extends Expression_1.default {
    /**
     * @param  operator         One of addOp, substractOp, multiplyOp, divOp, idivOp, modOp
     * @param  firstValueExpr   The selector evaluating to the first value to process
     * @param  secondValueExpr  The selector evaluating to the second value to process
     */
    constructor(operator, firstValueExpr, secondValueExpr) {
        super(firstValueExpr.specificity.add(secondValueExpr.specificity), [firstValueExpr, secondValueExpr], {
            canBeStaticallyEvaluated: false
        });
        this._firstValueExpr = firstValueExpr;
        this._secondValueExpr = secondValueExpr;
        this._operator = operator;
    }
    evaluate(dynamicContext, executionParameters) {
        const firstValueSequence = this._firstValueExpr.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters);
        return firstValueSequence.mapAll(firstValues => {
            if (firstValues.length === 0) {
                // Shortcut, if the first part is empty, we can return empty.
                // As per spec, we do not have to evaluate the second part, though we could.
                return SequenceFactory_1.default.empty();
            }
            const secondValueSequence = this._secondValueExpr.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters);
            return secondValueSequence.mapAll(secondValues => {
                if (secondValues.length === 0) {
                    return SequenceFactory_1.default.empty();
                }
                if (firstValues.length > 1 || secondValues.length > 1) {
                    throw new Error('XPTY0004: the operands of the "' + this._operator + '" operator should be empty or singleton.');
                }
                const firstValue = firstValues[0];
                const secondValue = secondValues[0];
                const typingKey = `${firstValue.type}~${secondValue.type}~${this._operator}`;
                let prefabOperator = operatorsByTypingKey[typingKey];
                if (!prefabOperator) {
                    prefabOperator = operatorsByTypingKey[typingKey] = generateBinaryOperatorFunction(this._operator, firstValue.type, secondValue.type);
                }
                return SequenceFactory_1.default.singleton(prefabOperator(firstValue, secondValue));
            });
        });
    }
}
exports.default = BinaryOperator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmluYXJ5T3BlcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCaW5hcnlPcGVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZEQUFzRDtBQUN0RCwyREFBb0Q7QUFDcEQscUVBQThEO0FBQzlELGlEQUEwQztBQUMxQyx5RUFBa0U7QUFFbEUsa0VBSTZDO0FBRTdDLG9GQU1zRDtBQUN0RCxnRkFNb0Q7QUFFcEQsU0FBUyw4QkFBOEIsQ0FBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUs7SUFDOUQsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFDakMsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFakMsSUFBSSxxQkFBVyxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO1FBQzNDLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsb0JBQVUsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDaEUsS0FBSyxHQUFHLFdBQVcsQ0FBQztLQUNwQjtJQUNELElBQUkscUJBQVcsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsRUFBRTtRQUMzQyxxQkFBcUIsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLG9CQUFVLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2hFLEtBQUssR0FBRyxXQUFXLENBQUM7S0FDcEI7SUFFRCxTQUFTLGtCQUFrQixDQUFFLE1BQU0sRUFBRSxNQUFNO1FBQzFDLE9BQU87WUFDTixLQUFLLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1lBQ3JFLEtBQUssRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDckUsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLHFCQUFXLENBQUMsS0FBSyxFQUFFLFlB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VyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sU0FBUyxHQUFHLEdBQUcsVUFBVSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDN0UsSUFBSSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3BCLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyw4QkFBOEIsQ0FDaEYsSUFBSSxDQUFDLFNBQVMsRUFDZCxVQUFVLENBQUMsSUFBSSxFQUNmLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkI7Z0JBRUQsT0FBTyx5QkFBZSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRDtBQUVELGtCQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuLi8uLi9kYXRhVHlwZXMvaXNTdWJ0eXBlT2YnO1xuaW1wb3J0IGNhc3RUb1R5cGUgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL2Nhc3RUb1R5cGUnO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi8uLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uLy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IGNyZWF0ZUF0b21pY1ZhbHVlIGZyb20gJy4uLy4uL2RhdGFUeXBlcy9jcmVhdGVBdG9taWNWYWx1ZSc7XG5cbmltcG9ydCB7XG5cdHN1YnRyYWN0IGFzIGRhdGVUaW1lU3VidHJhY3QsXG5cdGFkZER1cmF0aW9uIGFzIGFkZER1cmF0aW9uVG9EYXRlVGltZSxcblx0c3VidHJhY3REdXJhdGlvbiBhcyBzdWJ0cmFjdER1cmF0aW9uRnJvbURhdGVUaW1lXG59IGZyb20gJy4uLy4uL2RhdGFUeXBlcy92YWx1ZVR5cGVzL0RhdGVUaW1lJztcblxuaW1wb3J0IHtcblx0YWRkIGFzIHllYXJNb250aER1cmF0aW9uQWRkLFxuXHRzdWJ0cmFjdCBhcyB5ZWFyTW9udGhEdXJhdGlvblN1YnRyYWN0LFxuXHRtdWx0aXBseSBhcyB5ZWFyTW9udGhEdXJhdGlvbk11bHRpcGx5LFxuXHRkaXZpZGUgYXMgeWVhck1vbnRoRHVyYXRpb25EaXZpZGUsXG5cdGRpdmlkZUJ5WWVhck1vbnRoRHVyYXRpb24gYXMgeWVhck1vbnRoRHVyYXRpb25EaXZpZGVCeVllYXJNb250aER1cmF0aW9uXG59IGZyb20gJy4uLy4uL2RhdGFUeXBlcy92YWx1ZVR5cGVzL1llYXJNb250aER1cmF0aW9uJztcbmltcG9ydCB7XG5cdGFkZCBhcyBkYXlUaW1lRHVyYXRpb25BZGQsXG5cdHN1YnRyYWN0IGFzIGRheVRpbWVEdXJhdGlvblN1YnRyYWN0LFxuXHRtdWx0aXBseSBhcyBkYXlUaW1lRHVyYXRpb25NdWx0aXBseSxcblx0ZGl2aWRlIGFzIGRheVRpbWVEdXJhdGlvbkRpdmlkZSxcblx0ZGl2aWRlQnlEYXlUaW1lRHVyYXRpb24gYXMgZGF5VGltZUR1cmF0aW9uRGl2aWRlQnlEYXlUaW1lRHVyYXRpb25cbn0gZnJvbSAnLi4vLi4vZGF0YVR5cGVzL3ZhbHVlVHlwZXMvRGF5VGltZUR1cmF0aW9uJztcblxuZnVuY3Rpb24gZ2VuZXJhdGVCaW5hcnlPcGVyYXRvckZ1bmN0aW9uIChvcGVyYXRvciwgdHlwZUEsIHR5cGVCKSB7XG5cdGxldCBjYXN0RnVuY3Rpb25Gb3JWYWx1ZUEgPSBudWxsO1xuXHRsZXQgY2FzdEZ1bmN0aW9uRm9yVmFsdWVCID0gbnVsbDtcblxuXHRpZiAoaXNTdWJ0eXBlT2YodHlwZUEsICd4czp1bnR5cGVkQXRvbWljJykpIHtcblx0XHRjYXN0RnVuY3Rpb25Gb3JWYWx1ZUEgPSB2YWx1ZSA9PiBjYXN0VG9UeXBlKHZhbHVlLCAneHM6ZG91YmxlJyk7XG5cdFx0dHlwZUEgPSAneHM6ZG91YmxlJztcblx0fVxuXHRpZiAoaXNTdWJ0eXBlT2YodHlwZUIsICd4czp1bnR5cGVkQXRvbWljJykpIHtcblx0XHRjYXN0RnVuY3Rpb25Gb3JWYWx1ZUIgPSB2YWx1ZSA9PiBjYXN0VG9UeXBlKHZhbHVlLCAneHM6ZG91YmxlJyk7XG5cdFx0dHlwZUIgPSAneHM6ZG91YmxlJztcblx0fVxuXG5cdGZ1bmN0aW9uIGFwcGx5Q2FzdEZ1bmN0aW9ucyAodmFsdWVBLCB2YWx1ZUIpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2FzdEE6IGNhc3RGdW5jdGlvbkZvclZhbHVlQSA/IGNhc3RGdW5jdGlvbkZvclZhbHVlQSh2YWx1ZUEpIDogdmFsdWVBLFxuXHRcdFx0Y2FzdEI6IGNhc3RGdW5jdGlvbkZvclZhbHVlQiA/IGNhc3RGdW5jdGlvbkZvclZhbHVlQih2YWx1ZUIpIDogdmFsdWVCXG5cdFx0fTtcblx0fVxuXG5cdGlmIChpc1N1YnR5cGVPZih0eXBlQSwgJ3hzOm51bWVyaWMnKSAmJiBpc1N1YnR5cGVPZih0eXBlQiwgJ3hzOm51bWVyaWMnKSkge1xuXHRcdHN3aXRjaCAob3BlcmF0b3IpIHtcblx0XHRcdGNhc2UgJ2FkZE9wJzpcblx0XHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoY2FzdEEudmFsdWUgKyBjYXN0Qi52YWx1ZSwgdHlwZUEgPT09IHR5cGVCID8gdHlwZUEgOiAneHM6ZGVjaW1hbCcpO1xuXHRcdFx0XHR9O1xuXHRcdFx0Y2FzZSAnc3VidHJhY3RPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGNhc3RBLnZhbHVlIC0gY2FzdEIudmFsdWUsIHR5cGVBID09PSB0eXBlQiA/IHR5cGVBIDogJ3hzOmRlY2ltYWwnKTtcblx0XHRcdFx0fTtcblx0XHRcdGNhc2UgJ211bHRpcGx5T3AnOlxuXHRcdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShjYXN0QS52YWx1ZSAqIGNhc3RCLnZhbHVlLCB0eXBlQSA9PT0gdHlwZUIgPyB0eXBlQSA6ICd4czpkZWNpbWFsJyk7XG5cdFx0XHRcdH07XG5cdFx0XHRjYXNlICdkaXZPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGNhc3RBLnZhbHVlIC8gY2FzdEIudmFsdWUsICd4czpkZWNpbWFsJyk7XG5cdFx0XHRcdH07XG5cdFx0XHRjYXNlICdpZGl2T3AnOlxuXHRcdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRcdGlmIChjYXN0Qi52YWx1ZSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdGT0FSMDAwMTogRGl2aXNvciBvZiBpZGl2IG9wZXJhdG9yIGNhbm5vdCBiZSAoLSkwJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChOdW1iZXIuaXNOYU4oY2FzdEEudmFsdWUpIHx8IE51bWJlci5pc05hTihjYXN0Qi52YWx1ZSkgfHwgIU51bWJlci5pc0Zpbml0ZShjYXN0QS52YWx1ZSkpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignRk9BUjAwMDI6IE9uZSBvZiB0aGUgb3BlcmFuZHMgb2YgaWRpdiBpcyBOYU4gb3IgdGhlIGZpcnN0IG9wZXJhbmQgaXMgKC0pSU5GJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChOdW1iZXIuaXNGaW5pdGUoY2FzdEEudmFsdWUpICYmICFOdW1iZXIuaXNGaW5pdGUoY2FzdEIudmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoMCwgJ3hzOmludGVnZXInKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKE1hdGgudHJ1bmMoY2FzdEEudmFsdWUgLyBjYXN0Qi52YWx1ZSksICd4czppbnRlZ2VyJyk7XG5cdFx0XHRcdH07XG5cdFx0XHRjYXNlICdtb2RPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGNhc3RBLnZhbHVlICUgY2FzdEIudmFsdWUsICd4czpkZWNpbWFsJyk7XG5cdFx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0aWYgKGlzU3VidHlwZU9mKHR5cGVBLCAneHM6eWVhck1vbnRoRHVyYXRpb24nKSAmJiBpc1N1YnR5cGVPZih0eXBlQiwgJ3hzOnllYXJNb250aER1cmF0aW9uJykpIHtcblx0XHRzd2l0Y2ggKG9wZXJhdG9yKSB7XG5cdFx0XHRjYXNlICdhZGRPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHllYXJNb250aER1cmF0aW9uQWRkKGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czp5ZWFyTW9udGhEdXJhdGlvbicpO1xuXHRcdFx0XHR9O1xuXHRcdFx0Y2FzZSAnc3VidHJhY3RPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHllYXJNb250aER1cmF0aW9uU3VidHJhY3QoY2FzdEEudmFsdWUsIGNhc3RCLnZhbHVlKSwgJ3hzOnllYXJNb250aER1cmF0aW9uJyk7XG5cdFx0XHRcdH07XG5cdFx0XHRjYXNlICdkaXZPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHllYXJNb250aER1cmF0aW9uRGl2aWRlQnlZZWFyTW9udGhEdXJhdGlvbihjYXN0QS52YWx1ZSwgY2FzdEIudmFsdWUpLCAneHM6ZG91YmxlJyk7XG5cdFx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0aWYgKGlzU3VidHlwZU9mKHR5cGVBLCAneHM6eWVhck1vbnRoRHVyYXRpb24nKSAmJiBpc1N1YnR5cGVPZih0eXBlQiwgJ3hzOm51bWVyaWMnKSkge1xuXHRcdHN3aXRjaCAob3BlcmF0b3IpIHtcblx0XHRcdGNhc2UgJ211bHRpcGx5T3AnOlxuXHRcdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZSh5ZWFyTW9udGhEdXJhdGlvbk11bHRpcGx5KGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czp5ZWFyTW9udGhEdXJhdGlvbicpO1xuXHRcdFx0XHR9O1xuXHRcdFx0Y2FzZSAnZGl2T3AnOlxuXHRcdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZSh5ZWFyTW9udGhEdXJhdGlvbkRpdmlkZShjYXN0QS52YWx1ZSwgY2FzdEIudmFsdWUpLCAneHM6eWVhck1vbnRoRHVyYXRpb24nKTtcblx0XHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRpZiAoaXNTdWJ0eXBlT2YodHlwZUEsICd4czpudW1lcmljJykgJiYgaXNTdWJ0eXBlT2YodHlwZUIsICd4czp5ZWFyTW9udGhEdXJhdGlvbicpKSB7XG5cdFx0aWYgKG9wZXJhdG9yID09PSAnbXVsdGlwbHlPcCcpIHtcblx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoeWVhck1vbnRoRHVyYXRpb25NdWx0aXBseShjYXN0Qi52YWx1ZSwgY2FzdEEudmFsdWUpLCAneHM6eWVhck1vbnRoRHVyYXRpb24nKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0aWYgKGlzU3VidHlwZU9mKHR5cGVBLCAneHM6ZGF5VGltZUR1cmF0aW9uJykgJiYgaXNTdWJ0eXBlT2YodHlwZUIsICd4czpkYXlUaW1lRHVyYXRpb24nKSkge1xuXHRcdHN3aXRjaCAob3BlcmF0b3IpIHtcblx0XHRcdGNhc2UgJ2FkZE9wJzpcblx0XHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoZGF5VGltZUR1cmF0aW9uQWRkKGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czpkYXlUaW1lRHVyYXRpb24nKTtcblx0XHRcdFx0fTtcblx0XHRcdGNhc2UgJ3N1YnRyYWN0T3AnOlxuXHRcdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShkYXlUaW1lRHVyYXRpb25TdWJ0cmFjdChjYXN0QS52YWx1ZSwgY2FzdEIudmFsdWUpLCAneHM6ZGF5VGltZUR1cmF0aW9uJyk7XG5cdFx0XHRcdH07XG5cdFx0XHRjYXNlICdkaXZPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGRheVRpbWVEdXJhdGlvbkRpdmlkZUJ5RGF5VGltZUR1cmF0aW9uKGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czpkZWNpbWFsJyk7XG5cdFx0XHRcdH07XG5cdFx0fVxuXHR9XG5cdGlmIChpc1N1YnR5cGVPZih0eXBlQSwgJ3hzOmRheVRpbWVEdXJhdGlvbicpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6bnVtZXJpYycpKSB7XG5cdFx0c3dpdGNoIChvcGVyYXRvcikge1xuXHRcdFx0Y2FzZSAnbXVsdGlwbHlPcCc6XG5cdFx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGRheVRpbWVEdXJhdGlvbk11bHRpcGx5KGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czpkYXlUaW1lRHVyYXRpb24nKTtcblx0XHRcdFx0fTtcblx0XHRcdGNhc2UgJ2Rpdk9wJzpcblx0XHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoZGF5VGltZUR1cmF0aW9uRGl2aWRlKGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czpkYXlUaW1lRHVyYXRpb24nKTtcblx0XHRcdFx0fTtcblx0XHR9XG5cdH1cblx0aWYgKGlzU3VidHlwZU9mKHR5cGVBLCAneHM6bnVtZXJpYycpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6ZGF5VGltZUR1cmF0aW9uJykpIHtcblx0XHRpZiAob3BlcmF0b3IgPT09ICdtdWx0aXBseU9wJykge1xuXHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShkYXlUaW1lRHVyYXRpb25NdWx0aXBseShjYXN0Qi52YWx1ZSwgY2FzdEEudmFsdWUpLCAneHM6ZGF5VGltZUR1cmF0aW9uJyk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGlmICgoaXNTdWJ0eXBlT2YodHlwZUEsICd4czpkYXRlVGltZScpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6ZGF0ZVRpbWUnKSkgfHxcblx0XHQoaXNTdWJ0eXBlT2YodHlwZUEsICd4czpkYXRlJykgJiYgaXNTdWJ0eXBlT2YodHlwZUIsICd4czpkYXRlJykpIHx8XG5cdFx0KGlzU3VidHlwZU9mKHR5cGVBLCAneHM6dGltZScpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6dGltZScpKSkge1xuXHRcdGlmIChvcGVyYXRvciA9PT0gJ3N1YnRyYWN0T3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGRhdGVUaW1lU3VidHJhY3QoY2FzdEEudmFsdWUsIGNhc3RCLnZhbHVlKSwgJ3hzOmRheVRpbWVEdXJhdGlvbicpO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgRXJyb3IoYFhQVFkwMDA0OiAke29wZXJhdG9yfSBub3QgYXZhaWxhYmxlIGZvciB0eXBlcyAke3R5cGVBfSBhbmQgJHt0eXBlQn1gKTtcblx0fVxuXG5cdGlmICgoaXNTdWJ0eXBlT2YodHlwZUEsICd4czpkYXRlVGltZScpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6eWVhck1vbnRoRHVyYXRpb24nKSkgfHxcblx0XHQoaXNTdWJ0eXBlT2YodHlwZUEsICd4czpkYXRlVGltZScpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6ZGF5VGltZUR1cmF0aW9uJykpKSB7XG5cdFx0aWYgKG9wZXJhdG9yID09PSAnYWRkT3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGFkZER1cmF0aW9uVG9EYXRlVGltZShjYXN0QS52YWx1ZSwgY2FzdEIudmFsdWUpLCAneHM6ZGF0ZVRpbWUnKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChvcGVyYXRvciA9PT0gJ3N1YnRyYWN0T3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHN1YnRyYWN0RHVyYXRpb25Gcm9tRGF0ZVRpbWUoY2FzdEEudmFsdWUsIGNhc3RCLnZhbHVlKSwgJ3hzOmRhdGVUaW1lJyk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGlmICgoaXNTdWJ0eXBlT2YodHlwZUEsICd4czpkYXRlJykgJiYgaXNTdWJ0eXBlT2YodHlwZUIsICd4czp5ZWFyTW9udGhEdXJhdGlvbicpKSB8fFxuXHRcdChpc1N1YnR5cGVPZih0eXBlQSwgJ3hzOmRhdGUnKSAmJiBpc1N1YnR5cGVPZih0eXBlQiwgJ3hzOmRheVRpbWVEdXJhdGlvbicpKSkge1xuXHRcdGlmIChvcGVyYXRvciA9PT0gJ2FkZE9wJykge1xuXHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShhZGREdXJhdGlvblRvRGF0ZVRpbWUoY2FzdEEudmFsdWUsIGNhc3RCLnZhbHVlKSwgJ3hzOmRhdGUnKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChvcGVyYXRvciA9PT0gJ3N1YnRyYWN0T3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHN1YnRyYWN0RHVyYXRpb25Gcm9tRGF0ZVRpbWUoY2FzdEEudmFsdWUsIGNhc3RCLnZhbHVlKSwgJ3hzOmRhdGUnKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0aWYgKGlzU3VidHlwZU9mKHR5cGVBLCAneHM6dGltZScpICYmIGlzU3VidHlwZU9mKHR5cGVCLCAneHM6ZGF5VGltZUR1cmF0aW9uJykpIHtcblx0XHRpZiAob3BlcmF0b3IgPT09ICdhZGRPcCcpIHtcblx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoYWRkRHVyYXRpb25Ub0RhdGVUaW1lKGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czp0aW1lJyk7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRpZiAob3BlcmF0b3IgPT09ICdzdWJ0cmFjdE9wJykge1xuXHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShzdWJ0cmFjdER1cmF0aW9uRnJvbURhdGVUaW1lKGNhc3RBLnZhbHVlLCBjYXN0Qi52YWx1ZSksICd4czp0aW1lJyk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGlmICgoaXNTdWJ0eXBlT2YodHlwZUIsICd4czp5ZWFyTW9udGhEdXJhdGlvbicpICYmIGlzU3VidHlwZU9mKHR5cGVBLCAneHM6ZGF0ZVRpbWUnKSkgfHxcblx0XHQoaXNTdWJ0eXBlT2YodHlwZUIsICd4czpkYXlUaW1lRHVyYXRpb24nKSAmJiBpc1N1YnR5cGVPZih0eXBlQSwgJ3hzOmRhdGVUaW1lJykpKSB7XG5cdFx0aWYgKG9wZXJhdG9yID09PSAnYWRkT3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGFkZER1cmF0aW9uVG9EYXRlVGltZShjYXN0Qi52YWx1ZSwgY2FzdEEudmFsdWUpLCAneHM6ZGF0ZVRpbWUnKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChvcGVyYXRvciA9PT0gJ3N1YnRyYWN0T3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHN1YnRyYWN0RHVyYXRpb25Gcm9tRGF0ZVRpbWUoY2FzdEIudmFsdWUsIGNhc3RBLnZhbHVlKSwgJ3hzOmRhdGVUaW1lJyk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHR9XG5cblx0aWYgKChpc1N1YnR5cGVPZih0eXBlQiwgJ3hzOmRheVRpbWVEdXJhdGlvbicpICYmIGlzU3VidHlwZU9mKHR5cGVBLCAneHM6ZGF0ZScpKSB8fFxuXHRcdCgoaXNTdWJ0eXBlT2YodHlwZUIsICd4czp5ZWFyTW9udGhEdXJhdGlvbicpICYmIGlzU3VidHlwZU9mKHR5cGVBLCAneHM6ZGF0ZScpKSkpIHtcblx0XHRpZiAob3BlcmF0b3IgPT09ICdhZGRPcCcpIHtcblx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoYWRkRHVyYXRpb25Ub0RhdGVUaW1lKGNhc3RCLnZhbHVlLCBjYXN0QS52YWx1ZSksICd4czpkYXRlJyk7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRpZiAob3BlcmF0b3IgPT09ICdzdWJ0cmFjdE9wJykge1xuXHRcdFx0cmV0dXJuIChhLCBiKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgY2FzdEEsIGNhc3RCIH0gPSBhcHBseUNhc3RGdW5jdGlvbnMoYSwgYik7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShzdWJ0cmFjdER1cmF0aW9uRnJvbURhdGVUaW1lKGNhc3RCLnZhbHVlLCBjYXN0QS52YWx1ZSksICd4czpkYXRlJyk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGlmIChpc1N1YnR5cGVPZih0eXBlQiwgJ3hzOmRheVRpbWVEdXJhdGlvbicpICYmIGlzU3VidHlwZU9mKHR5cGVBLCAneHM6dGltZScpKSB7XG5cdFx0aWYgKG9wZXJhdG9yID09PSAnYWRkT3AnKSB7XG5cdFx0XHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBjYXN0QSwgY2FzdEIgfSA9IGFwcGx5Q2FzdEZ1bmN0aW9ucyhhLCBiKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGFkZER1cmF0aW9uVG9EYXRlVGltZShjYXN0Qi52YWx1ZSwgY2FzdEEudmFsdWUpLCAneHM6dGltZScpO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0aWYgKG9wZXJhdG9yID09PSAnc3VidHJhY3RPcCcpIHtcblx0XHRcdHJldHVybiAoYSwgYikgPT4ge1xuXHRcdFx0XHRjb25zdCB7IGNhc3RBLCBjYXN0QiB9ID0gYXBwbHlDYXN0RnVuY3Rpb25zKGEsIGIpO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoc3VidHJhY3REdXJhdGlvbkZyb21EYXRlVGltZShjYXN0Qi52YWx1ZSwgY2FzdEEudmFsdWUpLCAneHM6dGltZScpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHR0aHJvdyBuZXcgRXJyb3IoYFhQVFkwMDA0OiAke29wZXJhdG9yfSBub3QgYXZhaWxhYmxlIGZvciB0eXBlcyAke3R5cGVBfSBhbmQgJHt0eXBlQn1gKTtcbn1cblxuY29uc3Qgb3BlcmF0b3JzQnlUeXBpbmdLZXkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5jbGFzcyBCaW5hcnlPcGVyYXRvciBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHRfZmlyc3RWYWx1ZUV4cHI6IEV4cHJlc3Npb247XG5cdF9zZWNvbmRWYWx1ZUV4cHI6IEV4cHJlc3Npb247XG5cdF9vcGVyYXRvcjogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gIG9wZXJhdG9yICAgICAgICAgT25lIG9mIGFkZE9wLCBzdWJzdHJhY3RPcCwgbXVsdGlwbHlPcCwgZGl2T3AsIGlkaXZPcCwgbW9kT3Bcblx0ICogQHBhcmFtICBmaXJzdFZhbHVlRXhwciAgIFRoZSBzZWxlY3RvciBldmFsdWF0aW5nIHRvIHRoZSBmaXJzdCB2YWx1ZSB0byBwcm9jZXNzXG5cdCAqIEBwYXJhbSAgc2Vjb25kVmFsdWVFeHByICBUaGUgc2VsZWN0b3IgZXZhbHVhdGluZyB0byB0aGUgc2Vjb25kIHZhbHVlIHRvIHByb2Nlc3Ncblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wZXJhdG9yOiBzdHJpbmcsIGZpcnN0VmFsdWVFeHByOiBFeHByZXNzaW9uLCBzZWNvbmRWYWx1ZUV4cHI6IEV4cHJlc3Npb24pIHtcblx0XHRzdXBlcihcblx0XHRcdGZpcnN0VmFsdWVFeHByLnNwZWNpZmljaXR5LmFkZChzZWNvbmRWYWx1ZUV4cHIuc3BlY2lmaWNpdHkpLFxuXHRcdFx0W2ZpcnN0VmFsdWVFeHByLCBzZWNvbmRWYWx1ZUV4cHJdLFxuXHRcdFx0e1xuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR0aGlzLl9maXJzdFZhbHVlRXhwciA9IGZpcnN0VmFsdWVFeHByO1xuXHRcdHRoaXMuX3NlY29uZFZhbHVlRXhwciA9IHNlY29uZFZhbHVlRXhwcjtcblxuXHRcdHRoaXMuX29wZXJhdG9yID0gb3BlcmF0b3I7XG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRjb25zdCBmaXJzdFZhbHVlU2VxdWVuY2UgPSB0aGlzLl9maXJzdFZhbHVlRXhwci5ldmFsdWF0ZU1heWJlU3RhdGljYWxseShkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykuYXRvbWl6ZShleGVjdXRpb25QYXJhbWV0ZXJzKTtcblx0XHRyZXR1cm4gZmlyc3RWYWx1ZVNlcXVlbmNlLm1hcEFsbChcblx0XHRcdGZpcnN0VmFsdWVzID0+IHtcblx0XHRcdFx0aWYgKGZpcnN0VmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdC8vIFNob3J0Y3V0LCBpZiB0aGUgZmlyc3QgcGFydCBpcyBlbXB0eSwgd2UgY2FuIHJldHVybiBlbXB0eS5cblx0XHRcdFx0XHQvLyBBcyBwZXIgc3BlYywgd2UgZG8gbm90IGhhdmUgdG8gZXZhbHVhdGUgdGhlIHNlY29uZCBwYXJ0LCB0aG91Z2ggd2UgY291bGQuXG5cdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5lbXB0eSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNlY29uZFZhbHVlU2VxdWVuY2UgPSB0aGlzLl9zZWNvbmRWYWx1ZUV4cHIuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpLmF0b21pemUoZXhlY3V0aW9uUGFyYW1ldGVycyk7XG5cdFx0XHRcdHJldHVybiBzZWNvbmRWYWx1ZVNlcXVlbmNlLm1hcEFsbChcblx0XHRcdFx0XHRzZWNvbmRWYWx1ZXMgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHNlY29uZFZhbHVlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5lbXB0eSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoZmlyc3RWYWx1ZXMubGVuZ3RoID4gMSB8fCBzZWNvbmRWYWx1ZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1hQVFkwMDA0OiB0aGUgb3BlcmFuZHMgb2YgdGhlIFwiJyArIHRoaXMuX29wZXJhdG9yICsgJ1wiIG9wZXJhdG9yIHNob3VsZCBiZSBlbXB0eSBvciBzaW5nbGV0b24uJyk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IGZpcnN0VmFsdWUgPSBmaXJzdFZhbHVlc1swXTtcblx0XHRcdFx0XHRcdGNvbnN0IHNlY29uZFZhbHVlID0gc2Vjb25kVmFsdWVzWzBdO1xuXHRcdFx0XHRcdFx0Y29uc3QgdHlwaW5nS2V5ID0gYCR7Zmlyc3RWYWx1ZS50eXBlfX4ke3NlY29uZFZhbHVlLnR5cGV9fiR7dGhpcy5fb3BlcmF0b3J9YDtcblx0XHRcdFx0XHRcdGxldCBwcmVmYWJPcGVyYXRvciA9IG9wZXJhdG9yc0J5VHlwaW5nS2V5W3R5cGluZ0tleV07XG5cdFx0XHRcdFx0XHRpZiAoIXByZWZhYk9wZXJhdG9yKSB7XG5cdFx0XHRcdFx0XHRcdHByZWZhYk9wZXJhdG9yID0gb3BlcmF0b3JzQnlUeXBpbmdLZXlbdHlwaW5nS2V5XSA9IGdlbmVyYXRlQmluYXJ5T3BlcmF0b3JGdW5jdGlvbihcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9vcGVyYXRvcixcblx0XHRcdFx0XHRcdFx0XHRmaXJzdFZhbHVlLnR5cGUsXG5cdFx0XHRcdFx0XHRcdFx0c2Vjb25kVmFsdWUudHlwZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKHByZWZhYk9wZXJhdG9yKGZpcnN0VmFsdWUsIHNlY29uZFZhbHVlKSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCaW5hcnlPcGVyYXRvcjtcbiJdfQ==