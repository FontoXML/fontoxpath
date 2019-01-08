"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const iterators_1 = require("../util/iterators");
class Filter extends Expression_1.default {
    /**
     * @param  {Expression}    selector
     * @param  {Expression}    filterExpression
     */
    constructor(selector, filterExpression) {
        super(selector.specificity.add(filterExpression.specificity), [selector, filterExpression], {
            resultOrder: selector.expectedResultOrder,
            peer: selector.peer,
            subtree: selector.subtree,
            canBeStaticallyEvaluated: selector.canBeStaticallyEvaluated && filterExpression.canBeStaticallyEvaluated
        });
        this._selector = selector;
        this._filterExpression = filterExpression;
    }
    getBucket() {
        return this._selector.getBucket();
    }
    evaluate(dynamicContext, executionParameters) {
        /**
         * @type {!ISequence}
         */
        const valuesToFilter = this._selector.evaluateMaybeStatically(dynamicContext, executionParameters);
        if (this._filterExpression.canBeStaticallyEvaluated) {
            // Shortcut, if this is numeric, all the values are the same numeric value, same for booleans
            const result = this._filterExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
            if (result.isEmpty()) {
                return result;
            }
            const resultValue = result.first();
            if (isSubtypeOf_1.default(resultValue.type, 'xs:numeric')) {
                let requestedIndex = (resultValue.value);
                if (!Number.isInteger(requestedIndex)) {
                    // There are only values for integer positions
                    return SequenceFactory_1.default.empty();
                }
                const iterator = valuesToFilter.value;
                let done = false;
                // Note that using filter here is a bad choice, because we only want one item.
                // TODO: implement Sequence.itemAt(i), which is a no-op for empty sequences, a O(1) op for array backed sequence / singleton sequences and a O(n) for normal sequences.
                // If we move sorting to sequences, this will be even faster, since a select is faster than a sort.
                return SequenceFactory_1.default.create({
                    next: () => {
                        if (!done) {
                            for (let value = iterator.next(); !value.done; value = iterator.next()) {
                                if (!value.ready) {
                                    return value;
                                }
                                if (requestedIndex-- === 1) {
                                    done = true;
                                    return value;
                                }
                            }
                            done = true;
                        }
                        return iterators_1.DONE_TOKEN;
                    }
                });
            }
            // If all the items resolve to true, we can return all items, or none if vice versa
            // This can be gotten synchronously, because of the check for static evaluation
            if (result.getEffectiveBooleanValue()) {
                return valuesToFilter;
            }
            return SequenceFactory_1.default.empty();
        }
        const iteratorToFilter = valuesToFilter.value;
        let iteratorItem = null;
        let i = 0;
        let filterResultSequence = null;
        return SequenceFactory_1.default.create({
            next: () => {
                while (!iteratorItem || !iteratorItem.done) {
                    if (!iteratorItem) {
                        iteratorItem = iteratorToFilter.next();
                    }
                    if (iteratorItem.done) {
                        return iteratorItem;
                    }
                    if (!iteratorItem.ready) {
                        const itemToReturn = iteratorItem;
                        iteratorItem = null;
                        return itemToReturn;
                    }
                    if (!filterResultSequence) {
                        filterResultSequence = this._filterExpression.evaluateMaybeStatically(dynamicContext.scopeWithFocus(i, /** @type {!Value} */ (iteratorItem.value), valuesToFilter), executionParameters);
                    }
                    const first = filterResultSequence.tryGetFirst();
                    if (!first.ready) {
                        return iterators_1.notReady(first.promise);
                    }
                    let shouldReturnCurrentValue;
                    if (first.value === null) {
                        // Actually empty, very falsy indeed
                        // Continue to next
                        shouldReturnCurrentValue = false;
                    }
                    else if (isSubtypeOf_1.default(first.value.type, 'xs:numeric')) {
                        // Remember: XPath is one-based
                        shouldReturnCurrentValue = first.value.value === i + 1;
                    }
                    else {
                        const ebv = filterResultSequence.tryGetEffectiveBooleanValue();
                        if (!ebv.ready) {
                            return iterators_1.notReady(ebv.promise);
                        }
                        shouldReturnCurrentValue = ebv.value;
                    }
                    // Prepare awaiting the next one
                    filterResultSequence = null;
                    const returnableValue = iteratorItem.value;
                    iteratorItem = null;
                    i++;
                    if (shouldReturnCurrentValue) {
                        return iterators_1.ready(returnableValue);
                    }
                    // Continue to the next one
                }
                return iteratorItem;
            }
        });
    }
}
exports.default = Filter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXVDO0FBQ3ZDLDBEQUFtRDtBQUNuRCxrRUFBMkQ7QUFDM0QsaURBQWdFO0FBR2hFLE1BQU0sTUFBTyxTQUFRLG9CQUFVO0lBSTlCOzs7T0FHRztJQUNILFlBQWEsUUFBb0IsRUFBRSxnQkFBNEI7UUFDOUQsS0FBSyxDQUNKLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxFQUN0RCxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxFQUM1QjtZQUNDLFdBQVcsRUFBRSxRQUFRLENBQUMsbUJBQW1CO1lBQ3pDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtZQUNuQixPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87WUFDekIsd0JBQXdCLEVBQUUsUUFBUSxDQUFDLHdCQUF3QixJQUFJLGdCQUFnQixDQUFDLHdCQUF3QjtTQUN4RyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7SUFDM0MsQ0FBQztJQUVELFNBQVM7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELFFBQVEsQ0FBRSxjQUFjLEVBQUUsbUJBQW1CO1FBQzVDOztXQUVHO1FBQ0gsTUFBTSxjQUFjLEdBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUU5RyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsRUFBRTtZQUNwRCw2RkFBNkY7WUFDN0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FB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eHByZXNzaW9uJztcbmltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuLi9kYXRhVHlwZXMvaXNTdWJ0eXBlT2YnO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCB7IERPTkVfVE9LRU4sIHJlYWR5LCBub3RSZWFkeSB9IGZyb20gJy4uL3V0aWwvaXRlcmF0b3JzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvVmFsdWUnO1xuXG5jbGFzcyBGaWx0ZXIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0X2ZpbHRlckV4cHJlc3Npb246IEV4cHJlc3Npb247XG5cdF9zZWxlY3RvcjogRXhwcmVzc2lvbjtcblx0XG5cdC8qKlxuXHQgKiBAcGFyYW0gIHtFeHByZXNzaW9ufSAgICBzZWxlY3RvclxuXHQgKiBAcGFyYW0gIHtFeHByZXNzaW9ufSAgICBmaWx0ZXJFeHByZXNzaW9uXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAoc2VsZWN0b3I6IEV4cHJlc3Npb24sIGZpbHRlckV4cHJlc3Npb246IEV4cHJlc3Npb24pIHtcblx0XHRzdXBlcihcblx0XHRcdHNlbGVjdG9yLnNwZWNpZmljaXR5LmFkZChmaWx0ZXJFeHByZXNzaW9uLnNwZWNpZmljaXR5KSxcblx0XHRcdFtzZWxlY3RvciwgZmlsdGVyRXhwcmVzc2lvbl0sXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdE9yZGVyOiBzZWxlY3Rvci5leHBlY3RlZFJlc3VsdE9yZGVyLFxuXHRcdFx0XHRwZWVyOiBzZWxlY3Rvci5wZWVyLFxuXHRcdFx0XHRzdWJ0cmVlOiBzZWxlY3Rvci5zdWJ0cmVlLFxuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IHNlbGVjdG9yLmNhbkJlU3RhdGljYWxseUV2YWx1YXRlZCAmJiBmaWx0ZXJFeHByZXNzaW9uLmNhbkJlU3RhdGljYWxseUV2YWx1YXRlZFxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHRcdHRoaXMuX2ZpbHRlckV4cHJlc3Npb24gPSBmaWx0ZXJFeHByZXNzaW9uO1xuXHR9XG5cblx0Z2V0QnVja2V0ICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2VsZWN0b3IuZ2V0QnVja2V0KCk7XG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHQvKipcblx0XHQgKiBAdHlwZSB7IUlTZXF1ZW5jZX1cblx0XHQgKi9cblx0XHRjb25zdCB2YWx1ZXNUb0ZpbHRlcjogSVNlcXVlbmNlID0gdGhpcy5fc2VsZWN0b3IuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXG5cdFx0aWYgKHRoaXMuX2ZpbHRlckV4cHJlc3Npb24uY2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkKSB7XG5cdFx0XHQvLyBTaG9ydGN1dCwgaWYgdGhpcyBpcyBudW1lcmljLCBhbGwgdGhlIHZhbHVlcyBhcmUgdGhlIHNhbWUgbnVtZXJpYyB2YWx1ZSwgc2FtZSBmb3IgYm9vbGVhbnNcblx0XHRcdGNvbnN0IHJlc3VsdCA9IHRoaXMuX2ZpbHRlckV4cHJlc3Npb24uZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0aWYgKHJlc3VsdC5pc0VtcHR5KCkpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcmVzdWx0VmFsdWUgPSByZXN1bHQuZmlyc3QoKTtcblx0XHRcdGlmIChpc1N1YnR5cGVPZihyZXN1bHRWYWx1ZS50eXBlLCAneHM6bnVtZXJpYycpKSB7XG5cdFx0XHRcdGxldCByZXF1ZXN0ZWRJbmRleDogbnVtYmVyID0gLyoqIEB0eXBlIHtudW1iZXJ9ICovIChyZXN1bHRWYWx1ZS52YWx1ZSk7XG5cdFx0XHRcdGlmICghTnVtYmVyLmlzSW50ZWdlcihyZXF1ZXN0ZWRJbmRleCkpIHtcblx0XHRcdFx0XHQvLyBUaGVyZSBhcmUgb25seSB2YWx1ZXMgZm9yIGludGVnZXIgcG9zaXRpb25zXG5cdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5lbXB0eSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGl0ZXJhdG9yID0gdmFsdWVzVG9GaWx0ZXIudmFsdWU7XG5cdFx0XHRcdGxldCBkb25lID0gZmFsc2U7XG5cdFx0XHRcdC8vIE5vdGUgdGhhdCB1c2luZyBmaWx0ZXIgaGVyZSBpcyBhIGJhZCBjaG9pY2UsIGJlY2F1c2Ugd2Ugb25seSB3YW50IG9uZSBpdGVtLlxuXHRcdFx0XHQvLyBUT0RPOiBpbXBsZW1lbnQgU2VxdWVuY2UuaXRlbUF0KGkpLCB3aGljaCBpcyBhIG5vLW9wIGZvciBlbXB0eSBzZXF1ZW5jZXMsIGEgTygxKSBvcCBmb3IgYXJyYXkgYmFja2VkIHNlcXVlbmNlIC8gc2luZ2xldG9uIHNlcXVlbmNlcyBhbmQgYSBPKG4pIGZvciBub3JtYWwgc2VxdWVuY2VzLlxuXHRcdFx0XHQvLyBJZiB3ZSBtb3ZlIHNvcnRpbmcgdG8gc2VxdWVuY2VzLCB0aGlzIHdpbGwgYmUgZXZlbiBmYXN0ZXIsIHNpbmNlIGEgc2VsZWN0IGlzIGZhc3RlciB0aGFuIGEgc29ydC5cblx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoe1xuXHRcdFx0XHRcdG5leHQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdGlmICghZG9uZSkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCB2YWx1ZSA9IGl0ZXJhdG9yLm5leHQoKTsgIXZhbHVlLmRvbmU7IHZhbHVlID0gaXRlcmF0b3IubmV4dCgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCF2YWx1ZS5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRpZiAocmVxdWVzdGVkSW5kZXgtLSA9PT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGRvbmUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdC8vIElmIGFsbCB0aGUgaXRlbXMgcmVzb2x2ZSB0byB0cnVlLCB3ZSBjYW4gcmV0dXJuIGFsbCBpdGVtcywgb3Igbm9uZSBpZiB2aWNlIHZlcnNhXG5cdFx0XHQvLyBUaGlzIGNhbiBiZSBnb3R0ZW4gc3luY2hyb25vdXNseSwgYmVjYXVzZSBvZiB0aGUgY2hlY2sgZm9yIHN0YXRpYyBldmFsdWF0aW9uXG5cdFx0XHRpZiAocmVzdWx0LmdldEVmZmVjdGl2ZUJvb2xlYW5WYWx1ZSgpKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZXNUb0ZpbHRlcjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0XHR9XG5cblx0XHRjb25zdCBpdGVyYXRvclRvRmlsdGVyID0gdmFsdWVzVG9GaWx0ZXIudmFsdWU7XG5cdFx0bGV0IGl0ZXJhdG9ySXRlbSA9IG51bGw7XG5cdFx0bGV0IGkgPSAwO1xuXHRcdGxldCBmaWx0ZXJSZXN1bHRTZXF1ZW5jZSA9IG51bGw7XG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoe1xuXHRcdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0XHR3aGlsZSAoIWl0ZXJhdG9ySXRlbSB8fCAhaXRlcmF0b3JJdGVtLmRvbmUpIHtcblx0XHRcdFx0XHRpZiAoIWl0ZXJhdG9ySXRlbSkge1xuXHRcdFx0XHRcdFx0aXRlcmF0b3JJdGVtID0gaXRlcmF0b3JUb0ZpbHRlci5uZXh0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpdGVyYXRvckl0ZW0uZG9uZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGl0ZXJhdG9ySXRlbTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKCFpdGVyYXRvckl0ZW0ucmVhZHkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGl0ZW1Ub1JldHVybiA9IGl0ZXJhdG9ySXRlbTtcblx0XHRcdFx0XHRcdGl0ZXJhdG9ySXRlbSA9IG51bGw7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaXRlbVRvUmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIWZpbHRlclJlc3VsdFNlcXVlbmNlKSB7XG5cdFx0XHRcdFx0XHRmaWx0ZXJSZXN1bHRTZXF1ZW5jZSA9IHRoaXMuX2ZpbHRlckV4cHJlc3Npb24uZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoXG5cdFx0XHRcdFx0XHRcdGR5bmFtaWNDb250ZXh0LnNjb3BlV2l0aEZvY3VzKGksIC8qKiBAdHlwZSB7IVZhbHVlfSAqLyhpdGVyYXRvckl0ZW0udmFsdWUpLCB2YWx1ZXNUb0ZpbHRlciksXG5cdFx0XHRcdFx0XHRcdGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGZpcnN0ID0gZmlsdGVyUmVzdWx0U2VxdWVuY2UudHJ5R2V0Rmlyc3QoKTtcblx0XHRcdFx0XHRpZiAoIWZpcnN0LnJlYWR5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbm90UmVhZHkoZmlyc3QucHJvbWlzZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxldCBzaG91bGRSZXR1cm5DdXJyZW50VmFsdWU7XG5cdFx0XHRcdFx0aWYgKGZpcnN0LnZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHQvLyBBY3R1YWxseSBlbXB0eSwgdmVyeSBmYWxzeSBpbmRlZWRcblx0XHRcdFx0XHRcdC8vIENvbnRpbnVlIHRvIG5leHRcblx0XHRcdFx0XHRcdHNob3VsZFJldHVybkN1cnJlbnRWYWx1ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChpc1N1YnR5cGVPZihmaXJzdC52YWx1ZS50eXBlLCAneHM6bnVtZXJpYycpKSB7XG5cdFx0XHRcdFx0XHQvLyBSZW1lbWJlcjogWFBhdGggaXMgb25lLWJhc2VkXG5cdFx0XHRcdFx0XHRzaG91bGRSZXR1cm5DdXJyZW50VmFsdWUgPSBmaXJzdC52YWx1ZS52YWx1ZSA9PT0gaSArIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgZWJ2ID0gZmlsdGVyUmVzdWx0U2VxdWVuY2UudHJ5R2V0RWZmZWN0aXZlQm9vbGVhblZhbHVlKCk7XG5cdFx0XHRcdFx0XHRpZiAoIWVidi5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbm90UmVhZHkoZWJ2LnByb21pc2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2hvdWxkUmV0dXJuQ3VycmVudFZhbHVlID0gZWJ2LnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBQcmVwYXJlIGF3YWl0aW5nIHRoZSBuZXh0IG9uZVxuXHRcdFx0XHRcdGZpbHRlclJlc3VsdFNlcXVlbmNlID0gbnVsbDtcblx0XHRcdFx0XHRjb25zdCByZXR1cm5hYmxlVmFsdWUgPSBpdGVyYXRvckl0ZW0udmFsdWU7XG5cdFx0XHRcdFx0aXRlcmF0b3JJdGVtID0gbnVsbDtcblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0aWYgKHNob3VsZFJldHVybkN1cnJlbnRWYWx1ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlYWR5KHJldHVybmFibGVWYWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIENvbnRpbnVlIHRvIHRoZSBuZXh0IG9uZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGl0ZXJhdG9ySXRlbTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXI7XG4iXX0=