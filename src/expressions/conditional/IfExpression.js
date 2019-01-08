"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PossiblyUpdatingExpression_1 = require("../PossiblyUpdatingExpression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
class IfExpression extends PossiblyUpdatingExpression_1.default {
    constructor(testExpression, thenExpression, elseExpression) {
        const specificity = testExpression.specificity
            .add(thenExpression.specificity)
            .add(elseExpression.specificity);
        super(specificity, [testExpression, thenExpression, elseExpression], {
            resultOrder: thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
                thenExpression.expectedResultOrder : PossiblyUpdatingExpression_1.default.RESULT_ORDERINGS.UNSORTED,
            peer: thenExpression.peer === elseExpression.peer && thenExpression.peer,
            subtree: thenExpression.subtree === elseExpression.subtree && thenExpression.subtree,
            canBeStaticallyEvaluated: testExpression.canBeStaticallyEvaluated && thenExpression.canBeStaticallyEvaluated && elseExpression.canBeStaticallyEvaluated
        });
    }
    performFunctionalEvaluation(dynamicContext, _executionParameters, sequenceCallbacks) {
        let resultIterator = null;
        const ifExpressionResultSequence = sequenceCallbacks[0](dynamicContext);
        return SequenceFactory_1.default.create({
            next: () => {
                if (!resultIterator) {
                    const ifExpressionResult = ifExpressionResultSequence.tryGetEffectiveBooleanValue();
                    if (!ifExpressionResult.ready) {
                        return ifExpressionResult;
                    }
                    const resultSequence = ifExpressionResult.value ?
                        sequenceCallbacks[1](dynamicContext) :
                        sequenceCallbacks[2](dynamicContext);
                    resultIterator = resultSequence.value;
                }
                return resultIterator.next();
            }
        });
    }
}
exports.default = IfExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWZFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSWZFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOEVBQXVFO0FBRXZFLGtFQUEyRDtBQUUzRCxNQUFNLFlBQWEsU0FBUSxvQ0FBMEI7SUFDcEQsWUFBWSxjQUEwQixFQUFFLGNBQTBDLEVBQUUsY0FBMEM7UUFDN0gsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLFdBQVc7YUFDNUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7YUFDL0IsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsQyxLQUFLLENBQ0osV0FBVyxFQUNYLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsRUFDaEQ7WUFDQyxXQUFXLEVBQUUsY0FBYyxDQUFDLG1CQUFtQixLQUFLLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN2RixjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG9DQUEwQixDQUFDLGdCQUFnQixDQUFDLFFBQVE7WUFDMUYsSUFBSSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDLElBQUksSUFBSSxjQUFjLENBQUMsSUFBSTtZQUN4RSxPQUFPLEVBQUUsY0FBYyxDQUFDLE9BQU8sS0FBSyxjQUFjLENBQUMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxPQUFPO1lBQ3BGLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyx3QkFBd0IsSUFBSSxjQUFjLENBQUMsd0JBQXdCLElBQUksY0FBYyxDQUFDLHdCQUF3QjtTQUN2SixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsMkJBQTJCLENBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQjtRQUNuRixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDMUIsTUFBTSwwQkFBMEIsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4RSxPQUFPLHlCQUFlLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLGNBQWMsRUFBRTtvQkFDcEIsTUFBTSxrQkFBa0IsR0FBRywwQkFBMEIsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO29CQUVwRixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFO3dCQUM5QixPQUFPLGtCQUFrQixDQUFDO3FCQUMxQjtvQkFDRCxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDaEQsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzt3QkFDdEMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3RDLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDO2lCQUN0QztnQkFDRCxPQUFPLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5QixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBRUosQ0FBQztDQUNEO0FBRUQsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBvc3NpYmx5VXBkYXRpbmdFeHByZXNzaW9uIGZyb20gJy4uL1Bvc3NpYmx5VXBkYXRpbmdFeHByZXNzaW9uJztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcblxuY2xhc3MgSWZFeHByZXNzaW9uIGV4dGVuZHMgUG9zc2libHlVcGRhdGluZ0V4cHJlc3Npb24ge1xuXHRjb25zdHJ1Y3Rvcih0ZXN0RXhwcmVzc2lvbjogRXhwcmVzc2lvbiwgdGhlbkV4cHJlc3Npb246IFBvc3NpYmx5VXBkYXRpbmdFeHByZXNzaW9uLCBlbHNlRXhwcmVzc2lvbjogUG9zc2libHlVcGRhdGluZ0V4cHJlc3Npb24pIHtcblx0XHRjb25zdCBzcGVjaWZpY2l0eSA9IHRlc3RFeHByZXNzaW9uLnNwZWNpZmljaXR5XG5cdFx0XHQuYWRkKHRoZW5FeHByZXNzaW9uLnNwZWNpZmljaXR5KVxuXHRcdFx0LmFkZChlbHNlRXhwcmVzc2lvbi5zcGVjaWZpY2l0eSk7XG5cdFx0c3VwZXIoXG5cdFx0XHRzcGVjaWZpY2l0eSxcblx0XHRcdFt0ZXN0RXhwcmVzc2lvbiwgdGhlbkV4cHJlc3Npb24sIGVsc2VFeHByZXNzaW9uXSxcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0T3JkZXI6IHRoZW5FeHByZXNzaW9uLmV4cGVjdGVkUmVzdWx0T3JkZXIgPT09IGVsc2VFeHByZXNzaW9uLmV4cGVjdGVkUmVzdWx0T3JkZXIgP1xuXHRcdFx0XHRcdHRoZW5FeHByZXNzaW9uLmV4cGVjdGVkUmVzdWx0T3JkZXIgOiBQb3NzaWJseVVwZGF0aW5nRXhwcmVzc2lvbi5SRVNVTFRfT1JERVJJTkdTLlVOU09SVEVELFxuXHRcdFx0XHRwZWVyOiB0aGVuRXhwcmVzc2lvbi5wZWVyID09PSBlbHNlRXhwcmVzc2lvbi5wZWVyICYmIHRoZW5FeHByZXNzaW9uLnBlZXIsXG5cdFx0XHRcdHN1YnRyZWU6IHRoZW5FeHByZXNzaW9uLnN1YnRyZWUgPT09IGVsc2VFeHByZXNzaW9uLnN1YnRyZWUgJiYgdGhlbkV4cHJlc3Npb24uc3VidHJlZSxcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiB0ZXN0RXhwcmVzc2lvbi5jYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQgJiYgdGhlbkV4cHJlc3Npb24uY2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkICYmIGVsc2VFeHByZXNzaW9uLmNhbkJlU3RhdGljYWxseUV2YWx1YXRlZFxuXHRcdFx0fSk7XG5cdH1cblxuXHRwZXJmb3JtRnVuY3Rpb25hbEV2YWx1YXRpb24gKGR5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgc2VxdWVuY2VDYWxsYmFja3MpIHtcblx0XHRsZXQgcmVzdWx0SXRlcmF0b3IgPSBudWxsO1xuXHRcdGNvbnN0IGlmRXhwcmVzc2lvblJlc3VsdFNlcXVlbmNlID0gc2VxdWVuY2VDYWxsYmFja3NbMF0oZHluYW1pY0NvbnRleHQpO1xuXHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKHtcblx0XHRcdG5leHQ6ICgpID0+IHtcblx0XHRcdFx0aWYgKCFyZXN1bHRJdGVyYXRvcikge1xuXHRcdFx0XHRcdGNvbnN0IGlmRXhwcmVzc2lvblJlc3VsdCA9IGlmRXhwcmVzc2lvblJlc3VsdFNlcXVlbmNlLnRyeUdldEVmZmVjdGl2ZUJvb2xlYW5WYWx1ZSgpO1xuXG5cdFx0XHRcdFx0aWYgKCFpZkV4cHJlc3Npb25SZXN1bHQucmVhZHkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBpZkV4cHJlc3Npb25SZXN1bHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdFNlcXVlbmNlID0gaWZFeHByZXNzaW9uUmVzdWx0LnZhbHVlID9cblx0XHRcdFx0XHRcdHNlcXVlbmNlQ2FsbGJhY2tzWzFdKGR5bmFtaWNDb250ZXh0KSA6XG5cdFx0XHRcdFx0XHRzZXF1ZW5jZUNhbGxiYWNrc1syXShkeW5hbWljQ29udGV4dCk7XG5cdFx0XHRcdFx0cmVzdWx0SXRlcmF0b3IgPSByZXN1bHRTZXF1ZW5jZS52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0SXRlcmF0b3IubmV4dCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSWZFeHByZXNzaW9uO1xuIl19