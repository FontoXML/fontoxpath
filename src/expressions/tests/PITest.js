"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestAbstractExpression_1 = require("./TestAbstractExpression");
const Specificity_1 = require("../Specificity");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
class PITest extends TestAbstractExpression_1.default {
    /**
     * @param  {string}  target
     */
    constructor(target) {
        super(new Specificity_1.default({
            [Specificity_1.default.NODENAME_KIND]: 1
        }));
        this._target = target;
    }
    evaluateToBoolean(_dynamicContext, node) {
        // Assume singleton
        var isMatchingProcessingInstruction = isSubtypeOf_1.default(node.type, 'processing-instruction()') &&
            node.value.target === this._target;
        return isMatchingProcessingInstruction;
    }
    getBucket() {
        return 'type-7';
    }
}
exports.default = PITest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUElUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUElUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUVBQThEO0FBQzlELGdEQUF5QztBQUN6QywwREFBbUQ7QUFFbkQsTUFBTSxNQUFPLFNBQVEsZ0NBQXNCO0lBRTFDOztPQUVHO0lBQ0gsWUFBYSxNQUFjO1FBQzFCLEtBQUssQ0FBQyxJQUFJLHFCQUFXLENBQUM7WUFDckIsQ0FBQyxxQkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7U0FDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsaUJBQWlCLENBQUUsZUFBZSxFQUFFLElBQUk7UUFDdkMsbUJBQW1CO1FBQ25CLElBQUksK0JBQStCLEdBQUcscUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDBCQUEwQixDQUFDO1lBQ3ZGLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDcEMsT0FBTywrQkFBK0IsQ0FBQztJQUN4QyxDQUFDO0lBRUQsU0FBUztRQUNSLE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUM7Q0FDRDtBQUVELGtCQUFlLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXN0QWJzdHJhY3RFeHByZXNzaW9uIGZyb20gJy4vVGVzdEFic3RyYWN0RXhwcmVzc2lvbic7XG5pbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vU3BlY2lmaWNpdHknO1xuaW1wb3J0IGlzU3VidHlwZU9mIGZyb20gJy4uL2RhdGFUeXBlcy9pc1N1YnR5cGVPZic7XG5cbmNsYXNzIFBJVGVzdCBleHRlbmRzIFRlc3RBYnN0cmFjdEV4cHJlc3Npb24ge1xuXHRfdGFyZ2V0OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBAcGFyYW0gIHtzdHJpbmd9ICB0YXJnZXRcblx0ICovXG5cdGNvbnN0cnVjdG9yICh0YXJnZXQ6IHN0cmluZykge1xuXHRcdHN1cGVyKG5ldyBTcGVjaWZpY2l0eSh7XG5cdFx0XHRbU3BlY2lmaWNpdHkuTk9ERU5BTUVfS0lORF06IDFcblx0XHR9KSk7XG5cblx0XHR0aGlzLl90YXJnZXQgPSB0YXJnZXQ7XG5cdH1cblxuXHRldmFsdWF0ZVRvQm9vbGVhbiAoX2R5bmFtaWNDb250ZXh0LCBub2RlKSB7XG5cdFx0Ly8gQXNzdW1lIHNpbmdsZXRvblxuXHRcdHZhciBpc01hdGNoaW5nUHJvY2Vzc2luZ0luc3RydWN0aW9uID0gaXNTdWJ0eXBlT2Yobm9kZS50eXBlLCAncHJvY2Vzc2luZy1pbnN0cnVjdGlvbigpJykgJiZcblx0XHRcdG5vZGUudmFsdWUudGFyZ2V0ID09PSB0aGlzLl90YXJnZXQ7XG5cdFx0cmV0dXJuIGlzTWF0Y2hpbmdQcm9jZXNzaW5nSW5zdHJ1Y3Rpb247XG5cdH1cblxuXHRnZXRCdWNrZXQgKCkge1xuXHRcdHJldHVybiAndHlwZS03Jztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQSVRlc3Q7XG4iXX0=