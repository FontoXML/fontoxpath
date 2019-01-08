"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createChildGenerator_1 = require("./createChildGenerator");
const iterators_1 = require("./iterators");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
function findDeepestLastDescendant(node, domFacade) {
    while (domFacade.getLastChild(node) !== null) {
        node = domFacade.getLastChild(node);
    }
    return node;
}
function createDescendantGenerator(domFacade, node, returnInReverse = false) {
    if (returnInReverse) {
        let currentNode = node;
        let isDone = false;
        return {
            next: () => {
                if (isDone) {
                    return iterators_1.DONE_TOKEN;
                }
                if (currentNode === node) {
                    currentNode = findDeepestLastDescendant(node, domFacade);
                    if (currentNode === node) {
                        isDone = true;
                        return iterators_1.DONE_TOKEN;
                    }
                    return iterators_1.ready(createNodeValue_1.default(currentNode));
                }
                const previousSibling = domFacade.getPreviousSibling(currentNode);
                if (previousSibling !== null) {
                    currentNode = findDeepestLastDescendant(previousSibling, domFacade);
                    return iterators_1.ready(createNodeValue_1.default(currentNode));
                }
                currentNode = domFacade.getParentNode(currentNode);
                if (currentNode === node) {
                    isDone = true;
                    return iterators_1.DONE_TOKEN;
                }
                return iterators_1.ready(createNodeValue_1.default(currentNode));
            }
        };
    }
    /**
     * @type {!Array<!Iterator<!Node>>}
     */
    const descendantIteratorStack = [createChildGenerator_1.default(domFacade, node)];
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
exports.default = createDescendantGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRGVzY2VuZGFudEdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZURlc2NlbmRhbnRHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRUFBMEQ7QUFDMUQsMkNBQWdEO0FBQ2hELGtFQUEyRDtBQUUzRCxTQUFTLHlCQUF5QixDQUFFLElBQUksRUFBRSxTQUFTO0lBQ2xELE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDN0MsSUFBSSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFFRCxTQUF3Qix5QkFBeUIsQ0FBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGVBQWUsR0FBRyxLQUFLO0lBQzFGLElBQUksZUFBZSxFQUFFO1FBQ3BCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkIsT0FBTztZQUNOLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsT0FBTyxzQkFBVSxDQUFDO2lCQUNsQjtnQkFFRCxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7b0JBQ3pCLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ3pELElBQUksV0FBVyxLQUFLLElBQUksRUFBRTt3QkFDekIsTUFBTSxHQUFHLElBQUksQ0FBQzt3QkFDZCxPQUFPLHNCQUFVLENBQUM7cUJBQ2xCO29CQUNELE9BQU8saUJBQUssQ0FBQyx5QkFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7aUJBQzNDO2dCQUVELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxlQUFlLEtBQUssSUFBSSxFQUFFO29CQUM3QixXQUFXLEdBQUcseUJBQXlCLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNwRSxPQUFPLGlCQUFLLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2lCQUMzQztnQkFFRCxXQUFXLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO29CQUN6QixNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNkLE9BQU8sc0JBQVUsQ0FBQztpQkFDbEI7Z0JBQ0QsT0FBTyxpQkFBSyxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1NBQ0QsQ0FBQztLQUNGO0lBRUQ7O09BRUc7SUFDSCxNQUFNLHVCQUF1QixHQUFHLENBQUMsOEJBQW9CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEUsT0FBTztRQUNOLElBQUksRUFBRSxHQUFHLEVBQUU7WUFFVixJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFO2dCQUNwQyxPQUFPLHNCQUFVLENBQUM7YUFDbEI7WUFDRCxJQUFJLEtBQUssR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5QyxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLHVCQUF1QixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFO29CQUNwQyxPQUFPLHNCQUFVLENBQUM7aUJBQ2xCO2dCQUNELEtBQUssR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUMxQztZQUNELG9DQUFvQztZQUNwQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsOEJBQW9CLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE9BQU8saUJBQUssQ0FBQyx5QkFBZSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQztBQTFERCw0Q0EwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3JlYXRlQ2hpbGRHZW5lcmF0b3IgZnJvbSAnLi9jcmVhdGVDaGlsZEdlbmVyYXRvcic7XG5pbXBvcnQgeyBET05FX1RPS0VOLCByZWFkeSB9IGZyb20gJy4vaXRlcmF0b3JzJztcbmltcG9ydCBjcmVhdGVOb2RlVmFsdWUgZnJvbSAnLi4vZGF0YVR5cGVzL2NyZWF0ZU5vZGVWYWx1ZSc7XG5cbmZ1bmN0aW9uIGZpbmREZWVwZXN0TGFzdERlc2NlbmRhbnQgKG5vZGUsIGRvbUZhY2FkZSkge1xuXHR3aGlsZSAoZG9tRmFjYWRlLmdldExhc3RDaGlsZChub2RlKSAhPT0gbnVsbCkge1xuXHRcdG5vZGUgPSBkb21GYWNhZGUuZ2V0TGFzdENoaWxkKG5vZGUpO1xuXHR9XG5cdHJldHVybiBub2RlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVEZXNjZW5kYW50R2VuZXJhdG9yIChkb21GYWNhZGUsIG5vZGUsIHJldHVybkluUmV2ZXJzZSA9IGZhbHNlKSB7XG5cdGlmIChyZXR1cm5JblJldmVyc2UpIHtcblx0XHRsZXQgY3VycmVudE5vZGUgPSBub2RlO1xuXHRcdGxldCBpc0RvbmUgPSBmYWxzZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0XHRpZiAoaXNEb25lKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudE5vZGUgPT09IG5vZGUpIHtcblx0XHRcdFx0XHRjdXJyZW50Tm9kZSA9IGZpbmREZWVwZXN0TGFzdERlc2NlbmRhbnQobm9kZSwgZG9tRmFjYWRlKTtcblx0XHRcdFx0XHRpZiAoY3VycmVudE5vZGUgPT09IG5vZGUpIHtcblx0XHRcdFx0XHRcdGlzRG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRyZXR1cm4gRE9ORV9UT0tFTjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHJlYWR5KGNyZWF0ZU5vZGVWYWx1ZShjdXJyZW50Tm9kZSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgcHJldmlvdXNTaWJsaW5nID0gZG9tRmFjYWRlLmdldFByZXZpb3VzU2libGluZyhjdXJyZW50Tm9kZSk7XG5cdFx0XHRcdGlmIChwcmV2aW91c1NpYmxpbmcgIT09IG51bGwpIHtcblx0XHRcdFx0XHRjdXJyZW50Tm9kZSA9IGZpbmREZWVwZXN0TGFzdERlc2NlbmRhbnQocHJldmlvdXNTaWJsaW5nLCBkb21GYWNhZGUpO1xuXHRcdFx0XHRcdHJldHVybiByZWFkeShjcmVhdGVOb2RlVmFsdWUoY3VycmVudE5vZGUpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGN1cnJlbnROb2RlID0gZG9tRmFjYWRlLmdldFBhcmVudE5vZGUoY3VycmVudE5vZGUpO1xuXHRcdFx0XHRpZiAoY3VycmVudE5vZGUgPT09IG5vZGUpIHtcblx0XHRcdFx0XHRpc0RvbmUgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZWFkeShjcmVhdGVOb2RlVmFsdWUoY3VycmVudE5vZGUpKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0eXBlIHshQXJyYXk8IUl0ZXJhdG9yPCFOb2RlPj59XG5cdCAqL1xuXHRjb25zdCBkZXNjZW5kYW50SXRlcmF0b3JTdGFjayA9IFtjcmVhdGVDaGlsZEdlbmVyYXRvcihkb21GYWNhZGUsIG5vZGUpXTtcblx0cmV0dXJuIHtcblx0XHRuZXh0OiAoKSA9PiB7XG5cblx0XHRcdGlmICghZGVzY2VuZGFudEl0ZXJhdG9yU3RhY2subGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdFx0fVxuXHRcdFx0bGV0IHZhbHVlID0gZGVzY2VuZGFudEl0ZXJhdG9yU3RhY2tbMF0ubmV4dCgpO1xuXHRcdFx0d2hpbGUgKHZhbHVlLmRvbmUpIHtcblx0XHRcdFx0ZGVzY2VuZGFudEl0ZXJhdG9yU3RhY2suc2hpZnQoKTtcblx0XHRcdFx0aWYgKCFkZXNjZW5kYW50SXRlcmF0b3JTdGFjay5sZW5ndGgpIHtcblx0XHRcdFx0XHRyZXR1cm4gRE9ORV9UT0tFTjtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YWx1ZSA9IGRlc2NlbmRhbnRJdGVyYXRvclN0YWNrWzBdLm5leHQoKTtcblx0XHRcdH1cblx0XHRcdC8vIEl0ZXJhdG9yIG92ZXIgdGhlc2UgY2hpbGRyZW4gbmV4dFxuXHRcdFx0ZGVzY2VuZGFudEl0ZXJhdG9yU3RhY2sudW5zaGlmdChjcmVhdGVDaGlsZEdlbmVyYXRvcihkb21GYWNhZGUsIHZhbHVlLnZhbHVlKSk7XG5cdFx0XHRyZXR1cm4gcmVhZHkoY3JlYXRlTm9kZVZhbHVlKHZhbHVlLnZhbHVlKSk7XG5cdFx0fVxuXHR9O1xufVxuIl19