"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const iterators_1 = require("../util/iterators");
function createSiblingGenerator(domFacade, node) {
    return {
        next: () => {
            node = node && domFacade.getNextSibling(node);
            if (!node) {
                return iterators_1.DONE_TOKEN;
            }
            return iterators_1.ready(createNodeValue_1.default(node));
        }
    };
}
class FollowingSiblingAxis extends Expression_1.default {
    constructor(siblingExpression) {
        super(siblingExpression.specificity, [siblingExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.SORTED,
            peer: true,
            subtree: false,
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
exports.default = FollowingSiblingAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9sbG93aW5nU2libGluZ0F4aXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGb2xsb3dpbmdTaWJsaW5nQXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxrRUFBMkQ7QUFDM0Qsa0VBQTJEO0FBQzNELGlEQUFzRDtBQUd0RCxTQUFTLHNCQUFzQixDQUFFLFNBQVMsRUFBRSxJQUFJO0lBQy9DLE9BQU87UUFDTixJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ1YsSUFBSSxHQUFHLElBQUksSUFBSSxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsT0FBTyxzQkFBVSxDQUFDO2FBQ2xCO1lBRUQsT0FBTyxpQkFBSyxDQUFDLHlCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLG9CQUFxQixTQUFRLG9CQUFVO0lBRTVDLFlBQVksaUJBQXlDO1FBQ3BELEtBQUssQ0FDSixpQkFBaUIsQ0FBQyxXQUFXLEVBQzdCLENBQUMsaUJBQWlCLENBQUMsRUFDbkI7WUFDQyxXQUFXLEVBQUUsb0JBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNO1lBQy9DLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLEtBQUs7WUFDZCx3QkFBd0IsRUFBRSxLQUFLO1NBQy9CLENBQUMsQ0FBQztRQUVKLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztJQUM3QyxDQUFDO0lBRUQsUUFBUSxDQUFFLGNBQWMsRUFBRSxtQkFBbUI7UUFDNUMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQztRQUMvQyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDO1FBRWhELE9BQU8seUJBQWUsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqRyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFFRCxrQkFBZSxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBjcmVhdGVOb2RlVmFsdWUgZnJvbSAnLi4vZGF0YVR5cGVzL2NyZWF0ZU5vZGVWYWx1ZSc7XG5pbXBvcnQgeyBET05FX1RPS0VOLCByZWFkeSB9IGZyb20gJy4uL3V0aWwvaXRlcmF0b3JzJztcbmltcG9ydCBUZXN0QWJzdHJhY3RFeHByZXNzaW9uIGZyb20gJy4uL3Rlc3RzL1Rlc3RBYnN0cmFjdEV4cHJlc3Npb24nO1xuXG5mdW5jdGlvbiBjcmVhdGVTaWJsaW5nR2VuZXJhdG9yIChkb21GYWNhZGUsIG5vZGUpIHtcblx0cmV0dXJuIHtcblx0XHRuZXh0OiAoKSA9PiB7XG5cdFx0XHRub2RlID0gbm9kZSAmJiBkb21GYWNhZGUuZ2V0TmV4dFNpYmxpbmcobm9kZSk7XG5cdFx0XHRpZiAoIW5vZGUpIHtcblx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZWFkeShjcmVhdGVOb2RlVmFsdWUobm9kZSkpO1xuXHRcdH1cblx0fTtcbn1cblxuY2xhc3MgRm9sbG93aW5nU2libGluZ0F4aXMgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0X3NpYmxpbmdFeHByZXNzaW9uOiBUZXN0QWJzdHJhY3RFeHByZXNzaW9uO1xuXHRjb25zdHJ1Y3RvcihzaWJsaW5nRXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbikge1xuXHRcdHN1cGVyKFxuXHRcdFx0c2libGluZ0V4cHJlc3Npb24uc3BlY2lmaWNpdHksXG5cdFx0XHRbc2libGluZ0V4cHJlc3Npb25dLFxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHRPcmRlcjogRXhwcmVzc2lvbi5SRVNVTFRfT1JERVJJTkdTLlNPUlRFRCxcblx0XHRcdFx0cGVlcjogdHJ1ZSxcblx0XHRcdFx0c3VidHJlZTogZmFsc2UsXG5cdFx0XHRcdGNhbkJlU3RhdGljYWxseUV2YWx1YXRlZDogZmFsc2Vcblx0XHRcdH0pO1xuXG5cdFx0dGhpcy5fc2libGluZ0V4cHJlc3Npb24gPSBzaWJsaW5nRXhwcmVzc2lvbjtcblx0fVxuXG5cdGV2YWx1YXRlIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGNvbnRleHRJdGVtID0gZHluYW1pY0NvbnRleHQuY29udGV4dEl0ZW07XG5cdFx0aWYgKGNvbnRleHRJdGVtID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1hQRFkwMDAyOiBjb250ZXh0IGlzIGFic2VudCwgaXQgbmVlZHMgdG8gYmUgcHJlc2VudCB0byB1c2UgYXhlcy4nKTtcblx0XHR9XG5cblx0XHRjb25zdCBkb21GYWNhZGUgPSBleGVjdXRpb25QYXJhbWV0ZXJzLmRvbUZhY2FkZTtcblxuXHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKGNyZWF0ZVNpYmxpbmdHZW5lcmF0b3IoZG9tRmFjYWRlLCBjb250ZXh0SXRlbS52YWx1ZSkpLmZpbHRlcihpdGVtID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9zaWJsaW5nRXhwcmVzc2lvbi5ldmFsdWF0ZVRvQm9vbGVhbihkeW5hbWljQ29udGV4dCwgaXRlbSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRm9sbG93aW5nU2libGluZ0F4aXM7XG4iXX0=