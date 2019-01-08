"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const iterators_1 = require("../util/iterators");
function createSiblingGenerator(domFacade, node) {
    return {
        next: () => {
            node = node && domFacade.getPreviousSibling(node);
            if (!node) {
                return iterators_1.DONE_TOKEN;
            }
            return iterators_1.ready(createNodeValue_1.default(node));
        }
    };
}
class PrecedingSiblingAxis extends Expression_1.default {
    constructor(siblingExpression) {
        super(siblingExpression.specificity, [siblingExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.REVERSE_SORTED,
            subtree: false,
            peer: true,
            canBeStaticallyEvaluated: false
        });
        this._siblingExpression = siblingExpression;
    }
    evaluate(dynamicContext, executionParameters) {
        const contextItem = dynamicContext.contextItem;
        if (contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
        }
        const domFacade = executionParameters.domFacade;
        return SequenceFactory_1.default.create(createSiblingGenerator(domFacade, contextItem.value)).filter(item => {
            return this._siblingExpression.evaluateToBoolean(dynamicContext, item);
        });
    }
}
exports.default = PrecedingSiblingAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJlY2VkaW5nU2libGluZ0F4aXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcmVjZWRpbmdTaWJsaW5nQXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxrRUFBMkQ7QUFDM0Qsa0VBQTJEO0FBQzNELGlEQUFzRDtBQUd0RCxTQUFTLHNCQUFzQixDQUFFLFNBQVMsRUFBRSxJQUFJO0lBQy9DLE9BQU87UUFDTixJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ1YsSUFBSSxHQUFHLElBQUksSUFBSSxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixPQUFPLHNCQUFVLENBQUM7YUFDbEI7WUFFRCxPQUFPLGlCQUFLLENBQUMseUJBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sb0JBQXFCLFNBQVEsb0JBQVU7SUFFNUMsWUFBWSxpQkFBeUM7UUFDcEQsS0FBSyxDQUNKLGlCQUFpQixDQUFDLFdBQVcsRUFDN0IsQ0FBQyxpQkFBaUIsQ0FBQyxFQUNuQjtZQUNDLFdBQVcsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDLGNBQWM7WUFDdkQsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUsSUFBSTtZQUNWLHdCQUF3QixFQUFFLEtBQUs7U0FDL0IsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO0lBRTdDLENBQUM7SUFFRCxRQUFRLENBQUUsY0FBYyxFQUFFLG1CQUFtQjtRQUM1QyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDO1FBQy9DLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7U0FDcEY7UUFFRCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUM7UUFDaEQsT0FBTyx5QkFBZSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxFQUFFO1lBQ2hHLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RSxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQUVELGtCQUFlLG9CQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cHJlc3Npb24gZnJvbSAnLi4vRXhwcmVzc2lvbic7XG5pbXBvcnQgU2VxdWVuY2VGYWN0b3J5IGZyb20gJy4uL2RhdGFUeXBlcy9TZXF1ZW5jZUZhY3RvcnknO1xuaW1wb3J0IGNyZWF0ZU5vZGVWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvY3JlYXRlTm9kZVZhbHVlJztcbmltcG9ydCB7IERPTkVfVE9LRU4sIHJlYWR5IH0gZnJvbSAnLi4vdXRpbC9pdGVyYXRvcnMnO1xuaW1wb3J0IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24gZnJvbSAnLi4vdGVzdHMvVGVzdEFic3RyYWN0RXhwcmVzc2lvbic7XG5cbmZ1bmN0aW9uIGNyZWF0ZVNpYmxpbmdHZW5lcmF0b3IgKGRvbUZhY2FkZSwgbm9kZSkge1xuXHRyZXR1cm4ge1xuXHRcdG5leHQ6ICgpID0+IHtcblx0XHRcdG5vZGUgPSBub2RlICYmIGRvbUZhY2FkZS5nZXRQcmV2aW91c1NpYmxpbmcobm9kZSk7XG5cdFx0XHRpZiAoIW5vZGUpIHtcblx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZWFkeShjcmVhdGVOb2RlVmFsdWUobm9kZSkpO1xuXHRcdH1cblx0fTtcbn1cblxuY2xhc3MgUHJlY2VkaW5nU2libGluZ0F4aXMgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0X3NpYmxpbmdFeHByZXNzaW9uOiBUZXN0QWJzdHJhY3RFeHByZXNzaW9uO1xuXHRjb25zdHJ1Y3RvcihzaWJsaW5nRXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbikge1xuXHRcdHN1cGVyKFxuXHRcdFx0c2libGluZ0V4cHJlc3Npb24uc3BlY2lmaWNpdHksXG5cdFx0XHRbc2libGluZ0V4cHJlc3Npb25dLFxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHRPcmRlcjogRXhwcmVzc2lvbi5SRVNVTFRfT1JERVJJTkdTLlJFVkVSU0VfU09SVEVELFxuXHRcdFx0XHRzdWJ0cmVlOiBmYWxzZSxcblx0XHRcdFx0cGVlcjogdHJ1ZSxcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBmYWxzZVxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLl9zaWJsaW5nRXhwcmVzc2lvbiA9IHNpYmxpbmdFeHByZXNzaW9uO1xuXG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRjb25zdCBjb250ZXh0SXRlbSA9IGR5bmFtaWNDb250ZXh0LmNvbnRleHRJdGVtO1xuXHRcdGlmIChjb250ZXh0SXRlbSA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUERZMDAwMjogY29udGV4dCBpcyBhYnNlbnQsIGl0IG5lZWRzIHRvIGJlIHByZXNlbnQgdG8gdXNlIGF4ZXMuJyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZG9tRmFjYWRlID0gZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGU7XG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoY3JlYXRlU2libGluZ0dlbmVyYXRvcihkb21GYWNhZGUsIGNvbnRleHRJdGVtLnZhbHVlKSkuZmlsdGVyKGl0ZW09PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc2libGluZ0V4cHJlc3Npb24uZXZhbHVhdGVUb0Jvb2xlYW4oZHluYW1pY0NvbnRleHQsIGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByZWNlZGluZ1NpYmxpbmdBeGlzO1xuIl19