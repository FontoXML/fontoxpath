"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequenceFactory_1 = require("../../dataTypes/SequenceFactory");
const valueCompare_1 = require("./valueCompare");
const isSubtypeOf_1 = require("../../dataTypes/isSubtypeOf");
const castToType_1 = require("../../dataTypes/castToType");
const OPERATOR_TRANSLATION = {
    'equalOp': 'eqOp',
    'notEqualOp': 'neOp',
    'lessThanOrEqualOp': 'leOp',
    'lessThanOp': 'ltOp',
    'greaterThanOrEqualOp': 'geOp',
    'greaterThanOp': 'gtOp'
};
function generalCompare(operator, firstSequence, secondSequence, dynamicContext) {
    // Change operator to equivalent valueCompare operator
    operator = OPERATOR_TRANSLATION[operator];
    return secondSequence.mapAll(allSecondValues => firstSequence.filter(firstValue => {
        for (let i = 0, l = allSecondValues.length; i < l; ++i) {
            // General comapres are value compare, with one difference:
            // If exactly one of the atomic values is an instance of xs:untypedAtomic, it is
            // cast to a type depending on the other value's dynamic type T according to the
            // following rules, in which V denotes the value to be cast:
            // If T is a numeric type or is derived from a numeric type, then V is cast to
            // xs:double.
            // If T is xs:dayTimeDuration or is derived from xs:dayTimeDuration, then V is
            // cast to xs:dayTimeDuration.
            // If T is xs:yearMonthDuration or is derived from xs:yearMonthDuration, then V
            // is cast to xs:yearMonthDuration.
            // In all other cases, V is cast to the primitive base type of T.
            let secondValue = allSecondValues[i];
            if (isSubtypeOf_1.default(firstValue.type, 'xs:untypedAtomic') ||
                isSubtypeOf_1.default(secondValue.type, 'xs:untypedAtomic')) {
                if (isSubtypeOf_1.default(firstValue.type, 'xs:numeric')) {
                    secondValue = castToType_1.default(secondValue, 'xs:double');
                }
                else if (isSubtypeOf_1.default(secondValue.type, 'xs:numeric')) {
                    firstValue = castToType_1.default(firstValue, 'xs:double');
                }
                else if (isSubtypeOf_1.default(firstValue.type, 'xs:dayTimeDuration')) {
                    secondValue = castToType_1.default(secondValue, 'xs:dayTimeDuration');
                }
                else if (isSubtypeOf_1.default(secondValue.type, 'xs:dayTimeDuration')) {
                    firstValue = castToType_1.default(firstValue, 'xs:dayTimeDuration');
                }
                else if (isSubtypeOf_1.default(firstValue.type, 'xs:yearMonthDuration')) {
                    secondValue = castToType_1.default(secondValue, 'xs:yearMonthDuration');
                }
                else if (isSubtypeOf_1.default(secondValue.type, 'xs:yearMonthDuration')) {
                    firstValue = castToType_1.default(firstValue, 'xs:yearMonthDuration');
                }
                else if (isSubtypeOf_1.default(firstValue.type, 'xs:untypedAtomic')) {
                    secondValue = castToType_1.default(secondValue, firstValue.type);
                }
                else if (isSubtypeOf_1.default(secondValue.type, 'xs:untypedAtomic')) {
                    firstValue = castToType_1.default(firstValue, firstValue.type);
                }
            }
            if (valueCompare_1.default(operator, firstValue, secondValue, dynamicContext)) {
                return true;
            }
        }
        return false;
    }).switchCases({
        empty: () => SequenceFactory_1.default.singletonFalseSequence(),
        default: () => SequenceFactory_1.default.singletonTrueSequence()
    }));
}
exports.default = generalCompare;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhbENvbXBhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnZW5lcmFsQ29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFFQUE4RDtBQUM5RCxpREFBMEM7QUFDMUMsNkRBQXNEO0FBQ3RELDJEQUFvRDtBQUtwRCxNQUFNLG9CQUFvQixHQUFHO0lBQzVCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsWUFBWSxFQUFFLE1BQU07SUFDcEIsc0JBQXNCLEVBQUUsTUFBTTtJQUM5QixlQUFlLEVBQUUsTUFBTTtDQUN2QixDQUFDO0FBRUYsU0FBd0IsY0FBYyxDQUNyQyxRQUFnQixFQUNoQixhQUF3QixFQUN4QixjQUF5QixFQUN6QixjQUE4QjtJQUU5QixzREFBc0Q7SUFDdEQsUUFBUSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTFDLE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FDM0IsZUFBZSxDQUFDLEVBQUUsQ0FDakIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ3ZELDJEQUEyRDtZQUMzRCxnRkFBZ0Y7WUFDaEYsZ0ZBQWdGO1lBQ2hGLDREQUE0RDtZQUU1RCw4RUFBOEU7WUFDOUUsYUFBYTtZQUViLDhFQUE4RTtZQUM5RSw4QkFBOEI7WUFFOUIsK0VBQStFO1lBQy9FLG1DQUFtQztZQUVuQyxpRUFBaUU7WUFDakUsSUFBSSxXQUFXLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQ0MscUJBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDO2dCQUMvQyxxQkFBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxxQkFBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQUU7b0JBQy9DLFdBQVcsR0FBRyxvQkFBVSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDbkQ7cUJBQ0ksSUFBSSxxQkFBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQUU7b0JBQ3JELFVBQVUsR0FBRyxvQkFBVSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7cUJBQ0ksSUFBSSxxQkFBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtvQkFDNUQsV0FBVyxHQUFHLG9CQUFVLENBQUMsV0FBVyxFQUFFLG9CQUFvQixDQUFDLENBQUM7aUJBQzVEO3FCQUNJLElBQUkscUJBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLEVBQUU7b0JBQzdELFVBQVUsR0FBRyxvQkFBVSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO2lCQUMxRDtxQkFDSSxJQUFJLHFCQUFXLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO29CQUM5RCxXQUFXLEdBQUcsb0JBQVUsQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztpQkFDOUQ7cUJBQ0ksSUFBSSxxQkFBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsRUFBRTtvQkFDL0QsVUFBVSxHQUFHLG9CQUFVLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLENBQUM7aUJBQzVEO3FCQUNJLElBQUkscUJBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7b0JBQzFELFdBQVcsR0FBRyxvQkFBVSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3ZEO3FCQUNJLElBQUkscUJBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7b0JBQzNELFVBQVUsR0FBRyxvQkFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3JEO2FBQ0Q7WUFFRCxJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDLEVBQUU7Z0JBQ3BFLE9BQU8sSUFBSSxDQUFDO2FBQ1o7U0FDRDtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ2QsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLHlCQUFlLENBQUMsc0JBQXNCLEVBQUU7UUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLHlCQUFlLENBQUMscUJBQXFCLEVBQUU7S0FDdEQsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDO0FBcEVELGlDQW9FQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgdmFsdWVDb21wYXJlIGZyb20gJy4vdmFsdWVDb21wYXJlJztcbmltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuLi8uLi9kYXRhVHlwZXMvaXNTdWJ0eXBlT2YnO1xuaW1wb3J0IGNhc3RUb1R5cGUgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL2Nhc3RUb1R5cGUnO1xuXG5pbXBvcnQgRHluYW1pY0NvbnRleHQgZnJvbSAnLi4vLi4vRHluYW1pY0NvbnRleHQnO1xuaW1wb3J0IElTZXF1ZW5jZSBmcm9tICdzcmMvZXhwcmVzc2lvbnMvZGF0YVR5cGVzL0lTZXF1ZW5jZSc7XG5cbmNvbnN0IE9QRVJBVE9SX1RSQU5TTEFUSU9OID0ge1xuXHQnZXF1YWxPcCc6ICdlcU9wJyxcblx0J25vdEVxdWFsT3AnOiAnbmVPcCcsXG5cdCdsZXNzVGhhbk9yRXF1YWxPcCc6ICdsZU9wJyxcblx0J2xlc3NUaGFuT3AnOiAnbHRPcCcsXG5cdCdncmVhdGVyVGhhbk9yRXF1YWxPcCc6ICdnZU9wJyxcblx0J2dyZWF0ZXJUaGFuT3AnOiAnZ3RPcCdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdlbmVyYWxDb21wYXJlKFxuXHRvcGVyYXRvcjogc3RyaW5nLFxuXHRmaXJzdFNlcXVlbmNlOiBJU2VxdWVuY2UsXG5cdHNlY29uZFNlcXVlbmNlOiBJU2VxdWVuY2UsXG5cdGR5bmFtaWNDb250ZXh0OiBEeW5hbWljQ29udGV4dFxuKTogSVNlcXVlbmNlIHtcblx0Ly8gQ2hhbmdlIG9wZXJhdG9yIHRvIGVxdWl2YWxlbnQgdmFsdWVDb21wYXJlIG9wZXJhdG9yXG5cdG9wZXJhdG9yID0gT1BFUkFUT1JfVFJBTlNMQVRJT05bb3BlcmF0b3JdO1xuXG5cdHJldHVybiBzZWNvbmRTZXF1ZW5jZS5tYXBBbGwoXG5cdFx0YWxsU2Vjb25kVmFsdWVzID0+XG5cdFx0XHRmaXJzdFNlcXVlbmNlLmZpbHRlcihmaXJzdFZhbHVlID0+IHtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSBhbGxTZWNvbmRWYWx1ZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdFx0Ly8gR2VuZXJhbCBjb21hcHJlcyBhcmUgdmFsdWUgY29tcGFyZSwgd2l0aCBvbmUgZGlmZmVyZW5jZTpcblx0XHRcdFx0XHQvLyBJZiBleGFjdGx5IG9uZSBvZiB0aGUgYXRvbWljIHZhbHVlcyBpcyBhbiBpbnN0YW5jZSBvZiB4czp1bnR5cGVkQXRvbWljLCBpdCBpc1xuXHRcdFx0XHRcdC8vIGNhc3QgdG8gYSB0eXBlIGRlcGVuZGluZyBvbiB0aGUgb3RoZXIgdmFsdWUncyBkeW5hbWljIHR5cGUgVCBhY2NvcmRpbmcgdG8gdGhlXG5cdFx0XHRcdFx0Ly8gZm9sbG93aW5nIHJ1bGVzLCBpbiB3aGljaCBWIGRlbm90ZXMgdGhlIHZhbHVlIHRvIGJlIGNhc3Q6XG5cblx0XHRcdFx0XHQvLyBJZiBUIGlzIGEgbnVtZXJpYyB0eXBlIG9yIGlzIGRlcml2ZWQgZnJvbSBhIG51bWVyaWMgdHlwZSwgdGhlbiBWIGlzIGNhc3QgdG9cblx0XHRcdFx0XHQvLyB4czpkb3VibGUuXG5cblx0XHRcdFx0XHQvLyBJZiBUIGlzIHhzOmRheVRpbWVEdXJhdGlvbiBvciBpcyBkZXJpdmVkIGZyb20geHM6ZGF5VGltZUR1cmF0aW9uLCB0aGVuIFYgaXNcblx0XHRcdFx0XHQvLyBjYXN0IHRvIHhzOmRheVRpbWVEdXJhdGlvbi5cblxuXHRcdFx0XHRcdC8vIElmIFQgaXMgeHM6eWVhck1vbnRoRHVyYXRpb24gb3IgaXMgZGVyaXZlZCBmcm9tIHhzOnllYXJNb250aER1cmF0aW9uLCB0aGVuIFZcblx0XHRcdFx0XHQvLyBpcyBjYXN0IHRvIHhzOnllYXJNb250aER1cmF0aW9uLlxuXG5cdFx0XHRcdFx0Ly8gSW4gYWxsIG90aGVyIGNhc2VzLCBWIGlzIGNhc3QgdG8gdGhlIHByaW1pdGl2ZSBiYXNlIHR5cGUgb2YgVC5cblx0XHRcdFx0XHRsZXQgc2Vjb25kVmFsdWUgPSBhbGxTZWNvbmRWYWx1ZXNbaV07XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0aXNTdWJ0eXBlT2YoZmlyc3RWYWx1ZS50eXBlLCAneHM6dW50eXBlZEF0b21pYycpIHx8XG5cdFx0XHRcdFx0XHRcdGlzU3VidHlwZU9mKHNlY29uZFZhbHVlLnR5cGUsICd4czp1bnR5cGVkQXRvbWljJykpIHtcblx0XHRcdFx0XHRcdGlmIChpc1N1YnR5cGVPZihmaXJzdFZhbHVlLnR5cGUsICd4czpudW1lcmljJykpIHtcblx0XHRcdFx0XHRcdFx0c2Vjb25kVmFsdWUgPSBjYXN0VG9UeXBlKHNlY29uZFZhbHVlLCAneHM6ZG91YmxlJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChpc1N1YnR5cGVPZihzZWNvbmRWYWx1ZS50eXBlLCAneHM6bnVtZXJpYycpKSB7XG5cdFx0XHRcdFx0XHRcdGZpcnN0VmFsdWUgPSBjYXN0VG9UeXBlKGZpcnN0VmFsdWUsICd4czpkb3VibGUnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGlzU3VidHlwZU9mKGZpcnN0VmFsdWUudHlwZSwgJ3hzOmRheVRpbWVEdXJhdGlvbicpKSB7XG5cdFx0XHRcdFx0XHRcdHNlY29uZFZhbHVlID0gY2FzdFRvVHlwZShzZWNvbmRWYWx1ZSwgJ3hzOmRheVRpbWVEdXJhdGlvbicpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoaXNTdWJ0eXBlT2Yoc2Vjb25kVmFsdWUudHlwZSwgJ3hzOmRheVRpbWVEdXJhdGlvbicpKSB7XG5cdFx0XHRcdFx0XHRcdGZpcnN0VmFsdWUgPSBjYXN0VG9UeXBlKGZpcnN0VmFsdWUsICd4czpkYXlUaW1lRHVyYXRpb24nKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGlzU3VidHlwZU9mKGZpcnN0VmFsdWUudHlwZSwgJ3hzOnllYXJNb250aER1cmF0aW9uJykpIHtcblx0XHRcdFx0XHRcdFx0c2Vjb25kVmFsdWUgPSBjYXN0VG9UeXBlKHNlY29uZFZhbHVlLCAneHM6eWVhck1vbnRoRHVyYXRpb24nKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGlzU3VidHlwZU9mKHNlY29uZFZhbHVlLnR5cGUsICd4czp5ZWFyTW9udGhEdXJhdGlvbicpKSB7XG5cdFx0XHRcdFx0XHRcdGZpcnN0VmFsdWUgPSBjYXN0VG9UeXBlKGZpcnN0VmFsdWUsICd4czp5ZWFyTW9udGhEdXJhdGlvbicpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoaXNTdWJ0eXBlT2YoZmlyc3RWYWx1ZS50eXBlLCAneHM6dW50eXBlZEF0b21pYycpKSB7XG5cdFx0XHRcdFx0XHRcdHNlY29uZFZhbHVlID0gY2FzdFRvVHlwZShzZWNvbmRWYWx1ZSwgZmlyc3RWYWx1ZS50eXBlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGlzU3VidHlwZU9mKHNlY29uZFZhbHVlLnR5cGUsICd4czp1bnR5cGVkQXRvbWljJykpIHtcblx0XHRcdFx0XHRcdFx0Zmlyc3RWYWx1ZSA9IGNhc3RUb1R5cGUoZmlyc3RWYWx1ZSwgZmlyc3RWYWx1ZS50eXBlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAodmFsdWVDb21wYXJlKG9wZXJhdG9yLCBmaXJzdFZhbHVlLCBzZWNvbmRWYWx1ZSwgZHluYW1pY0NvbnRleHQpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSkuc3dpdGNoQ2FzZXMoe1xuXHRcdFx0XHRlbXB0eTogKCkgPT4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbkZhbHNlU2VxdWVuY2UoKSxcblx0XHRcdFx0ZGVmYXVsdDogKCkgPT4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvblRydWVTZXF1ZW5jZSgpXG5cdFx0XHR9KSk7XG5cbn1cbiJdfQ==