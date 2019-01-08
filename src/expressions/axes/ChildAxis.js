"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
class ChildAxis extends Expression_1.default {
    constructor(childExpression) {
        super(childExpression.specificity, [childExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.SORTED,
            subtree: true,
            peer: true,
            canBeStaticallyEvaluated: false
        });
        this._childExpression = childExpression;
    }
    evaluate(dynamicContext, executionParameters) {
        const contextItem = dynamicContext.contextItem;
        if (contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
        }
        const domFacade = executionParameters.domFacade;
        const /** !Node */ contextNode = contextItem.value;
        const nodeValues = domFacade.getChildNodes(contextNode).map(createNodeValue_1.default);
        const childContextSequence = SequenceFactory_1.default.create(nodeValues);
        return childContextSequence.filter(item => {
            return this._childExpression.evaluateToBoolean(dynamicContext, item);
        });
    }
}
exports.default = ChildAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hpbGRBeGlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ2hpbGRBeGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXVDO0FBQ3ZDLGtFQUEyRDtBQUMzRCxrRUFBMkQ7QUFHM0QsTUFBTSxTQUFVLFNBQVEsb0JBQVU7SUFFakMsWUFBWSxlQUF1QztRQUNsRCxLQUFLLENBQ0osZUFBZSxDQUFDLFdBQVcsRUFDM0IsQ0FBQyxlQUFlLENBQUMsRUFDakI7WUFDQyxXQUFXLEVBQUUsb0JBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNO1lBQy9DLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLElBQUk7WUFDVix3QkFBd0IsRUFBRSxLQUFLO1NBQy9CLENBQUMsQ0FBQztRQUVKLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7SUFDekMsQ0FBQztJQUVELFFBQVEsQ0FBRSxjQUFjLEVBQUUsbUJBQW1CO1FBQzVDLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUM7UUFDL0MsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQztTQUNwRjtRQUNELE1BQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQztRQUNoRCxNQUFNLFlBQVksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUNuRCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyx5QkFBZSxDQUFDLENBQUM7UUFDN0UsTUFBTSxvQkFBb0IsR0FBRyx5QkFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRSxPQUFPLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFDRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi9FeHByZXNzaW9uJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgY3JlYXRlTm9kZVZhbHVlIGZyb20gJy4uL2RhdGFUeXBlcy9jcmVhdGVOb2RlVmFsdWUnO1xuaW1wb3J0IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24gZnJvbSAnLi4vdGVzdHMvVGVzdEFic3RyYWN0RXhwcmVzc2lvbic7XG5cbmNsYXNzIENoaWxkQXhpcyBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHRfY2hpbGRFeHByZXNzaW9uOiBUZXN0QWJzdHJhY3RFeHByZXNzaW9uO1xuXHRjb25zdHJ1Y3RvcihjaGlsZEV4cHJlc3Npb246IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24pIHtcblx0XHRzdXBlcihcblx0XHRcdGNoaWxkRXhwcmVzc2lvbi5zcGVjaWZpY2l0eSxcblx0XHRcdFtjaGlsZEV4cHJlc3Npb25dLFxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHRPcmRlcjogRXhwcmVzc2lvbi5SRVNVTFRfT1JERVJJTkdTLlNPUlRFRCxcblx0XHRcdFx0c3VidHJlZTogdHJ1ZSxcblx0XHRcdFx0cGVlcjogdHJ1ZSxcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBmYWxzZVxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLl9jaGlsZEV4cHJlc3Npb24gPSBjaGlsZEV4cHJlc3Npb247XG5cdH1cblxuXHRldmFsdWF0ZSAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRjb25zdCBjb250ZXh0SXRlbSA9IGR5bmFtaWNDb250ZXh0LmNvbnRleHRJdGVtO1xuXHRcdGlmIChjb250ZXh0SXRlbSA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUERZMDAwMjogY29udGV4dCBpcyBhYnNlbnQsIGl0IG5lZWRzIHRvIGJlIHByZXNlbnQgdG8gdXNlIGF4ZXMuJyk7XG5cdFx0fVxuXHRcdGNvbnN0IGRvbUZhY2FkZSA9IGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlO1xuXHRcdGNvbnN0IC8qKiAhTm9kZSAqLyBjb250ZXh0Tm9kZSA9IGNvbnRleHRJdGVtLnZhbHVlO1xuXHRcdGNvbnN0IG5vZGVWYWx1ZXMgPSBkb21GYWNhZGUuZ2V0Q2hpbGROb2Rlcyhjb250ZXh0Tm9kZSkubWFwKGNyZWF0ZU5vZGVWYWx1ZSk7XG5cdFx0Y29uc3QgY2hpbGRDb250ZXh0U2VxdWVuY2UgPSBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKG5vZGVWYWx1ZXMpO1xuXHRcdHJldHVybiBjaGlsZENvbnRleHRTZXF1ZW5jZS5maWx0ZXIoaXRlbSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9jaGlsZEV4cHJlc3Npb24uZXZhbHVhdGVUb0Jvb2xlYW4oZHluYW1pY0NvbnRleHQsIGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBDaGlsZEF4aXM7XG4iXX0=