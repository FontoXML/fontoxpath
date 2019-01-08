"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isSubtypeOf_1 = require("../../dataTypes/isSubtypeOf");
const SequenceFactory_1 = require("../../dataTypes/SequenceFactory");
const Expression_1 = require("../../Expression");
const createAtomicValue_1 = require("../../dataTypes/createAtomicValue");
const castToType_1 = require("../../dataTypes/castToType");
class Unary extends Expression_1.default {
    /**
     * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
     * @param  kind       Either + or -
     * @param  valueExpr  The selector evaluating to the value to process
     */
    constructor(kind, valueExpr) {
        super(valueExpr.specificity, [valueExpr], { canBeStaticallyEvaluated: false });
        this._valueExpr = valueExpr;
        this._kind = kind;
    }
    evaluate(dynamicContext, executionParameters) {
        return this._valueExpr.evaluateMaybeStatically(dynamicContext, executionParameters)
            .atomize(executionParameters)
            .mapAll(atomizedValues => {
            if (atomizedValues.length === 0) {
                // Return the empty sequence when inputted the empty sequence
                return SequenceFactory_1.default.empty();
            }
            if (atomizedValues.length > 1) {
                throw new Error('XPTY0004: The operand to a unary operator must be a sequence with a length less than one');
            }
            const value = atomizedValues[0];
            if (isSubtypeOf_1.default(value.type, 'xs:untypedAtomic')) {
                const castValue = castToType_1.default(value, 'xs:double').value;
                return SequenceFactory_1.default.singleton(createAtomicValue_1.default(this._kind === '+' ? castValue : -castValue, 'xs:double'));
            }
            if (this._kind === '+') {
                if (isSubtypeOf_1.default(value.type, 'xs:decimal') ||
                    isSubtypeOf_1.default(value.type, 'xs:double') ||
                    isSubtypeOf_1.default(value.type, 'xs:float') ||
                    isSubtypeOf_1.default(value.type, 'xs:integer')) {
                    return SequenceFactory_1.default.singleton(atomizedValues[0]);
                }
                return SequenceFactory_1.default.singleton(createAtomicValue_1.default(Number.NaN, 'xs:double'));
            }
            if (isSubtypeOf_1.default(value.type, 'xs:integer')) {
                return SequenceFactory_1.default.singleton(createAtomicValue_1.default(value.value * -1, 'xs:integer'));
            }
            if (isSubtypeOf_1.default(value.type, 'xs:decimal')) {
                return SequenceFactory_1.default.singleton(createAtomicValue_1.default(value.value * -1, 'xs:decimal'));
            }
            if (isSubtypeOf_1.default(value.type, 'xs:double')) {
                return SequenceFactory_1.default.singleton(createAtomicValue_1.default(value.value * -1, 'xs:double'));
            }
            if (isSubtypeOf_1.default(value.type, 'xs:float')) {
                return SequenceFactory_1.default.singleton(createAtomicValue_1.default(value.value * -1, 'xs:float'));
            }
            return SequenceFactory_1.default.singleton(createAtomicValue_1.default(Number.NaN, 'xs:double'));
        });
    }
}
exports.default = Unary;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5hcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVbmFyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZEQUFzRDtBQUN0RCxxRUFBOEQ7QUFDOUQsaURBQTBDO0FBQzFDLHlFQUFrRTtBQUNsRSwyREFBb0Q7QUFFcEQsTUFBTSxLQUFNLFNBQVEsb0JBQVU7SUFJN0I7Ozs7T0FJRztJQUNILFlBQVksSUFBWSxFQUFFLFNBQXFCO1FBQzlDLEtBQUssQ0FDSixTQUFTLENBQUMsV0FBVyxFQUNyQixDQUFDLFNBQVMsQ0FBQyxFQUNYLEVBQUUsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUU1QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQsUUFBUSxDQUFFLGNBQWMsRUFBRSxtQkFBbUI7UUFDNUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQzthQUNqRixPQUFPLENBQUMsbUJBQW1CLENBQUM7YUFDNUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3hCLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hDLDZEQUE2RDtnQkFDN0QsT0FBTyx5QkFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQy9CO1lBRUQsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQywwRkFBMEYsQ0FBQyxDQUFDO2FBQzVHO1lBRUQsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhDLElBQUkscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ2hELE1BQU0sU0FBUyxHQUFHLG9CQUFVLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEtBQWUsQ0FBQztnQkFDakUsT0FBTyx5QkFBZSxDQUFDLFNBQVMsQ0FBQywyQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQzlHO1lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsRUFBRTtnQkFDdkIsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO29CQUN4QyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDO29CQUNwQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDO29CQUNuQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQUU7b0JBQ3ZDLE9BQU8seUJBQWUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BEO2dCQUNELE9BQU8seUJBQWUsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQzdFO1lBRUQsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQzFDLE9BQU8seUJBQWUsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQzlGO1lBQ0QsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQzFDLE9BQU8seUJBQWUsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQzlGO1lBQ0QsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQ3pDLE9BQU8seUJBQWUsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQzdGO1lBQ0QsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUU7Z0JBQ3hDLE9BQU8seUJBQWUsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2FBQzVGO1lBRUQsT0FBTyx5QkFBZSxDQUFDLFNBQVMsQ0FBQywyQkFBaUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Q7QUFFRCxrQkFBZSxLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaXNTdWJ0eXBlT2YgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL2lzU3VidHlwZU9mJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi8uLi9FeHByZXNzaW9uJztcbmltcG9ydCBjcmVhdGVBdG9taWNWYWx1ZSBmcm9tICcuLi8uLi9kYXRhVHlwZXMvY3JlYXRlQXRvbWljVmFsdWUnO1xuaW1wb3J0IGNhc3RUb1R5cGUgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL2Nhc3RUb1R5cGUnO1xuXG5jbGFzcyBVbmFyeSBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHRfdmFsdWVFeHByOiBFeHByZXNzaW9uO1xuXHRfa2luZDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQb3NpdGl2ZXNlIG9yIG5lZ2F0aXZpc2UgYSB2YWx1ZTogKzEgPSAxLCAtMSA9IDAgLSAxLCAtMSArIDIgPSAxLCAtLTEgPSAxLCBldGNcblx0ICogQHBhcmFtICBraW5kICAgICAgIEVpdGhlciArIG9yIC1cblx0ICogQHBhcmFtICB2YWx1ZUV4cHIgIFRoZSBzZWxlY3RvciBldmFsdWF0aW5nIHRvIHRoZSB2YWx1ZSB0byBwcm9jZXNzXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihraW5kOiBzdHJpbmcsIHZhbHVlRXhwcjogRXhwcmVzc2lvbikge1xuXHRcdHN1cGVyKFxuXHRcdFx0dmFsdWVFeHByLnNwZWNpZmljaXR5LFxuXHRcdFx0W3ZhbHVlRXhwcl0sXG5cdFx0XHR7IGNhbkJlU3RhdGljYWxseUV2YWx1YXRlZDogZmFsc2UgfSk7XG5cdFx0dGhpcy5fdmFsdWVFeHByID0gdmFsdWVFeHByO1xuXG5cdFx0dGhpcy5fa2luZCA9IGtpbmQ7XG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmFsdWVFeHByLmV2YWx1YXRlTWF5YmVTdGF0aWNhbGx5KGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKVxuXHRcdFx0LmF0b21pemUoZXhlY3V0aW9uUGFyYW1ldGVycylcblx0XHRcdC5tYXBBbGwoYXRvbWl6ZWRWYWx1ZXMgPT4ge1xuXHRcdFx0XHRpZiAoYXRvbWl6ZWRWYWx1ZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0Ly8gUmV0dXJuIHRoZSBlbXB0eSBzZXF1ZW5jZSB3aGVuIGlucHV0dGVkIHRoZSBlbXB0eSBzZXF1ZW5jZVxuXHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhdG9taXplZFZhbHVlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUFRZMDAwNDogVGhlIG9wZXJhbmQgdG8gYSB1bmFyeSBvcGVyYXRvciBtdXN0IGJlIGEgc2VxdWVuY2Ugd2l0aCBhIGxlbmd0aCBsZXNzIHRoYW4gb25lJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IGF0b21pemVkVmFsdWVzWzBdO1xuXG5cdFx0XHRcdGlmIChpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6dW50eXBlZEF0b21pYycpKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FzdFZhbHVlID0gY2FzdFRvVHlwZSh2YWx1ZSwgJ3hzOmRvdWJsZScpLnZhbHVlIGFzIG51bWJlcjtcblx0XHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihjcmVhdGVBdG9taWNWYWx1ZSh0aGlzLl9raW5kID09PSAnKycgPyBjYXN0VmFsdWUgOiAtY2FzdFZhbHVlLCAneHM6ZG91YmxlJykpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHRoaXMuX2tpbmQgPT09ICcrJykge1xuXHRcdFx0XHRcdGlmIChpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6ZGVjaW1hbCcpIHx8XG5cdFx0XHRcdFx0XHRpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6ZG91YmxlJykgfHxcblx0XHRcdFx0XHRcdGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpmbG9hdCcpIHx8XG5cdFx0XHRcdFx0XHRpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6aW50ZWdlcicpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihhdG9taXplZFZhbHVlc1swXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKGNyZWF0ZUF0b21pY1ZhbHVlKE51bWJlci5OYU4sICd4czpkb3VibGUnKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmludGVnZXInKSkge1xuXHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKGNyZWF0ZUF0b21pY1ZhbHVlKHZhbHVlLnZhbHVlIGFzIG51bWJlciAqIC0xLCAneHM6aW50ZWdlcicpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmRlY2ltYWwnKSkge1xuXHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKGNyZWF0ZUF0b21pY1ZhbHVlKHZhbHVlLnZhbHVlIGFzIG51bWJlciAqIC0xLCAneHM6ZGVjaW1hbCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmRvdWJsZScpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oY3JlYXRlQXRvbWljVmFsdWUodmFsdWUudmFsdWUgYXMgbnVtYmVyICogLTEsICd4czpkb3VibGUnKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpmbG9hdCcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oY3JlYXRlQXRvbWljVmFsdWUodmFsdWUudmFsdWUgYXMgbnVtYmVyICogLTEsICd4czpmbG9hdCcpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKGNyZWF0ZUF0b21pY1ZhbHVlKE51bWJlci5OYU4sICd4czpkb3VibGUnKSk7XG5cdFx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBVbmFyeTtcbiJdfQ==