"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Specificity_1 = require("../../Specificity");
const SequenceFactory_1 = require("../../dataTypes/SequenceFactory");
const Expression_1 = require("../../Expression");
const createAtomicValue_1 = require("../../dataTypes/createAtomicValue");
const iterators_1 = require("../../util/iterators");
const isSubtypeOf_1 = require("../../dataTypes/isSubtypeOf");
const getBucketsForNode_1 = require("../../../getBucketsForNode");
class AndOperator extends Expression_1.default {
    constructor(expressions) {
        super(expressions.reduce(function (specificity, selector) {
            return specificity.add(selector.specificity);
        }, new Specificity_1.default({})), expressions, {
            canBeStaticallyEvaluated: expressions.every(selector => selector.canBeStaticallyEvaluated)
        });
        this._subExpressions = expressions;
    }
    evaluate(dynamicContext, executionParameters) {
        let i = 0;
        let resultSequence = null;
        let done = false;
        let contextItemBuckets = null;
        if (dynamicContext !== null) {
            const contextItem = dynamicContext.contextItem;
            if (contextItem !== null && isSubtypeOf_1.default(contextItem.type, 'node()')) {
                contextItemBuckets = getBucketsForNode_1.default(contextItem.value);
            }
        }
        return SequenceFactory_1.default.create({
            next: () => {
                if (!done) {
                    while (i < this._subExpressions.length) {
                        if (!resultSequence) {
                            const subExpression = this._subExpressions[i];
                            if (contextItemBuckets !== null && subExpression.getBucket() !== null) {
                                if (!contextItemBuckets.includes(subExpression.getBucket())) {
                                    // This subExpression may NEVER match the given node
                                    // We do not even have to evaluate the expression
                                    i++;
                                    done = true;
                                    return iterators_1.ready(createAtomicValue_1.falseBoolean);
                                }
                            }
                            resultSequence = subExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
                        }
                        const ebv = resultSequence.tryGetEffectiveBooleanValue();
                        if (!ebv.ready) {
                            return iterators_1.notReady(ebv.promise);
                        }
                        if (ebv.value === false) {
                            done = true;
                            return iterators_1.ready(createAtomicValue_1.falseBoolean);
                        }
                        resultSequence = null;
                        i++;
                    }
                    done = true;
                    return iterators_1.ready(createAtomicValue_1.trueBoolean);
                }
                return iterators_1.DONE_TOKEN;
            }
        });
    }
    getBucket() {
        // Any bucket of our subexpressions should do, and is preferable to no bucket
        for (let i = 0, l = this._subExpressions.length; i < l; ++i) {
            let bucket = this._subExpressions[i].getBucket();
            if (bucket) {
                return bucket;
            }
        }
        return null;
    }
}
exports.default = AndOperator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kT3BlcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbmRPcGVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUE0QztBQUM1QyxxRUFBOEQ7QUFDOUQsaURBQTBDO0FBQzFDLHlFQUE4RTtBQUM5RSxvREFBbUU7QUFDbkUsNkRBQXNEO0FBQ3RELGtFQUEyRDtBQUUzRCxNQUFNLFdBQVksU0FBUSxvQkFBVTtJQUVuQyxZQUFZLFdBQThCO1FBQ3pDLEtBQUssQ0FDSixXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsV0FBVyxFQUFFLFFBQVE7WUFDakQsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxDQUFDLEVBQUUsSUFBSSxxQkFBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZCLFdBQVcsRUFDWDtZQUNDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUM7U0FDMUYsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsQ0FBQztJQUVELFFBQVEsQ0FBRSxjQUFjLEVBQUUsbUJBQW1CO1FBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQztRQUMxQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7UUFDakIsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO1lBQzVCLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFDL0MsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLHFCQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRTtnQkFDcEUsa0JBQWtCLEdBQUcsMkJBQWlCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFEO1NBQ0Q7UUFDRCxPQUFPLHlCQUFlLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRTt3QkFDdkMsSUFBSSxDQUFDLGNBQWMsRUFBRTs0QkFDcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDOUMsSUFBSSxrQkFBa0IsS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBRSxLQUFLLElBQUksRUFBRTtnQ0FDdEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtvQ0FDNUQsb0RBQW9EO29DQUNwRCxpREFBaUQ7b0NBQ2pELENBQUMsRUFBRSxDQUFDO29DQUNKLElBQUksR0FBRyxJQUFJLENBQUM7b0NBQ1osT0FBTyxpQkFBSyxDQUFDLGdDQUFZLENBQUMsQ0FBQztpQ0FDM0I7NkJBQ0Q7NEJBQ0QsY0FBYyxHQUFHLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt5QkFDNUY7d0JBQ0QsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLDJCQUEyQixFQUFFLENBQUM7d0JBQ3pELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFOzRCQUNmLE9BQU8sb0JBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQzdCO3dCQUNELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7NEJBQ3hCLElBQUksR0FBRyxJQUFJLENBQUM7NEJBQ1osT0FBTyxpQkFBSyxDQUFDLGdDQUFZLENBQUMsQ0FBQzt5QkFDM0I7d0JBQ0QsY0FBYyxHQUFHLElBQUksQ0FBQzt3QkFDdEIsQ0FBQyxFQUFFLENBQUM7cUJBQ0o7b0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDWixPQUFPLGlCQUFLLENBQUMsK0JBQVcsQ0FBQyxDQUFDO2lCQUMxQjtnQkFDRCxPQUFPLHNCQUFVLENBQUM7WUFDbkIsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTO1FBQ1IsNkVBQTZFO1FBQzdFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQzVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakQsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxNQUFNLENBQUM7YUFDZDtTQUNEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBQ0Q7QUFDRCxrQkFBZSxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vLi4vU3BlY2lmaWNpdHknO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi8uLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uLy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IHsgdHJ1ZUJvb2xlYW4sIGZhbHNlQm9vbGVhbiB9IGZyb20gJy4uLy4uL2RhdGFUeXBlcy9jcmVhdGVBdG9taWNWYWx1ZSc7XG5pbXBvcnQgeyBET05FX1RPS0VOLCBub3RSZWFkeSwgcmVhZHkgfSBmcm9tICcuLi8uLi91dGlsL2l0ZXJhdG9ycyc7XG5pbXBvcnQgaXNTdWJ0eXBlT2YgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL2lzU3VidHlwZU9mJztcbmltcG9ydCBnZXRCdWNrZXRzRm9yTm9kZSBmcm9tICcuLi8uLi8uLi9nZXRCdWNrZXRzRm9yTm9kZSc7XG5cbmNsYXNzIEFuZE9wZXJhdG9yIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdF9zdWJFeHByZXNzaW9uczogRXhwcmVzc2lvbltdO1xuXHRjb25zdHJ1Y3RvcihleHByZXNzaW9uczogQXJyYXk8RXhwcmVzc2lvbj4pIHtcblx0XHRzdXBlcihcblx0XHRcdGV4cHJlc3Npb25zLnJlZHVjZShmdW5jdGlvbiAoc3BlY2lmaWNpdHksIHNlbGVjdG9yKSB7XG5cdFx0XHRcdHJldHVybiBzcGVjaWZpY2l0eS5hZGQoc2VsZWN0b3Iuc3BlY2lmaWNpdHkpO1xuXHRcdFx0fSwgbmV3IFNwZWNpZmljaXR5KHt9KSksXG5cdFx0XHRleHByZXNzaW9ucyxcblx0XHRcdHtcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBleHByZXNzaW9ucy5ldmVyeShzZWxlY3RvciA9PiBzZWxlY3Rvci5jYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQpXG5cdFx0XHR9KTtcblx0XHR0aGlzLl9zdWJFeHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xuXHR9XG5cblx0ZXZhbHVhdGUgKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0bGV0IGkgPSAwO1xuXHRcdGxldCByZXN1bHRTZXF1ZW5jZSA9IG51bGw7XG5cdFx0bGV0IGRvbmUgPSBmYWxzZTtcblx0XHRsZXQgY29udGV4dEl0ZW1CdWNrZXRzID0gbnVsbDtcblx0XHRpZiAoZHluYW1pY0NvbnRleHQgIT09IG51bGwpIHtcblx0XHRcdGNvbnN0IGNvbnRleHRJdGVtID0gZHluYW1pY0NvbnRleHQuY29udGV4dEl0ZW07XG5cdFx0XHRpZiAoY29udGV4dEl0ZW0gIT09IG51bGwgJiYgaXNTdWJ0eXBlT2YoY29udGV4dEl0ZW0udHlwZSwgJ25vZGUoKScpKSB7XG5cdFx0XHRcdGNvbnRleHRJdGVtQnVja2V0cyA9IGdldEJ1Y2tldHNGb3JOb2RlKGNvbnRleHRJdGVtLnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoe1xuXHRcdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWRvbmUpIHtcblx0XHRcdFx0XHR3aGlsZSAoaSA8IHRoaXMuX3N1YkV4cHJlc3Npb25zLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0aWYgKCFyZXN1bHRTZXF1ZW5jZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzdWJFeHByZXNzaW9uID0gdGhpcy5fc3ViRXhwcmVzc2lvbnNbaV07XG5cdFx0XHRcdFx0XHRcdGlmIChjb250ZXh0SXRlbUJ1Y2tldHMgIT09IG51bGwgJiYgc3ViRXhwcmVzc2lvbi5nZXRCdWNrZXQoKSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmICghY29udGV4dEl0ZW1CdWNrZXRzLmluY2x1ZGVzKHN1YkV4cHJlc3Npb24uZ2V0QnVja2V0KCkpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBUaGlzIHN1YkV4cHJlc3Npb24gbWF5IE5FVkVSIG1hdGNoIHRoZSBnaXZlbiBub2RlXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBXZSBkbyBub3QgZXZlbiBoYXZlIHRvIGV2YWx1YXRlIHRoZSBleHByZXNzaW9uXG5cdFx0XHRcdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0XHRcdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZWFkeShmYWxzZUJvb2xlYW4pO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXN1bHRTZXF1ZW5jZSA9IHN1YkV4cHJlc3Npb24uZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgZWJ2ID0gcmVzdWx0U2VxdWVuY2UudHJ5R2V0RWZmZWN0aXZlQm9vbGVhblZhbHVlKCk7XG5cdFx0XHRcdFx0XHRpZiAoIWVidi5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbm90UmVhZHkoZWJ2LnByb21pc2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKGVidi52YWx1ZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRcdFx0ZG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZWFkeShmYWxzZUJvb2xlYW4pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmVzdWx0U2VxdWVuY2UgPSBudWxsO1xuXHRcdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gcmVhZHkodHJ1ZUJvb2xlYW4pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0QnVja2V0ICgpIHtcblx0XHQvLyBBbnkgYnVja2V0IG9mIG91ciBzdWJleHByZXNzaW9ucyBzaG91bGQgZG8sIGFuZCBpcyBwcmVmZXJhYmxlIHRvIG5vIGJ1Y2tldFxuXHRcdGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5fc3ViRXhwcmVzc2lvbnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRsZXQgYnVja2V0ID0gdGhpcy5fc3ViRXhwcmVzc2lvbnNbaV0uZ2V0QnVja2V0KCk7XG5cdFx0XHRpZiAoYnVja2V0KSB7XG5cdFx0XHRcdHJldHVybiBidWNrZXQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBBbmRPcGVyYXRvcjtcbiJdfQ==