"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const createSingleValueIterator_1 = require("../util/createSingleValueIterator");
const iterators_1 = require("../util/iterators");
const createChildGenerator_1 = require("../util/createChildGenerator");
function createInclusiveDescendantGenerator(domFacade, node) {
    const descendantIteratorStack = [createSingleValueIterator_1.default(node)];
    return {
        next: () => {
            if (!descendantIteratorStack.length) {
                return iterators_1.DONE_TOKEN;
            }
            let value = descendantIteratorStack[0].next();
            while (value.done) {
                descendantIteratorStack.shift();
                if (!descendantIteratorStack.length) {
                    return iterators_1.DONE_TOKEN;
                }
                value = descendantIteratorStack[0].next();
            }
            // Iterator over these children next
            descendantIteratorStack.unshift(createChildGenerator_1.default(domFacade, value.value));
            return iterators_1.ready(createNodeValue_1.default(value.value));
        }
    };
}
class DescendantAxis extends Expression_1.default {
    constructor(descendantExpression, options) {
        options = options || { inclusive: false };
        super(descendantExpression.specificity, [descendantExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.SORTED,
            subtree: true,
            peer: false,
            canBeStaticallyEvaluated: false
        });
        this._descendantExpression = descendantExpression;
        this._isInclusive = !!options.inclusive;
    }
    evaluate(dynamicContext, executionParameters) {
        if (dynamicContext.contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
        }
        const inclusive = this._isInclusive;
        const iterator = createInclusiveDescendantGenerator(executionParameters.domFacade, dynamicContext.contextItem.value);
        if (!inclusive) {
            iterator.next();
        }
        const descendantSequence = SequenceFactory_1.default.create(iterator);
        return descendantSequence.filter(item => {
            return this._descendantExpression.evaluateToBoolean(dynamicContext, item);
        });
    }
}
exports.default = DescendantAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVzY2VuZGFudEF4aXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEZXNjZW5kYW50QXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxrRUFBMkQ7QUFDM0Qsa0VBQTJEO0FBQzNELGlGQUEwRTtBQUMxRSxpREFBc0Q7QUFDdEQsdUVBQWdFO0FBR2hFLFNBQVMsa0NBQWtDLENBQUUsU0FBUyxFQUFFLElBQUk7SUFDM0QsTUFBTSx1QkFBdUIsR0FBMEIsQ0FBQyxtQ0FBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLE9BQU87UUFDTixJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRTtnQkFDcEMsT0FBTyxzQkFBVSxDQUFDO2FBQ2xCO1lBQ0QsSUFBSSxLQUFLLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsT0FBTyxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUNsQix1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRTtvQkFDcEMsT0FBTyxzQkFBVSxDQUFDO2lCQUNsQjtnQkFDRCxLQUFLLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDMUM7WUFDRCxvQ0FBb0M7WUFDcEMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLDhCQUFvQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM5RSxPQUFPLGlCQUFLLENBQUMseUJBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLGNBQWUsU0FBUSxvQkFBVTtJQUd0QyxZQUFZLG9CQUE0QyxFQUFFLE9BQTRDO1FBQ3JHLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDMUMsS0FBSyxDQUNKLG9CQUFvQixDQUFDLFdBQVcsRUFDaEMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUN0QjtZQUNDLFdBQVcsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDLE1BQU07WUFDL0MsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsS0FBSztZQUNYLHdCQUF3QixFQUFFLEtBQUs7U0FDL0IsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO1FBQ2xELElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFFekMsQ0FBQztJQUVELFFBQVEsQ0FBRSxjQUFjLEVBQUUsbUJBQW1CO1FBQzVDLElBQUksY0FBYyxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUU7WUFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNwQyxNQUFNLFFBQVEsR0FBRyxrQ0FBa0MsQ0FDbEQsbUJBQW1CLENBQUMsU0FBUyxFQUM3QixjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDaEI7UUFDRCxNQUFNLGtCQUFrQixHQUFHLHlCQUFlLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELE9BQU8sa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQUNELGtCQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBjcmVhdGVOb2RlVmFsdWUgZnJvbSAnLi4vZGF0YVR5cGVzL2NyZWF0ZU5vZGVWYWx1ZSc7XG5pbXBvcnQgY3JlYXRlU2luZ2xlVmFsdWVJdGVyYXRvciBmcm9tICcuLi91dGlsL2NyZWF0ZVNpbmdsZVZhbHVlSXRlcmF0b3InO1xuaW1wb3J0IHsgRE9ORV9UT0tFTiwgcmVhZHkgfSBmcm9tICcuLi91dGlsL2l0ZXJhdG9ycyc7XG5pbXBvcnQgY3JlYXRlQ2hpbGRHZW5lcmF0b3IgZnJvbSAnLi4vdXRpbC9jcmVhdGVDaGlsZEdlbmVyYXRvcic7XG5pbXBvcnQgVGVzdEFic3RyYWN0RXhwcmVzc2lvbiBmcm9tICcuLi90ZXN0cy9UZXN0QWJzdHJhY3RFeHByZXNzaW9uJztcblxuZnVuY3Rpb24gY3JlYXRlSW5jbHVzaXZlRGVzY2VuZGFudEdlbmVyYXRvciAoZG9tRmFjYWRlLCBub2RlKSB7XG5cdGNvbnN0IGRlc2NlbmRhbnRJdGVyYXRvclN0YWNrOiBBcnJheTxJdGVyYXRvcjxOb2RlPj4gPSBbY3JlYXRlU2luZ2xlVmFsdWVJdGVyYXRvcihub2RlKV07XG5cdHJldHVybiB7XG5cdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0aWYgKCFkZXNjZW5kYW50SXRlcmF0b3JTdGFjay5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHR9XG5cdFx0XHRsZXQgdmFsdWUgPSBkZXNjZW5kYW50SXRlcmF0b3JTdGFja1swXS5uZXh0KCk7XG5cdFx0XHR3aGlsZSAodmFsdWUuZG9uZSkge1xuXHRcdFx0XHRkZXNjZW5kYW50SXRlcmF0b3JTdGFjay5zaGlmdCgpO1xuXHRcdFx0XHRpZiAoIWRlc2NlbmRhbnRJdGVyYXRvclN0YWNrLmxlbmd0aCkge1xuXHRcdFx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhbHVlID0gZGVzY2VuZGFudEl0ZXJhdG9yU3RhY2tbMF0ubmV4dCgpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gSXRlcmF0b3Igb3ZlciB0aGVzZSBjaGlsZHJlbiBuZXh0XG5cdFx0XHRkZXNjZW5kYW50SXRlcmF0b3JTdGFjay51bnNoaWZ0KGNyZWF0ZUNoaWxkR2VuZXJhdG9yKGRvbUZhY2FkZSwgdmFsdWUudmFsdWUpKTtcblx0XHRcdHJldHVybiByZWFkeShjcmVhdGVOb2RlVmFsdWUodmFsdWUudmFsdWUpKTtcblx0XHR9XG5cdH07XG59XG5cbmNsYXNzIERlc2NlbmRhbnRBeGlzIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdF9kZXNjZW5kYW50RXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbjtcblx0X2lzSW5jbHVzaXZlOiBib29sZWFuO1xuXHRjb25zdHJ1Y3RvcihkZXNjZW5kYW50RXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbiwgb3B0aW9uczogeyBpbmNsdXNpdmU6IGJvb2xlYW47IH0gfCB1bmRlZmluZWQpIHtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7IGluY2x1c2l2ZTogZmFsc2UgfTtcblx0XHRzdXBlcihcblx0XHRcdGRlc2NlbmRhbnRFeHByZXNzaW9uLnNwZWNpZmljaXR5LFxuXHRcdFx0W2Rlc2NlbmRhbnRFeHByZXNzaW9uXSxcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0T3JkZXI6IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5TT1JURUQsXG5cdFx0XHRcdHN1YnRyZWU6IHRydWUsXG5cdFx0XHRcdHBlZXI6IGZhbHNlLFxuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuX2Rlc2NlbmRhbnRFeHByZXNzaW9uID0gZGVzY2VuZGFudEV4cHJlc3Npb247XG5cdFx0dGhpcy5faXNJbmNsdXNpdmUgPSAhIW9wdGlvbnMuaW5jbHVzaXZlO1xuXG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRpZiAoZHluYW1pY0NvbnRleHQuY29udGV4dEl0ZW0gPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignWFBEWTAwMDI6IGNvbnRleHQgaXMgYWJzZW50LCBpdCBuZWVkcyB0byBiZSBwcmVzZW50IHRvIHVzZSBheGVzLicpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGluY2x1c2l2ZSA9IHRoaXMuX2lzSW5jbHVzaXZlO1xuXHRcdGNvbnN0IGl0ZXJhdG9yID0gY3JlYXRlSW5jbHVzaXZlRGVzY2VuZGFudEdlbmVyYXRvcihcblx0XHRcdGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLFxuXHRcdFx0ZHluYW1pY0NvbnRleHQuY29udGV4dEl0ZW0udmFsdWUpO1xuXHRcdGlmICghaW5jbHVzaXZlKSB7XG5cdFx0XHRpdGVyYXRvci5uZXh0KCk7XG5cdFx0fVxuXHRcdGNvbnN0IGRlc2NlbmRhbnRTZXF1ZW5jZSA9IFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoaXRlcmF0b3IpO1xuXHRcdHJldHVybiBkZXNjZW5kYW50U2VxdWVuY2UuZmlsdGVyKGl0ZW0gPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2Rlc2NlbmRhbnRFeHByZXNzaW9uLmV2YWx1YXRlVG9Cb29sZWFuKGR5bmFtaWNDb250ZXh0LCBpdGVtKTtcblx0XHR9KTtcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgRGVzY2VuZGFudEF4aXM7XG4iXX0=