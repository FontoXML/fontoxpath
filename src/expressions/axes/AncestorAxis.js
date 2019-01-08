"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const iterators_1 = require("../util/iterators");
function generateAncestors(domFacade, contextNode) {
    let ancestor = contextNode;
    return {
        next: () => {
            if (!ancestor) {
                return iterators_1.DONE_TOKEN;
            }
            const previousAncestor = ancestor;
            ancestor = previousAncestor && domFacade.getParentNode(previousAncestor);
            return iterators_1.ready(createNodeValue_1.default(previousAncestor));
        }
    };
}
class AncestorAxis extends Expression_1.default {
    constructor(ancestorExpression, options) {
        options = options || { inclusive: false };
        super(ancestorExpression.specificity, [ancestorExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.REVERSE_SORTED,
            peer: false,
            subtree: false,
            canBeStaticallyEvaluated: false
        });
        this._ancestorExpression = ancestorExpression;
        this._isInclusive = !!options.inclusive;
    }
    evaluate(dynamicContext, executionParameters) {
        const contextItem = dynamicContext.contextItem;
        if (contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
        }
        const domFacade = executionParameters.domFacade;
        const /** !Node */ contextNode = contextItem.value;
        return SequenceFactory_1.default.create(generateAncestors(domFacade, this._isInclusive ? contextNode : domFacade.getParentNode(contextNode)))
            .filter(item => {
            return this._ancestorExpression.evaluateToBoolean(dynamicContext, item);
        });
    }
}
exports.default = AncestorAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5jZXN0b3JBeGlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQW5jZXN0b3JBeGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXVDO0FBQ3ZDLGtFQUEyRDtBQUMzRCxrRUFBMkQ7QUFDM0QsaURBQXNEO0FBR3RELFNBQVMsaUJBQWlCLENBQUUsU0FBUyxFQUFFLFdBQVc7SUFDakQsSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDO0lBQzNCLE9BQU87UUFDTixJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLHNCQUFVLENBQUM7YUFDbEI7WUFDRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztZQUNsQyxRQUFRLEdBQUcsZ0JBQWdCLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXpFLE9BQU8saUJBQUssQ0FBQyx5QkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFlBQWEsU0FBUSxvQkFBVTtJQUdwQyxZQUFZLGtCQUEwQyxFQUFFLE9BQTRDO1FBQ25HLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDMUMsS0FBSyxDQUNKLGtCQUFrQixDQUFDLFdBQVcsRUFDOUIsQ0FBQyxrQkFBa0IsQ0FBQyxFQUNwQjtZQUNDLFdBQVcsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDLGNBQWM7WUFDdkQsSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUUsS0FBSztZQUNkLHdCQUF3QixFQUFFLEtBQUs7U0FDL0IsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO1FBQzlDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDekMsQ0FBQztJQUVELFFBQVEsQ0FBRSxjQUFjLEVBQUUsbUJBQW1CO1FBQzVDLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUM7UUFDL0MsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQztTQUNwRjtRQUVELE1BQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQztRQUVoRCxNQUFNLFlBQVksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUNuRCxPQUFPLHlCQUFlLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUNqSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDZCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Q7QUFFRCxrQkFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi9FeHByZXNzaW9uJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgY3JlYXRlTm9kZVZhbHVlIGZyb20gJy4uL2RhdGFUeXBlcy9jcmVhdGVOb2RlVmFsdWUnO1xuaW1wb3J0IHsgRE9ORV9UT0tFTiwgcmVhZHkgfSBmcm9tICcuLi91dGlsL2l0ZXJhdG9ycyc7XG5pbXBvcnQgVGVzdEFic3RyYWN0RXhwcmVzc2lvbiBmcm9tICcuLi90ZXN0cy9UZXN0QWJzdHJhY3RFeHByZXNzaW9uJztcblxuZnVuY3Rpb24gZ2VuZXJhdGVBbmNlc3RvcnMgKGRvbUZhY2FkZSwgY29udGV4dE5vZGUpIHtcblx0bGV0IGFuY2VzdG9yID0gY29udGV4dE5vZGU7XG5cdHJldHVybiB7XG5cdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0aWYgKCFhbmNlc3Rvcikge1xuXHRcdFx0XHRyZXR1cm4gRE9ORV9UT0tFTjtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHByZXZpb3VzQW5jZXN0b3IgPSBhbmNlc3Rvcjtcblx0XHRcdGFuY2VzdG9yID0gcHJldmlvdXNBbmNlc3RvciAmJiBkb21GYWNhZGUuZ2V0UGFyZW50Tm9kZShwcmV2aW91c0FuY2VzdG9yKTtcblxuXHRcdFx0cmV0dXJuIHJlYWR5KGNyZWF0ZU5vZGVWYWx1ZShwcmV2aW91c0FuY2VzdG9yKSk7XG5cdFx0fVxuXHR9O1xufVxuXG5jbGFzcyBBbmNlc3RvckF4aXMgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0X2FuY2VzdG9yRXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbjtcblx0X2lzSW5jbHVzaXZlOiBib29sZWFuO1xuXHRjb25zdHJ1Y3RvcihhbmNlc3RvckV4cHJlc3Npb246IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24sIG9wdGlvbnM6IHsgaW5jbHVzaXZlOiBib29sZWFuOyB9IHwgdW5kZWZpbmVkKSB7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwgeyBpbmNsdXNpdmU6IGZhbHNlIH07XG5cdFx0c3VwZXIoXG5cdFx0XHRhbmNlc3RvckV4cHJlc3Npb24uc3BlY2lmaWNpdHksXG5cdFx0XHRbYW5jZXN0b3JFeHByZXNzaW9uXSxcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0T3JkZXI6IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5SRVZFUlNFX1NPUlRFRCxcblx0XHRcdFx0cGVlcjogZmFsc2UsXG5cdFx0XHRcdHN1YnRyZWU6IGZhbHNlLFxuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuX2FuY2VzdG9yRXhwcmVzc2lvbiA9IGFuY2VzdG9yRXhwcmVzc2lvbjtcblx0XHR0aGlzLl9pc0luY2x1c2l2ZSA9ICEhb3B0aW9ucy5pbmNsdXNpdmU7XG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRjb25zdCBjb250ZXh0SXRlbSA9IGR5bmFtaWNDb250ZXh0LmNvbnRleHRJdGVtO1xuXHRcdGlmIChjb250ZXh0SXRlbSA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUERZMDAwMjogY29udGV4dCBpcyBhYnNlbnQsIGl0IG5lZWRzIHRvIGJlIHByZXNlbnQgdG8gdXNlIGF4ZXMuJyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZG9tRmFjYWRlID0gZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGU7XG5cblx0XHRjb25zdCAvKiogIU5vZGUgKi8gY29udGV4dE5vZGUgPSBjb250ZXh0SXRlbS52YWx1ZTtcblx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZShnZW5lcmF0ZUFuY2VzdG9ycyhkb21GYWNhZGUsIHRoaXMuX2lzSW5jbHVzaXZlID8gY29udGV4dE5vZGUgOiBkb21GYWNhZGUuZ2V0UGFyZW50Tm9kZShjb250ZXh0Tm9kZSkpKVxuXHRcdFx0LmZpbHRlcihpdGVtID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2FuY2VzdG9yRXhwcmVzc2lvbi5ldmFsdWF0ZVRvQm9vbGVhbihkeW5hbWljQ29udGV4dCwgaXRlbSk7XG5cdFx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBbmNlc3RvckF4aXM7XG4iXX0=