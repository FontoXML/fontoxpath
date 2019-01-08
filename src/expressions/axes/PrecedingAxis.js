"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const iterators_1 = require("../util/iterators");
const createDescendantGenerator_1 = require("../util/createDescendantGenerator");
function createPrecedingGenerator(domFacade, node) {
    const nodeStack = [];
    for (; node; node = domFacade.getParentNode(node)) {
        const previousSibling = domFacade.getPreviousSibling(node);
        if (previousSibling === null) {
            continue;
        }
        nodeStack.push(previousSibling);
    }
    let nephewGenerator = null;
    return {
        next: () => {
            while (nephewGenerator || nodeStack.length) {
                if (!nephewGenerator) {
                    nephewGenerator = createDescendantGenerator_1.default(domFacade, nodeStack[0], true);
                }
                const nephew = nephewGenerator.next();
                if (nephew.done) {
                    // We are done with the descendants of the node currently on the stack
                    nephewGenerator = null;
                    // Set the focus to the concurrent sibling of this node
                    const nextNode = domFacade.getPreviousSibling(nodeStack[0]);
                    const toReturn = iterators_1.ready(createNodeValue_1.default(nodeStack[0]));
                    if (nextNode === null) {
                        // This is the last sibling, we can continue with a child of the current
                        // node (an uncle of the original node) in the next iteration
                        nodeStack.shift();
                    }
                    else {
                        nodeStack[0] = nextNode;
                    }
                    return toReturn;
                }
                return nephew;
            }
            return iterators_1.DONE_TOKEN;
        }
    };
}
class PrecedingAxis extends Expression_1.default {
    constructor(testExpression) {
        super(testExpression.specificity, [testExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.REVERSE_SORTED,
            peer: true,
            subtree: false,
            canBeStaticallyEvaluated: false
        });
        this._testExpression = testExpression;
    }
    evaluate(dynamicContext, executionParameters) {
        const contextItem = dynamicContext.contextItem;
        if (contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
        }
        const domFacade = executionParameters.domFacade;
        return SequenceFactory_1.default.create(createPrecedingGenerator(domFacade, contextItem.value)).filter(item => {
            return this._testExpression.evaluateToBoolean(dynamicContext, item);
        });
    }
}
exports.default = PrecedingAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJlY2VkaW5nQXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlByZWNlZGluZ0F4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBdUM7QUFDdkMsa0VBQTJEO0FBQzNELGtFQUEyRDtBQUMzRCxpREFBc0Q7QUFFdEQsaUZBQTBFO0FBRzFFLFNBQVMsd0JBQXdCLENBQUUsU0FBUyxFQUFFLElBQUk7SUFDakQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRXJCLE9BQU8sSUFBSSxFQUFFLElBQUksR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUU7WUFDN0IsU0FBUztTQUNUO1FBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNoQztJQUVELElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztJQUMzQixPQUFPO1FBQ04sSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUNWLE9BQU8sZUFBZSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3JCLGVBQWUsR0FBRyxtQ0FBeUIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUMzRTtnQkFFRCxNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBR3RDLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtvQkFDaEIsc0VBQXNFO29CQUN0RSxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUV2Qix1REFBdUQ7b0JBQ3ZELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUQsTUFBTSxRQUFRLEdBQUcsaUJBQUssQ0FBQyx5QkFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELElBQUksUUFBUSxLQUFLLElBQUksRUFBRTt3QkFDdEIsd0VBQXdFO3dCQUN4RSw2REFBNkQ7d0JBQzdELFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztxQkFDbEI7eUJBQ0k7d0JBQ0osU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztxQkFDeEI7b0JBRUQsT0FBTyxRQUFRLENBQUM7aUJBQ2hCO2dCQUVELE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFFRCxPQUFPLHNCQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNELENBQUM7QUFDSCxDQUFDO0FBR0QsTUFBTSxhQUFjLFNBQVEsb0JBQVU7SUFFckMsWUFBWSxjQUFzQztRQUNqRCxLQUFLLENBQ0osY0FBYyxDQUFDLFdBQVcsRUFDMUIsQ0FBQyxjQUFjLENBQUMsRUFDaEI7WUFDQyxXQUFXLEVBQUUsb0JBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjO1lBQ3ZELElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLEtBQUs7WUFDZCx3QkFBd0IsRUFBRSxLQUFLO1NBQy9CLENBQUMsQ0FBQztRQUVKLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxRQUFRLENBQUUsY0FBYyxFQUFFLG1CQUFtQjtRQUM1QyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDO1FBQy9DLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7U0FDcEY7UUFFRCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUM7UUFFaEQsT0FBTyx5QkFBZSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25HLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFFRCxrQkFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi9FeHByZXNzaW9uJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgY3JlYXRlTm9kZVZhbHVlIGZyb20gJy4uL2RhdGFUeXBlcy9jcmVhdGVOb2RlVmFsdWUnO1xuaW1wb3J0IHsgRE9ORV9UT0tFTiwgcmVhZHkgfSBmcm9tICcuLi91dGlsL2l0ZXJhdG9ycyc7XG5cbmltcG9ydCBjcmVhdGVEZXNjZW5kYW50R2VuZXJhdG9yIGZyb20gJy4uL3V0aWwvY3JlYXRlRGVzY2VuZGFudEdlbmVyYXRvcic7XG5pbXBvcnQgVGVzdEFic3RyYWN0RXhwcmVzc2lvbiBmcm9tICcuLi90ZXN0cy9UZXN0QWJzdHJhY3RFeHByZXNzaW9uJztcblxuZnVuY3Rpb24gY3JlYXRlUHJlY2VkaW5nR2VuZXJhdG9yIChkb21GYWNhZGUsIG5vZGUpIHtcblx0Y29uc3Qgbm9kZVN0YWNrID0gW107XG5cblx0Zm9yICg7IG5vZGU7IG5vZGUgPSBkb21GYWNhZGUuZ2V0UGFyZW50Tm9kZShub2RlKSkge1xuXHRcdGNvbnN0IHByZXZpb3VzU2libGluZyA9IGRvbUZhY2FkZS5nZXRQcmV2aW91c1NpYmxpbmcobm9kZSk7XG5cdFx0aWYgKHByZXZpb3VzU2libGluZyA9PT0gbnVsbCkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdG5vZGVTdGFjay5wdXNoKHByZXZpb3VzU2libGluZyk7XG5cdH1cblxuXHRsZXQgbmVwaGV3R2VuZXJhdG9yID0gbnVsbDtcblx0cmV0dXJuIHtcblx0XHRuZXh0OiAoKSA9PiB7XG5cdFx0XHR3aGlsZSAobmVwaGV3R2VuZXJhdG9yIHx8IG5vZGVTdGFjay5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKCFuZXBoZXdHZW5lcmF0b3IpIHtcblx0XHRcdFx0XHRuZXBoZXdHZW5lcmF0b3IgPSBjcmVhdGVEZXNjZW5kYW50R2VuZXJhdG9yKGRvbUZhY2FkZSwgbm9kZVN0YWNrWzBdLCB0cnVlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IG5lcGhldyA9IG5lcGhld0dlbmVyYXRvci5uZXh0KCk7XG5cblxuXHRcdFx0XHRpZiAobmVwaGV3LmRvbmUpIHtcblx0XHRcdFx0XHQvLyBXZSBhcmUgZG9uZSB3aXRoIHRoZSBkZXNjZW5kYW50cyBvZiB0aGUgbm9kZSBjdXJyZW50bHkgb24gdGhlIHN0YWNrXG5cdFx0XHRcdFx0bmVwaGV3R2VuZXJhdG9yID0gbnVsbDtcblxuXHRcdFx0XHRcdC8vIFNldCB0aGUgZm9jdXMgdG8gdGhlIGNvbmN1cnJlbnQgc2libGluZyBvZiB0aGlzIG5vZGVcblx0XHRcdFx0XHRjb25zdCBuZXh0Tm9kZSA9IGRvbUZhY2FkZS5nZXRQcmV2aW91c1NpYmxpbmcobm9kZVN0YWNrWzBdKTtcblx0XHRcdFx0XHRjb25zdCB0b1JldHVybiA9IHJlYWR5KGNyZWF0ZU5vZGVWYWx1ZShub2RlU3RhY2tbMF0pKTtcblx0XHRcdFx0XHRpZiAobmV4dE5vZGUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgdGhlIGxhc3Qgc2libGluZywgd2UgY2FuIGNvbnRpbnVlIHdpdGggYSBjaGlsZCBvZiB0aGUgY3VycmVudFxuXHRcdFx0XHRcdFx0Ly8gbm9kZSAoYW4gdW5jbGUgb2YgdGhlIG9yaWdpbmFsIG5vZGUpIGluIHRoZSBuZXh0IGl0ZXJhdGlvblxuXHRcdFx0XHRcdFx0bm9kZVN0YWNrLnNoaWZ0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0bm9kZVN0YWNrWzBdID0gbmV4dE5vZGU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIHRvUmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5lcGhldztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0fVxuXHR9O1xufVxuXG5cbmNsYXNzIFByZWNlZGluZ0F4aXMgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0X3Rlc3RFeHByZXNzaW9uOiBUZXN0QWJzdHJhY3RFeHByZXNzaW9uO1xuXHRjb25zdHJ1Y3Rvcih0ZXN0RXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbikge1xuXHRcdHN1cGVyKFxuXHRcdFx0dGVzdEV4cHJlc3Npb24uc3BlY2lmaWNpdHksXG5cdFx0XHRbdGVzdEV4cHJlc3Npb25dLFxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHRPcmRlcjogRXhwcmVzc2lvbi5SRVNVTFRfT1JERVJJTkdTLlJFVkVSU0VfU09SVEVELFxuXHRcdFx0XHRwZWVyOiB0cnVlLFxuXHRcdFx0XHRzdWJ0cmVlOiBmYWxzZSxcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBmYWxzZVxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLl90ZXN0RXhwcmVzc2lvbiA9IHRlc3RFeHByZXNzaW9uO1xuXHR9XG5cblx0ZXZhbHVhdGUgKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0Y29uc3QgY29udGV4dEl0ZW0gPSBkeW5hbWljQ29udGV4dC5jb250ZXh0SXRlbTtcblx0XHRpZiAoY29udGV4dEl0ZW0gPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignWFBEWTAwMDI6IGNvbnRleHQgaXMgYWJzZW50LCBpdCBuZWVkcyB0byBiZSBwcmVzZW50IHRvIHVzZSBheGVzLicpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRvbUZhY2FkZSA9IGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlO1xuXG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoY3JlYXRlUHJlY2VkaW5nR2VuZXJhdG9yKGRvbUZhY2FkZSwgY29udGV4dEl0ZW0udmFsdWUpKS5maWx0ZXIoaXRlbSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fdGVzdEV4cHJlc3Npb24uZXZhbHVhdGVUb0Jvb2xlYW4oZHluYW1pY0NvbnRleHQsIGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByZWNlZGluZ0F4aXM7XG4iXX0=