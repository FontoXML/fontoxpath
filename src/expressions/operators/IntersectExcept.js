"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
const documentOrderUtils_1 = require("../dataTypes/documentOrderUtils");
const iterators_1 = require("../util/iterators");
function ensureSortedSequence(intersectOrExcept, domFacade, sequence, expectedResultOrder) {
    return sequence.mapAll(values => {
        if (values.some(value => !isSubtypeOf_1.default(value.type, 'node()'))) {
            throw new Error(`XPTY0004: Sequences given to ${intersectOrExcept} should only contain nodes.`);
        }
        if (expectedResultOrder === Expression_1.default.RESULT_ORDERINGS.SORTED) {
            return SequenceFactory_1.default.create(values);
        }
        if (expectedResultOrder === Expression_1.default.RESULT_ORDERINGS.REVERSE_SORTED) {
            return SequenceFactory_1.default.create(values.reverse());
        }
        // Unsorted
        return SequenceFactory_1.default.create(documentOrderUtils_1.sortNodeValues(domFacade, values));
    });
}
/**
 * The 'intersect' expression: intersect and except
 */
class IntersectExcept extends Expression_1.default {
    constructor(intersectOrExcept, expression1, expression2) {
        const maxSpecificity = expression1.specificity.compareTo(expression2.specificity) > 0 ?
            expression1.specificity :
            expression2.specificity;
        super(maxSpecificity, [expression1, expression2], {
            canBeStaticallyEvaluated: expression1.canBeStaticallyEvaluated && expression2.canBeStaticallyEvaluated
        });
        this._intersectOrExcept = intersectOrExcept;
        this._expression1 = expression1;
        this._expression2 = expression2;
    }
    evaluate(dynamicContext, executionParameters) {
        const firstResult = ensureSortedSequence(this._intersectOrExcept, executionParameters.domFacade, this._expression1.evaluateMaybeStatically(dynamicContext, executionParameters), this._expression1.expectedResultOrder);
        const secondResult = ensureSortedSequence(this._intersectOrExcept, executionParameters.domFacade, this._expression2.evaluateMaybeStatically(dynamicContext, executionParameters), this._expression2.expectedResultOrder);
        const firstIterator = firstResult.value;
        const secondIterator = secondResult.value;
        let firstValue = null;
        let secondValue = null;
        let done = false;
        let secondIteratorDone = false;
        return SequenceFactory_1.default.create({
            next: () => {
                if (done) {
                    return iterators_1.DONE_TOKEN;
                }
                while (!secondIteratorDone) {
                    if (!firstValue) {
                        const itrResult = firstIterator.next();
                        if (!itrResult.ready) {
                            return itrResult;
                        }
                        if (itrResult.done) {
                            // Since ∅ \ X = ∅ and ∅ ∩ X = ∅, we are done.
                            done = true;
                            return iterators_1.DONE_TOKEN;
                        }
                        firstValue = itrResult.value;
                    }
                    if (!secondValue) {
                        const itrResult = secondIterator.next();
                        if (!itrResult.ready) {
                            return itrResult;
                        }
                        if (itrResult.done) {
                            secondIteratorDone = true;
                            break;
                        }
                        secondValue = itrResult.value;
                    }
                    if (firstValue.value === secondValue.value) {
                        const toReturn = iterators_1.ready(firstValue);
                        firstValue = null;
                        secondValue = null;
                        if (this._intersectOrExcept === 'intersectOp') {
                            return toReturn;
                        }
                        continue;
                    }
                    const comparisonResult = documentOrderUtils_1.compareNodePositions(executionParameters.domFacade, firstValue, secondValue);
                    if (comparisonResult < 0) {
                        const toReturn = iterators_1.ready(firstValue);
                        firstValue = null;
                        if (this._intersectOrExcept === 'exceptOp') {
                            return toReturn;
                        }
                    }
                    else {
                        secondValue = null;
                    }
                }
                // The second array is empty.
                if (this._intersectOrExcept === 'exceptOp') {
                    // Since X \ ∅ = X, we can output all items of X
                    if (firstValue !== null) {
                        const toReturn = iterators_1.ready(firstValue);
                        firstValue = null;
                        return toReturn;
                    }
                    return firstIterator.next();
                }
                // Since X ∩ ∅ = ∅, we are done.
                done = true;
                return iterators_1.DONE_TOKEN;
            }
        });
    }
}
exports.default = IntersectExcept;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJzZWN0RXhjZXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSW50ZXJzZWN0RXhjZXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXVDO0FBQ3ZDLGtFQUEyRDtBQUMzRCwwREFBbUQ7QUFDbkQsd0VBQXVGO0FBQ3ZGLGlEQUFzRDtBQUl0RCxTQUFTLG9CQUFvQixDQUFDLGlCQUF5QixFQUFFLFNBQW9CLEVBQUUsUUFBbUIsRUFBRSxtQkFBd0I7SUFDM0gsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQy9CLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7WUFDN0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsaUJBQWlCLDZCQUE2QixDQUFDLENBQUM7U0FDaEc7UUFDRCxJQUFJLG1CQUFtQixLQUFLLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1lBQy9ELE9BQU8seUJBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FFdEM7UUFDRCxJQUFJLG1CQUFtQixLQUFLLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFO1lBQ3ZFLE9BQU8seUJBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDaEQ7UUFFRCxXQUFXO1FBQ1gsT0FBTyx5QkFBZSxDQUFDLE1BQU0sQ0FBQyxtQ0FBYyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxlQUFnQixTQUFRLG9CQUFVO0lBSXZDLFlBQVksaUJBQXlCLEVBQUUsV0FBdUIsRUFBRSxXQUF1QjtRQUN0RixNQUFNLGNBQWMsR0FB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SSxDQUFDO3dCQUNuQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxhQUFhLEVBQUU7NEJBQzlDLE9BQU8sUUFBUSxDQUFDO3lCQUNoQjt3QkFDRCxTQUFTO3FCQUNUO29CQUVELE1BQU0sZ0JBQWdCLEdBQUcseUNBQW9CLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDdEcsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUU7d0JBQ3pCLE1BQU0sUUFBUSxHQUFHLGlCQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ25DLFVBQVUsR0FBRyxJQUFJLENBQUM7d0JBQ2xCLElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLFVBQVUsRUFBRTs0QkFDM0MsT0FBTyxRQUFRLENBQUM7eUJBQ2hCO3FCQUNEO3lCQUNJO3dCQUNKLFdBQVcsR0FBRyxJQUFJLENBQUM7cUJBQ25CO2lCQUNEO2dCQUVELDZCQUE2QjtnQkFDN0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssVUFBVSxFQUFFO29CQUMzQyxnREFBZ0Q7b0JBQ2hELElBQUksVUFBVSxLQUFLLElBQUksRUFBRTt3QkFDeEIsTUFBTSxRQUFRLEdBQUcsaUJBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDbkMsVUFBVSxHQUFHLElBQUksQ0FBQzt3QkFDbEIsT0FBTyxRQUFRLENBQUM7cUJBQ2hCO29CQUNELE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUM1QjtnQkFFRCxnQ0FBZ0M7Z0JBQ2hDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ1osT0FBTyxzQkFBVSxDQUFDO1lBQ25CLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFDRCxrQkFBZSxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi9FeHByZXNzaW9uJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgaXNTdWJ0eXBlT2YgZnJvbSAnLi4vZGF0YVR5cGVzL2lzU3VidHlwZU9mJztcbmltcG9ydCB7IHNvcnROb2RlVmFsdWVzLCBjb21wYXJlTm9kZVBvc2l0aW9ucyB9IGZyb20gJy4uL2RhdGFUeXBlcy9kb2N1bWVudE9yZGVyVXRpbHMnO1xuaW1wb3J0IHsgRE9ORV9UT0tFTiwgcmVhZHkgfSBmcm9tICcuLi91dGlsL2l0ZXJhdG9ycyc7XG5pbXBvcnQgRG9tRmFjYWRlIGZyb20gJ3NyYy9kb21GYWNhZGUvRG9tRmFjYWRlJztcbmltcG9ydCBJU2VxdWVuY2UgZnJvbSAnLi4vZGF0YVR5cGVzL0lTZXF1ZW5jZSc7XG5cbmZ1bmN0aW9uIGVuc3VyZVNvcnRlZFNlcXVlbmNlKGludGVyc2VjdE9yRXhjZXB0OiBzdHJpbmcsIGRvbUZhY2FkZTogRG9tRmFjYWRlLCBzZXF1ZW5jZTogSVNlcXVlbmNlLCBleHBlY3RlZFJlc3VsdE9yZGVyOiBhbnkpOiBJU2VxdWVuY2Uge1xuXHRyZXR1cm4gc2VxdWVuY2UubWFwQWxsKHZhbHVlcyA9PiB7XG5cdFx0aWYgKHZhbHVlcy5zb21lKHZhbHVlID0+ICFpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAnbm9kZSgpJykpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFhQVFkwMDA0OiBTZXF1ZW5jZXMgZ2l2ZW4gdG8gJHtpbnRlcnNlY3RPckV4Y2VwdH0gc2hvdWxkIG9ubHkgY29udGFpbiBub2Rlcy5gKTtcblx0XHR9XG5cdFx0aWYgKGV4cGVjdGVkUmVzdWx0T3JkZXIgPT09IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5TT1JURUQpIHtcblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKHZhbHVlcyk7XG5cblx0XHR9XG5cdFx0aWYgKGV4cGVjdGVkUmVzdWx0T3JkZXIgPT09IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5SRVZFUlNFX1NPUlRFRCkge1xuXHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUodmFsdWVzLnJldmVyc2UoKSk7XG5cdFx0fVxuXG5cdFx0Ly8gVW5zb3J0ZWRcblx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZShzb3J0Tm9kZVZhbHVlcyhkb21GYWNhZGUsIHZhbHVlcykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBUaGUgJ2ludGVyc2VjdCcgZXhwcmVzc2lvbjogaW50ZXJzZWN0IGFuZCBleGNlcHRcbiAqL1xuY2xhc3MgSW50ZXJzZWN0RXhjZXB0IGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdF9pbnRlcnNlY3RPckV4Y2VwdDogc3RyaW5nO1xuXHRfZXhwcmVzc2lvbjE6IEV4cHJlc3Npb247XG5cdF9leHByZXNzaW9uMjogRXhwcmVzc2lvbjtcblx0Y29uc3RydWN0b3IoaW50ZXJzZWN0T3JFeGNlcHQ6IHN0cmluZywgZXhwcmVzc2lvbjE6IEV4cHJlc3Npb24sIGV4cHJlc3Npb24yOiBFeHByZXNzaW9uKSB7XG5cdFx0Y29uc3QgbWF4U3BlY2lmaWNpdHkgPSBleHByZXNzaW9uMS5zcGVjaWZpY2l0eS5jb21wYXJlVG8oZXhwcmVzc2lvbjIuc3BlY2lmaWNpdHkpID4gMCA/XG5cdFx0XHRleHByZXNzaW9uMS5zcGVjaWZpY2l0eSA6XG5cdFx0XHRleHByZXNzaW9uMi5zcGVjaWZpY2l0eTtcblx0XHRzdXBlcihcblx0XHRcdG1heFNwZWNpZmljaXR5LFxuXHRcdFx0W2V4cHJlc3Npb24xLCBleHByZXNzaW9uMl0sXG5cdFx0XHR7XG5cdFx0XHRcdGNhbkJlU3RhdGljYWxseUV2YWx1YXRlZDogZXhwcmVzc2lvbjEuY2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkICYmIGV4cHJlc3Npb24yLmNhbkJlU3RhdGljYWxseUV2YWx1YXRlZFxuXHRcdFx0fVxuXHRcdCk7XG5cblx0XHR0aGlzLl9pbnRlcnNlY3RPckV4Y2VwdCA9IGludGVyc2VjdE9yRXhjZXB0O1xuXHRcdHRoaXMuX2V4cHJlc3Npb24xID0gZXhwcmVzc2lvbjE7XG5cdFx0dGhpcy5fZXhwcmVzc2lvbjIgPSBleHByZXNzaW9uMjtcblx0fVxuXG5cdGV2YWx1YXRlIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGZpcnN0UmVzdWx0ID0gZW5zdXJlU29ydGVkU2VxdWVuY2UoXG5cdFx0XHR0aGlzLl9pbnRlcnNlY3RPckV4Y2VwdCxcblx0XHRcdGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLFxuXHRcdFx0dGhpcy5fZXhwcmVzc2lvbjEuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpLFxuXHRcdFx0dGhpcy5fZXhwcmVzc2lvbjEuZXhwZWN0ZWRSZXN1bHRPcmRlcik7XG5cdFx0Y29uc3Qgc2Vjb25kUmVzdWx0ID0gZW5zdXJlU29ydGVkU2VxdWVuY2UoXG5cdFx0XHR0aGlzLl9pbnRlcnNlY3RPckV4Y2VwdCxcblx0XHRcdGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLFxuXHRcdFx0dGhpcy5fZXhwcmVzc2lvbjIuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpLFxuXHRcdFx0dGhpcy5fZXhwcmVzc2lvbjIuZXhwZWN0ZWRSZXN1bHRPcmRlcik7XG5cblx0XHRjb25zdCBmaXJzdEl0ZXJhdG9yID0gZmlyc3RSZXN1bHQudmFsdWU7XG5cdFx0Y29uc3Qgc2Vjb25kSXRlcmF0b3IgPSBzZWNvbmRSZXN1bHQudmFsdWU7XG5cblx0XHRsZXQgZmlyc3RWYWx1ZSA9IG51bGw7XG5cdFx0bGV0IHNlY29uZFZhbHVlID0gbnVsbDtcblxuXHRcdGxldCBkb25lID0gZmFsc2U7XG5cdFx0bGV0IHNlY29uZEl0ZXJhdG9yRG9uZSA9IGZhbHNlO1xuXHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKHtcblx0XHRcdG5leHQ6ICgpID0+IHtcblx0XHRcdFx0aWYgKGRvbmUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRE9ORV9UT0tFTjtcblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIXNlY29uZEl0ZXJhdG9yRG9uZSkge1xuXHRcdFx0XHRcdGlmICghZmlyc3RWYWx1ZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgaXRyUmVzdWx0ID0gZmlyc3RJdGVyYXRvci5uZXh0KCk7XG5cdFx0XHRcdFx0XHRpZiAoIWl0clJlc3VsdC5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gaXRyUmVzdWx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKGl0clJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFNpbmNlIOKIhSBcXCBYID0g4oiFIGFuZCDiiIUg4oipIFggPSDiiIUsIHdlIGFyZSBkb25lLlxuXHRcdFx0XHRcdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRmaXJzdFZhbHVlID0gaXRyUmVzdWx0LnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIXNlY29uZFZhbHVlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBpdHJSZXN1bHQgPSBzZWNvbmRJdGVyYXRvci5uZXh0KCk7XG5cdFx0XHRcdFx0XHRpZiAoIWl0clJlc3VsdC5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gaXRyUmVzdWx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKGl0clJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdFx0XHRcdHNlY29uZEl0ZXJhdG9yRG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2Vjb25kVmFsdWUgPSBpdHJSZXN1bHQudmFsdWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGZpcnN0VmFsdWUudmFsdWUgPT09IHNlY29uZFZhbHVlLnZhbHVlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0b1JldHVybiA9IHJlYWR5KGZpcnN0VmFsdWUpO1xuXHRcdFx0XHRcdFx0Zmlyc3RWYWx1ZSA9IG51bGw7XG5cdFx0XHRcdFx0XHRzZWNvbmRWYWx1ZSA9IG51bGw7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50ZXJzZWN0T3JFeGNlcHQgPT09ICdpbnRlcnNlY3RPcCcpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRvUmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgY29tcGFyaXNvblJlc3VsdCA9IGNvbXBhcmVOb2RlUG9zaXRpb25zKGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLCBmaXJzdFZhbHVlLCBzZWNvbmRWYWx1ZSk7XG5cdFx0XHRcdFx0aWYgKGNvbXBhcmlzb25SZXN1bHQgPCAwKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0b1JldHVybiA9IHJlYWR5KGZpcnN0VmFsdWUpO1xuXHRcdFx0XHRcdFx0Zmlyc3RWYWx1ZSA9IG51bGw7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50ZXJzZWN0T3JFeGNlcHQgPT09ICdleGNlcHRPcCcpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRvUmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHNlY29uZFZhbHVlID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUaGUgc2Vjb25kIGFycmF5IGlzIGVtcHR5LlxuXHRcdFx0XHRpZiAodGhpcy5faW50ZXJzZWN0T3JFeGNlcHQgPT09ICdleGNlcHRPcCcpIHtcblx0XHRcdFx0XHQvLyBTaW5jZSBYIFxcIOKIhSA9IFgsIHdlIGNhbiBvdXRwdXQgYWxsIGl0ZW1zIG9mIFhcblx0XHRcdFx0XHRpZiAoZmlyc3RWYWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdG9SZXR1cm4gPSByZWFkeShmaXJzdFZhbHVlKTtcblx0XHRcdFx0XHRcdGZpcnN0VmFsdWUgPSBudWxsO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRvUmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gZmlyc3RJdGVyYXRvci5uZXh0KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTaW5jZSBYIOKIqSDiiIUgPSDiiIUsIHdlIGFyZSBkb25lLlxuXHRcdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IEludGVyc2VjdEV4Y2VwdDtcbiJdfQ==