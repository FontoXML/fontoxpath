"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const Specificity_1 = require("../Specificity");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
/**
 * @extends {Expression}
 */
class SimpleMapOperator extends Expression_1.default {
    /**
     * Simple Map operator
     * The simple map operator will evaluate expressions given in expression1 and use the results as context for
     * evaluating all expressions in expression2. Returns a sequence with results from the evaluation of expression2.
     * Order is undefined.
     *
     * @param  {!Expression}  expression1
     * @param  {!Expression}  expression2
     */
    constructor(expression1, expression2) {
        super(new Specificity_1.default({}).add(expression1.specificity), [expression1, expression2], {
            canBeStaticallyEvaluated: expression1.canBeStaticallyEvaluated && expression2.canBeStaticallyEvaluated
        });
        this._expression1 = expression1;
        this._expression2 = expression2;
    }
    evaluate(dynamicContext, executionParameters) {
        const sequence = this._expression1.evaluateMaybeStatically(dynamicContext, executionParameters);
        const childContextIterator = dynamicContext.createSequenceIterator(sequence);
        let childContext = null;
        let sequenceValueIterator = null;
        let done = false;
        return SequenceFactory_1.default.create({
            next: () => {
                while (!done) {
                    if (!childContext) {
                        childContext = childContextIterator.next();
                        if (childContext.done) {
                            done = true;
                            return childContext;
                        }
                        if (!childContext.ready) {
                            const returnableValue = childContext;
                            childContext = null;
                            return returnableValue;
                        }
                    }
                    // Now that we have moved an item in the input, start generating mapped items
                    if (!sequenceValueIterator) {
                        sequenceValueIterator = this._expression2.evaluateMaybeStatically(/** @type {!DynamicContext} */ (childContext.value), executionParameters);
                    }
                    const value = sequenceValueIterator.value.next();
                    if (value.done) {
                        sequenceValueIterator = null;
                        // Move to next
                        childContext = null;
                        continue;
                    }
                    return value;
                }
            }
        });
    }
}
exports.default = SimpleMapOperator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2ltcGxlTWFwT3BlcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTaW1wbGVNYXBPcGVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxnREFBeUM7QUFDekMsa0VBQTJEO0FBRzNEOztHQUVHO0FBQ0gsTUFBTSxpQkFBa0IsU0FBUSxvQkFBVTtJQUN6Qzs7Ozs7Ozs7T0FRRztJQUNILFlBQWEsV0FBVyxFQUFFLFdBQVc7UUFDcEMsS0FBSyxDQUNKLElBQUkscUJBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUNoRCxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFDMUI7WUFDQyx3QkFBd0IsRUFBRSxXQUFXLENBQUMsd0JBQXdCLElBQUksV0FBVyxDQUFDLHdCQUF3QjtTQUN0RyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBRUQsUUFBUSxDQUFFLGNBQWMsRUFBRSxtQkFBbUI7UUFDNUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUNoRyxNQUFNLG9CQUFvQixHQUFHLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3RSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFDakMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLE9BQU8seUJBQWUsQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsSUFBSSxFQUFFO29CQUNiLElBQUksQ0FBQyxZQUFZLEVBQUU7d0JBQ2xCLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0MsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFOzRCQUN0QixJQUFJLEdBQUcsSUFBSSxDQUFDOzRCQUNaLE9BQU8sWUFBWSxDQUFDO3lCQUNwQjt3QkFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTs0QkFDeEIsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDOzRCQUNyQyxZQUFZLEdBQUcsSUFBSSxDQUFDOzRCQUNwQixPQUFPLGVBQWUsQ0FBQzt5QkFDdkI7cUJBRUQ7b0JBRUQsNkVBQTZFO29CQUM3RSxJQUFJLENBQUMscUJBQXFCLEVBQUU7d0JBQzNCLHFCQUFxQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsdUJBQXVCLENBQUMsOEJBQThCLENBQUEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztxQkFDM0k7b0JBQ0QsTUFBTSxLQUFLLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7d0JBQ2YscUJBQXFCLEdBQUcsSUFBSSxDQUFDO3dCQUM3QixlQUFlO3dCQUNmLFlBQVksR0FBRyxJQUFJLENBQUM7d0JBQ3BCLFNBQVM7cUJBQ1Q7b0JBQ0QsT0FBTyxLQUFLLENBQUM7aUJBQ2I7WUFDRixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBRUQsa0JBQWUsaUJBQWlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi9FeHByZXNzaW9uJztcbmltcG9ydCBTcGVjaWZpY2l0eSBmcm9tICcuLi9TcGVjaWZpY2l0eSc7XG5pbXBvcnQgU2VxdWVuY2VGYWN0b3J5IGZyb20gJy4uL2RhdGFUeXBlcy9TZXF1ZW5jZUZhY3RvcnknO1xuaW1wb3J0IER5bmFtaWNDb250ZXh0IGZyb20gJy4uL0R5bmFtaWNDb250ZXh0JztcblxuLyoqXG4gKiBAZXh0ZW5kcyB7RXhwcmVzc2lvbn1cbiAqL1xuY2xhc3MgU2ltcGxlTWFwT3BlcmF0b3IgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0LyoqXG5cdCAqIFNpbXBsZSBNYXAgb3BlcmF0b3Jcblx0ICogVGhlIHNpbXBsZSBtYXAgb3BlcmF0b3Igd2lsbCBldmFsdWF0ZSBleHByZXNzaW9ucyBnaXZlbiBpbiBleHByZXNzaW9uMSBhbmQgdXNlIHRoZSByZXN1bHRzIGFzIGNvbnRleHQgZm9yXG5cdCAqIGV2YWx1YXRpbmcgYWxsIGV4cHJlc3Npb25zIGluIGV4cHJlc3Npb24yLiBSZXR1cm5zIGEgc2VxdWVuY2Ugd2l0aCByZXN1bHRzIGZyb20gdGhlIGV2YWx1YXRpb24gb2YgZXhwcmVzc2lvbjIuXG5cdCAqIE9yZGVyIGlzIHVuZGVmaW5lZC5cblx0ICpcblx0ICogQHBhcmFtICB7IUV4cHJlc3Npb259ICBleHByZXNzaW9uMVxuXHQgKiBAcGFyYW0gIHshRXhwcmVzc2lvbn0gIGV4cHJlc3Npb24yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAoZXhwcmVzc2lvbjEsIGV4cHJlc3Npb24yKSB7XG5cdFx0c3VwZXIoXG5cdFx0XHRuZXcgU3BlY2lmaWNpdHkoe30pLmFkZChleHByZXNzaW9uMS5zcGVjaWZpY2l0eSksXG5cdFx0XHRbZXhwcmVzc2lvbjEsIGV4cHJlc3Npb24yXSxcblx0XHRcdHtcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBleHByZXNzaW9uMS5jYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQgJiYgZXhwcmVzc2lvbjIuY2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuX2V4cHJlc3Npb24xID0gZXhwcmVzc2lvbjE7XG5cdFx0dGhpcy5fZXhwcmVzc2lvbjIgPSBleHByZXNzaW9uMjtcblx0fVxuXG5cdGV2YWx1YXRlIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykge1xuXHRcdGNvbnN0IHNlcXVlbmNlID0gdGhpcy5fZXhwcmVzc2lvbjEuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHRcdGNvbnN0IGNoaWxkQ29udGV4dEl0ZXJhdG9yID0gZHluYW1pY0NvbnRleHQuY3JlYXRlU2VxdWVuY2VJdGVyYXRvcihzZXF1ZW5jZSk7XG5cdFx0bGV0IGNoaWxkQ29udGV4dCA9IG51bGw7XG5cdFx0bGV0IHNlcXVlbmNlVmFsdWVJdGVyYXRvciA9IG51bGw7XG5cdFx0bGV0IGRvbmUgPSBmYWxzZTtcblx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZSh7XG5cdFx0XHRuZXh0OiAoKSA9PiB7XG5cdFx0XHRcdHdoaWxlICghZG9uZSkge1xuXHRcdFx0XHRcdGlmICghY2hpbGRDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRjaGlsZENvbnRleHQgPSBjaGlsZENvbnRleHRJdGVyYXRvci5uZXh0KCk7XG5cdFx0XHRcdFx0XHRpZiAoY2hpbGRDb250ZXh0LmRvbmUpIHtcblx0XHRcdFx0XHRcdFx0ZG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBjaGlsZENvbnRleHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoIWNoaWxkQ29udGV4dC5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCByZXR1cm5hYmxlVmFsdWUgPSBjaGlsZENvbnRleHQ7XG5cdFx0XHRcdFx0XHRcdGNoaWxkQ29udGV4dCA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXR1cm5hYmxlVmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBOb3cgdGhhdCB3ZSBoYXZlIG1vdmVkIGFuIGl0ZW0gaW4gdGhlIGlucHV0LCBzdGFydCBnZW5lcmF0aW5nIG1hcHBlZCBpdGVtc1xuXHRcdFx0XHRcdGlmICghc2VxdWVuY2VWYWx1ZUl0ZXJhdG9yKSB7XG5cdFx0XHRcdFx0XHRzZXF1ZW5jZVZhbHVlSXRlcmF0b3IgPSB0aGlzLl9leHByZXNzaW9uMi5ldmFsdWF0ZU1heWJlU3RhdGljYWxseSgvKiogQHR5cGUgeyFEeW5hbWljQ29udGV4dH0gKi8oY2hpbGRDb250ZXh0LnZhbHVlKSwgZXhlY3V0aW9uUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gc2VxdWVuY2VWYWx1ZUl0ZXJhdG9yLnZhbHVlLm5leHQoKTtcblx0XHRcdFx0XHRpZiAodmFsdWUuZG9uZSkge1xuXHRcdFx0XHRcdFx0c2VxdWVuY2VWYWx1ZUl0ZXJhdG9yID0gbnVsbDtcblx0XHRcdFx0XHRcdC8vIE1vdmUgdG8gbmV4dFxuXHRcdFx0XHRcdFx0Y2hpbGRDb250ZXh0ID0gbnVsbDtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaW1wbGVNYXBPcGVyYXRvcjtcbiJdfQ==