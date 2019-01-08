"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Specificity_1 = require("../Specificity");
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
const documentOrderUtils_1 = require("../dataTypes/documentOrderUtils");
const concatSequences_1 = require("../util/concatSequences");
/**
 * The 'union' expression: concats and sorts
 * @extends {Expression}
 */
class Union extends Expression_1.default {
    /**
     * @param  {!Array<!Expression>}  expressions
     */
    constructor(expressions) {
        const maxSpecificity = expressions.reduce((maxSpecificity, expression) => {
            if (maxSpecificity.compareTo(expression.specificity) > 0) {
                return maxSpecificity;
            }
            return expression.specificity;
        }, new Specificity_1.default({}));
        super(maxSpecificity, expressions, {
            canBeStaticallyEvaluated: expressions.every(expression => expression.canBeStaticallyEvaluated)
        });
        this._subExpressions = expressions;
    }
    evaluate(dynamicContext, executionParameters) {
        return concatSequences_1.default(this._subExpressions.map(expression => expression.evaluateMaybeStatically(dynamicContext, executionParameters)))
            .mapAll(allValues => {
            if (allValues.some(nodeValue => !isSubtypeOf_1.default(nodeValue.type, 'node()'))) {
                throw new Error('XPTY0004: The sequences to union are not of type node()*');
            }
            const sortedValues = documentOrderUtils_1.sortNodeValues(executionParameters.domFacade, allValues);
            return SequenceFactory_1.default.create(sortedValues);
        });
    }
}
exports.default = Union;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVbmlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUF5QztBQUN6Qyw4Q0FBdUM7QUFDdkMsa0VBQTJEO0FBQzNELDBEQUFtRDtBQUNuRCx3RUFBaUU7QUFDakUsNkRBQXNEO0FBRXREOzs7R0FHRztBQUNILE1BQU0sS0FBTSxTQUFRLG9CQUFVO0lBQzdCOztPQUVHO0lBQ0gsWUFBYSxXQUFXO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLEVBQUU7WUFDeEUsSUFBSSxjQUFjLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pELE9BQU8sY0FBYyxDQUFDO2FBQ3RCO1lBQ0QsT0FBTyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBQy9CLENBQUMsRUFBRSxJQUFJLHFCQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QixLQUFLLENBQ0osY0FBYyxFQUNkLFdBQVcsRUFDWDtZQUNDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUM7U0FDOUYsQ0FBQyxDQUFDO1FBRUwsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFFbkMsQ0FBQztJQUVELFFBQVEsQ0FBRSxjQUFjLEVBQUUsbUJBQW1CO1FBQzVDLE9BQU8seUJBQWUsQ0FDckIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQ3ZCLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7YUFDdkYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ25CLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMscUJBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hFLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQzthQUM1RTtZQUNELE1BQU0sWUFBWSxHQUFHLG1DQUFjLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlFLE9BQU8seUJBQWUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Q7QUFDRCxrQkFBZSxLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vU3BlY2lmaWNpdHknO1xuaW1wb3J0IEV4cHJlc3Npb24gZnJvbSAnLi4vRXhwcmVzc2lvbic7XG5pbXBvcnQgU2VxdWVuY2VGYWN0b3J5IGZyb20gJy4uL2RhdGFUeXBlcy9TZXF1ZW5jZUZhY3RvcnknO1xuaW1wb3J0IGlzU3VidHlwZU9mIGZyb20gJy4uL2RhdGFUeXBlcy9pc1N1YnR5cGVPZic7XG5pbXBvcnQgeyBzb3J0Tm9kZVZhbHVlcyB9IGZyb20gJy4uL2RhdGFUeXBlcy9kb2N1bWVudE9yZGVyVXRpbHMnO1xuaW1wb3J0IGNvbmNhdFNlcXVlbmNlcyBmcm9tICcuLi91dGlsL2NvbmNhdFNlcXVlbmNlcyc7XG5cbi8qKlxuICogVGhlICd1bmlvbicgZXhwcmVzc2lvbjogY29uY2F0cyBhbmQgc29ydHNcbiAqIEBleHRlbmRzIHtFeHByZXNzaW9ufVxuICovXG5jbGFzcyBVbmlvbiBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHQvKipcblx0ICogQHBhcmFtICB7IUFycmF5PCFFeHByZXNzaW9uPn0gIGV4cHJlc3Npb25zXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAoZXhwcmVzc2lvbnMpIHtcblx0XHRjb25zdCBtYXhTcGVjaWZpY2l0eSA9IGV4cHJlc3Npb25zLnJlZHVjZSgobWF4U3BlY2lmaWNpdHksIGV4cHJlc3Npb24pID0+IHtcblx0XHRcdGlmIChtYXhTcGVjaWZpY2l0eS5jb21wYXJlVG8oZXhwcmVzc2lvbi5zcGVjaWZpY2l0eSkgPiAwKSB7XG5cdFx0XHRcdHJldHVybiBtYXhTcGVjaWZpY2l0eTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBleHByZXNzaW9uLnNwZWNpZmljaXR5O1xuXHRcdH0sIG5ldyBTcGVjaWZpY2l0eSh7fSkpO1xuXHRcdHN1cGVyKFxuXHRcdFx0bWF4U3BlY2lmaWNpdHksXG5cdFx0XHRleHByZXNzaW9ucyxcblx0XHRcdHtcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBleHByZXNzaW9ucy5ldmVyeShleHByZXNzaW9uID0+IGV4cHJlc3Npb24uY2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkKVxuXHRcdFx0fSk7XG5cblx0dGhpcy5fc3ViRXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcblxuXHR9XG5cblx0ZXZhbHVhdGUgKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0cmV0dXJuIGNvbmNhdFNlcXVlbmNlcyhcblx0XHRcdHRoaXMuX3N1YkV4cHJlc3Npb25zLm1hcChcblx0XHRcdFx0ZXhwcmVzc2lvbiA9PiBleHByZXNzaW9uLmV2YWx1YXRlTWF5YmVTdGF0aWNhbGx5KGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSkpXG5cdFx0XHQubWFwQWxsKGFsbFZhbHVlcyA9PiB7XG5cdFx0XHRcdGlmIChhbGxWYWx1ZXMuc29tZShub2RlVmFsdWUgPT4gIWlzU3VidHlwZU9mKG5vZGVWYWx1ZS50eXBlLCAnbm9kZSgpJykpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUFRZMDAwNDogVGhlIHNlcXVlbmNlcyB0byB1bmlvbiBhcmUgbm90IG9mIHR5cGUgbm9kZSgpKicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNvcnRlZFZhbHVlcyA9IHNvcnROb2RlVmFsdWVzKGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLCBhbGxWYWx1ZXMpO1xuXHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZShzb3J0ZWRWYWx1ZXMpO1xuXHRcdFx0fSk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IFVuaW9uO1xuIl19