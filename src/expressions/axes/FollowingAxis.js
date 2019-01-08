"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const iterators_1 = require("../util/iterators");
const createDescendantGenerator_1 = require("../util/createDescendantGenerator");
function createFollowingGenerator(domFacade, node) {
    const nodeStack = [];
    for (; node; node = domFacade.getParentNode(node)) {
        const previousSibling = domFacade.getNextSibling(node);
        if (previousSibling) {
            nodeStack.push(previousSibling);
        }
    }
    let nephewGenerator = null;
    return {
        next: () => {
            while (nephewGenerator || nodeStack.length) {
                if (!nephewGenerator) {
                    nephewGenerator = createDescendantGenerator_1.default(domFacade, nodeStack[0]);
                    const toReturn = iterators_1.ready(createNodeValue_1.default(nodeStack[0]));
                    // Set the focus to the concurrent sibling of this node
                    const nextNode = domFacade.getNextSibling(nodeStack[0]);
                    if (!nextNode) {
                        // This is the last sibling, we can continue with a child of the current
                        // node (an uncle of the original node) in the next iteration
                        nodeStack.shift();
                    }
                    else {
                        nodeStack[0] = nextNode;
                    }
                    return toReturn;
                }
                const nephew = nephewGenerator.next();
                if (nephew.done) {
                    // We are done with the descendants of the node currently on the stack
                    nephewGenerator = null;
                    continue;
                }
                return nephew;
            }
            return iterators_1.DONE_TOKEN;
        }
    };
}
class FollowingAxis extends Expression_1.default {
    constructor(testExpression) {
        super(testExpression.specificity, [testExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.SORTED,
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
        return SequenceFactory_1.default.create(createFollowingGenerator(domFacade, contextItem.value)).filter(item => {
            return this._testExpression.evaluateToBoolean(dynamicContext, item);
        });
    }
}
exports.default = FollowingAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9sbG93aW5nQXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZvbGxvd2luZ0F4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBdUM7QUFDdkMsa0VBQTJEO0FBQzNELGtFQUEyRDtBQUMzRCxpREFBc0Q7QUFHdEQsaUZBQTBFO0FBRTFFLFNBQVMsd0JBQXdCLENBQUUsU0FBUyxFQUFFLElBQUk7SUFDakQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRXJCLE9BQU8sSUFBSSxFQUFFLElBQUksR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsSUFBSSxlQUFlLEVBQUU7WUFDcEIsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNoQztLQUNEO0lBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBQzNCLE9BQU87UUFDTixJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ1YsT0FBTyxlQUFlLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDM0MsSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDckIsZUFBZSxHQUFHLG1DQUF5QixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFckUsTUFBTSxRQUFRLEdBQUcsaUJBQUssQ0FBQyx5QkFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELHVEQUF1RDtvQkFDdkQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLFFBQVEsRUFBRTt3QkFDZCx3RUFBd0U7d0JBQ3hFLDZEQUE2RDt3QkFDN0QsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO3FCQUNsQjt5QkFDSTt3QkFDSixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO3FCQUN4QjtvQkFDRCxPQUFPLFFBQVEsQ0FBQztpQkFDaEI7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV0QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7b0JBQ2hCLHNFQUFzRTtvQkFDdEUsZUFBZSxHQUFHLElBQUksQ0FBQztvQkFFdkIsU0FBUztpQkFDVDtnQkFFRCxPQUFPLE1BQU0sQ0FBQzthQUNkO1lBRUQsT0FBTyxzQkFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQztBQUdELE1BQU0sYUFBYyxTQUFRLG9CQUFVO0lBRXJDLFlBQVksY0FBc0M7UUFDakQsS0FBSyxDQUNKLGNBQWMsQ0FBQyxXQUFXLEVBQzFCLENBQUMsY0FBYyxDQUFDLEVBQ2hCO1lBQ0MsV0FBVyxFQUFFLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTTtZQUMvQyxJQUFJLEVBQUUsSUFBSTtZQUNWLE9BQU8sRUFBRSxLQUFLO1lBQ2Qsd0JBQXdCLEVBQUUsS0FBSztTQUMvQixDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsUUFBUSxDQUFFLGNBQWMsRUFBRSxtQkFBbUI7UUFDNUMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQztRQUMvQyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDO1FBRWhELE9BQU8seUJBQWUsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuRyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBRUQsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cHJlc3Npb24gZnJvbSAnLi4vRXhwcmVzc2lvbic7XG5pbXBvcnQgU2VxdWVuY2VGYWN0b3J5IGZyb20gJy4uL2RhdGFUeXBlcy9TZXF1ZW5jZUZhY3RvcnknO1xuaW1wb3J0IGNyZWF0ZU5vZGVWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvY3JlYXRlTm9kZVZhbHVlJztcbmltcG9ydCB7IERPTkVfVE9LRU4sIHJlYWR5IH0gZnJvbSAnLi4vdXRpbC9pdGVyYXRvcnMnO1xuaW1wb3J0IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24gZnJvbSAnLi4vdGVzdHMvVGVzdEFic3RyYWN0RXhwcmVzc2lvbic7XG5cbmltcG9ydCBjcmVhdGVEZXNjZW5kYW50R2VuZXJhdG9yIGZyb20gJy4uL3V0aWwvY3JlYXRlRGVzY2VuZGFudEdlbmVyYXRvcic7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZvbGxvd2luZ0dlbmVyYXRvciAoZG9tRmFjYWRlLCBub2RlKSB7XG5cdGNvbnN0IG5vZGVTdGFjayA9IFtdO1xuXG5cdGZvciAoOyBub2RlOyBub2RlID0gZG9tRmFjYWRlLmdldFBhcmVudE5vZGUobm9kZSkpIHtcblx0XHRjb25zdCBwcmV2aW91c1NpYmxpbmcgPSBkb21GYWNhZGUuZ2V0TmV4dFNpYmxpbmcobm9kZSk7XG5cdFx0aWYgKHByZXZpb3VzU2libGluZykge1xuXHRcdFx0bm9kZVN0YWNrLnB1c2gocHJldmlvdXNTaWJsaW5nKTtcblx0XHR9XG5cdH1cblxuXHRsZXQgbmVwaGV3R2VuZXJhdG9yID0gbnVsbDtcblx0cmV0dXJuIHtcblx0XHRuZXh0OiAoKSA9PiB7XG5cdFx0XHR3aGlsZSAobmVwaGV3R2VuZXJhdG9yIHx8IG5vZGVTdGFjay5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKCFuZXBoZXdHZW5lcmF0b3IpIHtcblx0XHRcdFx0XHRuZXBoZXdHZW5lcmF0b3IgPSBjcmVhdGVEZXNjZW5kYW50R2VuZXJhdG9yKGRvbUZhY2FkZSwgbm9kZVN0YWNrWzBdKTtcblxuXHRcdFx0XHRcdGNvbnN0IHRvUmV0dXJuID0gcmVhZHkoY3JlYXRlTm9kZVZhbHVlKG5vZGVTdGFja1swXSkpO1xuXHRcdFx0XHRcdC8vIFNldCB0aGUgZm9jdXMgdG8gdGhlIGNvbmN1cnJlbnQgc2libGluZyBvZiB0aGlzIG5vZGVcblx0XHRcdFx0XHRjb25zdCBuZXh0Tm9kZSA9IGRvbUZhY2FkZS5nZXROZXh0U2libGluZyhub2RlU3RhY2tbMF0pO1xuXHRcdFx0XHRcdGlmICghbmV4dE5vZGUpIHtcblx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgdGhlIGxhc3Qgc2libGluZywgd2UgY2FuIGNvbnRpbnVlIHdpdGggYSBjaGlsZCBvZiB0aGUgY3VycmVudFxuXHRcdFx0XHRcdFx0Ly8gbm9kZSAoYW4gdW5jbGUgb2YgdGhlIG9yaWdpbmFsIG5vZGUpIGluIHRoZSBuZXh0IGl0ZXJhdGlvblxuXHRcdFx0XHRcdFx0bm9kZVN0YWNrLnNoaWZ0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0bm9kZVN0YWNrWzBdID0gbmV4dE5vZGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0b1JldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IG5lcGhldyA9IG5lcGhld0dlbmVyYXRvci5uZXh0KCk7XG5cblx0XHRcdFx0aWYgKG5lcGhldy5kb25lKSB7XG5cdFx0XHRcdFx0Ly8gV2UgYXJlIGRvbmUgd2l0aCB0aGUgZGVzY2VuZGFudHMgb2YgdGhlIG5vZGUgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuXHRcdFx0XHRcdG5lcGhld0dlbmVyYXRvciA9IG51bGw7XG5cblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBuZXBoZXc7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdH1cblx0fTtcbn1cblxuXG5jbGFzcyBGb2xsb3dpbmdBeGlzIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdF90ZXN0RXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbjtcblx0Y29uc3RydWN0b3IodGVzdEV4cHJlc3Npb246IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24pIHtcblx0XHRzdXBlcihcblx0XHRcdHRlc3RFeHByZXNzaW9uLnNwZWNpZmljaXR5LFxuXHRcdFx0W3Rlc3RFeHByZXNzaW9uXSxcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0T3JkZXI6IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5TT1JURUQsXG5cdFx0XHRcdHBlZXI6IHRydWUsXG5cdFx0XHRcdHN1YnRyZWU6IGZhbHNlLFxuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuX3Rlc3RFeHByZXNzaW9uID0gdGVzdEV4cHJlc3Npb247XG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRjb25zdCBjb250ZXh0SXRlbSA9IGR5bmFtaWNDb250ZXh0LmNvbnRleHRJdGVtO1xuXHRcdGlmIChjb250ZXh0SXRlbSA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUERZMDAwMjogY29udGV4dCBpcyBhYnNlbnQsIGl0IG5lZWRzIHRvIGJlIHByZXNlbnQgdG8gdXNlIGF4ZXMuJyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZG9tRmFjYWRlID0gZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGU7XG5cblx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZShjcmVhdGVGb2xsb3dpbmdHZW5lcmF0b3IoZG9tRmFjYWRlLCBjb250ZXh0SXRlbS52YWx1ZSkpLmZpbHRlcihpdGVtID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl90ZXN0RXhwcmVzc2lvbi5ldmFsdWF0ZVRvQm9vbGVhbihkeW5hbWljQ29udGV4dCwgaXRlbSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRm9sbG93aW5nQXhpcztcbiJdfQ==