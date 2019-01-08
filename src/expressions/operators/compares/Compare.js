"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequenceFactory_1 = require("../../dataTypes/SequenceFactory");
const Expression_1 = require("../../Expression");
const generalCompare_1 = require("./generalCompare");
const nodeCompare_1 = require("./nodeCompare");
const valueCompare_1 = require("./valueCompare");
class Compare extends Expression_1.default {
    constructor(kind, firstExpression, secondExpression) {
        super(firstExpression.specificity.add(secondExpression.specificity), [firstExpression, secondExpression], {
            canBeStaticallyEvaluated: false
        });
        this._firstExpression = firstExpression;
        this._secondExpression = secondExpression;
        switch (kind) {
            case 'equalOp':
            case 'notEqualOp':
            case 'lessThanOrEqualOp':
            case 'lessThanOp':
            case 'greaterThanOrEqualOp':
            case 'greaterThanOp':
                this._compare = 'generalCompare';
                break;
            case 'eqOp':
            case 'neOp':
            case 'ltOp':
            case 'leOp':
            case 'gtOp':
            case 'geOp':
                this._compare = 'valueCompare';
                break;
            default:
                this._compare = 'nodeCompare';
        }
        this._operator = kind;
    }
    evaluate(dynamicContext, executionParameters) {
        const firstSequence = this._firstExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
        const secondSequence = this._secondExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
        return firstSequence.switchCases({
            empty: () => {
                if (this._compare === 'valueCompare' || this._compare === 'nodeCompare') {
                    return SequenceFactory_1.default.empty();
                }
                return SequenceFactory_1.default.singletonFalseSequence();
            },
            default: () => secondSequence.switchCases({
                empty: () => {
                    if (this._compare === 'valueCompare' || this._compare === 'nodeCompare') {
                        return SequenceFactory_1.default.empty();
                    }
                    return SequenceFactory_1.default.singletonFalseSequence();
                },
                default: () => {
                    if (this._compare === 'nodeCompare') {
                        return nodeCompare_1.default(this._operator, executionParameters.domFacade, firstSequence, secondSequence);
                    }
                    // Atomize both sequences
                    const firstAtomizedSequence = firstSequence.atomize(executionParameters);
                    const secondAtomizedSequence = secondSequence.atomize(executionParameters);
                    if (this._compare === 'valueCompare') {
                        return firstAtomizedSequence.switchCases({
                            singleton: () => secondAtomizedSequence.switchCases({
                                singleton: () => firstAtomizedSequence.mapAll(([onlyFirstValue]) => secondAtomizedSequence.mapAll(([onlySecondValue]) => valueCompare_1.default(this._operator, onlyFirstValue, onlySecondValue, dynamicContext) ?
                                    SequenceFactory_1.default.singletonTrueSequence() :
                                    SequenceFactory_1.default.singletonFalseSequence())),
                                default: (() => {
                                    throw new Error('XPTY0004: Sequences to compare are not singleton.');
                                })
                            }),
                            default: (() => {
                                throw new Error('XPTY0004: Sequences to compare are not singleton.');
                            })
                        });
                    }
                    // Only generalCompare left
                    return generalCompare_1.default(this._operator, firstAtomizedSequence, secondAtomizedSequence, dynamicContext);
                }
            })
        });
    }
}
exports.default = Compare;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbXBhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxRUFBOEQ7QUFDOUQsaURBQTBDO0FBQzFDLHFEQUE4QztBQUM5QywrQ0FBd0M7QUFDeEMsaURBQTBDO0FBRTFDLE1BQU0sT0FBUSxTQUFRLG9CQUFVO0lBTTVCLFlBQVksSUFBWSxFQUFFLGVBQTJCLEVBQUUsZ0JBQTRCO1FBQ3JGLEtBQUssQ0FDSixlQUFlLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFDN0QsQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsRUFDbkM7WUFDQyx3QkFBd0IsRUFBRSxLQUFLO1NBQy9CLENBQUMsQ0FBQztRQUNKLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBRTFDLFFBQVEsSUFBSSxFQUFFO1lBQ2IsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLG1CQUFtQixDQUFDO1lBQ3pCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssc0JBQXNCLENBQUM7WUFDNUIsS0FBSyxlQUFlO2dCQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLGdCQUFnQixDQUFDO2dCQUNqQyxNQUFNO1lBQ1AsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssTUFBTTtnQkFDVixJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQztnQkFDL0IsTUFBTTtZQUNQO2dCQUNDLElBQUksQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDO1NBQy9CO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FB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cG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgRXhwcmVzc2lvbiBmcm9tICcuLi8uLi9FeHByZXNzaW9uJztcbmltcG9ydCBnZW5lcmFsQ29tcGFyZSBmcm9tICcuL2dlbmVyYWxDb21wYXJlJztcbmltcG9ydCBub2RlQ29tcGFyZSBmcm9tICcuL25vZGVDb21wYXJlJztcbmltcG9ydCB2YWx1ZUNvbXBhcmUgZnJvbSAnLi92YWx1ZUNvbXBhcmUnO1xuXG5jbGFzcyBDb21wYXJlIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gICAgX2ZpcnN0RXhwcmVzc2lvbjogRXhwcmVzc2lvbjtcbiAgICBfc2Vjb25kRXhwcmVzc2lvbjogRXhwcmVzc2lvbjtcbiAgICBfb3BlcmF0b3I6IHN0cmluZztcblx0X2NvbXBhcmU6ICdnZW5lcmFsQ29tcGFyZSd8J3ZhbHVlQ29tcGFyZSd8J25vZGVDb21wYXJlJztcblxuICAgIGNvbnN0cnVjdG9yKGtpbmQ6IHN0cmluZywgZmlyc3RFeHByZXNzaW9uOiBFeHByZXNzaW9uLCBzZWNvbmRFeHByZXNzaW9uOiBFeHByZXNzaW9uKSB7XG5cdFx0c3VwZXIoXG5cdFx0XHRmaXJzdEV4cHJlc3Npb24uc3BlY2lmaWNpdHkuYWRkKHNlY29uZEV4cHJlc3Npb24uc3BlY2lmaWNpdHkpLFxuXHRcdFx0W2ZpcnN0RXhwcmVzc2lvbiwgc2Vjb25kRXhwcmVzc2lvbl0sXG5cdFx0XHR7XG5cdFx0XHRcdGNhbkJlU3RhdGljYWxseUV2YWx1YXRlZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdHRoaXMuX2ZpcnN0RXhwcmVzc2lvbiA9IGZpcnN0RXhwcmVzc2lvbjtcblx0XHR0aGlzLl9zZWNvbmRFeHByZXNzaW9uID0gc2Vjb25kRXhwcmVzc2lvbjtcblxuXHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0Y2FzZSAnZXF1YWxPcCc6XG5cdFx0XHRjYXNlICdub3RFcXVhbE9wJzpcblx0XHRcdGNhc2UgJ2xlc3NUaGFuT3JFcXVhbE9wJzpcblx0XHRcdGNhc2UgJ2xlc3NUaGFuT3AnOlxuXHRcdFx0Y2FzZSAnZ3JlYXRlclRoYW5PckVxdWFsT3AnOlxuXHRcdFx0Y2FzZSAnZ3JlYXRlclRoYW5PcCc6XG5cdFx0XHRcdHRoaXMuX2NvbXBhcmUgPSAnZ2VuZXJhbENvbXBhcmUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2VxT3AnOlxuXHRcdFx0Y2FzZSAnbmVPcCc6XG5cdFx0XHRjYXNlICdsdE9wJzpcblx0XHRcdGNhc2UgJ2xlT3AnOlxuXHRcdFx0Y2FzZSAnZ3RPcCc6XG5cdFx0XHRjYXNlICdnZU9wJzpcblx0XHRcdFx0dGhpcy5fY29tcGFyZSA9ICd2YWx1ZUNvbXBhcmUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMuX2NvbXBhcmUgPSAnbm9kZUNvbXBhcmUnO1xuXHRcdH1cblxuXHRcdHRoaXMuX29wZXJhdG9yID0ga2luZDtcblx0fVxuXG5cdGV2YWx1YXRlIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGZpcnN0U2VxdWVuY2UgPSB0aGlzLl9maXJzdEV4cHJlc3Npb24uZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHRcdGNvbnN0IHNlY29uZFNlcXVlbmNlID0gdGhpcy5fc2Vjb25kRXhwcmVzc2lvbi5ldmFsdWF0ZU1heWJlU3RhdGljYWxseShkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycyk7XG5cblx0XHRyZXR1cm4gZmlyc3RTZXF1ZW5jZS5zd2l0Y2hDYXNlcyh7XG5cdFx0XHRlbXB0eTogKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5fY29tcGFyZSA9PT0gJ3ZhbHVlQ29tcGFyZScgfHwgdGhpcy5fY29tcGFyZSA9PT0gJ25vZGVDb21wYXJlJykge1xuXHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbkZhbHNlU2VxdWVuY2UoKTtcblx0XHRcdH0sXG5cdFx0XHRkZWZhdWx0OiAoKSA9PiBzZWNvbmRTZXF1ZW5jZS5zd2l0Y2hDYXNlcyh7XG5cdFx0XHRcdGVtcHR5OiAoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX2NvbXBhcmUgPT09ICd2YWx1ZUNvbXBhcmUnIHx8IHRoaXMuX2NvbXBhcmUgPT09ICdub2RlQ29tcGFyZScpIHtcblx0XHRcdFx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25GYWxzZVNlcXVlbmNlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRlZmF1bHQ6ICgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5fY29tcGFyZSA9PT0gJ25vZGVDb21wYXJlJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG5vZGVDb21wYXJlKHRoaXMuX29wZXJhdG9yLCBleGVjdXRpb25QYXJhbWV0ZXJzLmRvbUZhY2FkZSwgZmlyc3RTZXF1ZW5jZSwgc2Vjb25kU2VxdWVuY2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBBdG9taXplIGJvdGggc2VxdWVuY2VzXG5cdFx0XHRcdFx0Y29uc3QgZmlyc3RBdG9taXplZFNlcXVlbmNlID0gZmlyc3RTZXF1ZW5jZS5hdG9taXplKGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdGNvbnN0IHNlY29uZEF0b21pemVkU2VxdWVuY2UgPSBzZWNvbmRTZXF1ZW5jZS5hdG9taXplKGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuX2NvbXBhcmUgPT09ICd2YWx1ZUNvbXBhcmUnKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmlyc3RBdG9taXplZFNlcXVlbmNlLnN3aXRjaENhc2VzKHtcblx0XHRcdFx0XHRcdFx0c2luZ2xldG9uOiAoKSA9PiBzZWNvbmRBdG9taXplZFNlcXVlbmNlLnN3aXRjaENhc2VzKHtcblx0XHRcdFx0XHRcdFx0XHRzaW5nbGV0b246ICgpID0+IGZpcnN0QXRvbWl6ZWRTZXF1ZW5jZS5tYXBBbGwoXG5cdFx0XHRcdFx0XHRcdFx0XHQoW29ubHlGaXJzdFZhbHVlXSkgPT4gc2Vjb25kQXRvbWl6ZWRTZXF1ZW5jZS5tYXBBbGwoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChbb25seVNlY29uZFZhbHVlXSkgPT4gdmFsdWVDb21wYXJlKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX29wZXJhdG9yLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9ubHlGaXJzdFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9ubHlTZWNvbmRWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkeW5hbWljQ29udGV4dCkgP1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25UcnVlU2VxdWVuY2UoKSA6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0U2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbkZhbHNlU2VxdWVuY2UoKSkpLFxuXHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6ICgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1hQVFkwMDA0OiBTZXF1ZW5jZXMgdG8gY29tcGFyZSBhcmUgbm90IHNpbmdsZXRvbi4nKTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0ZGVmYXVsdDogKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1hQVFkwMDA0OiBTZXF1ZW5jZXMgdG8gY29tcGFyZSBhcmUgbm90IHNpbmdsZXRvbi4nKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBPbmx5IGdlbmVyYWxDb21wYXJlIGxlZnRcblx0XHRcdFx0XHRyZXR1cm4gZ2VuZXJhbENvbXBhcmUodGhpcy5fb3BlcmF0b3IsIGZpcnN0QXRvbWl6ZWRTZXF1ZW5jZSwgc2Vjb25kQXRvbWl6ZWRTZXF1ZW5jZSwgZHluYW1pY0NvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBhcmU7XG4iXX0=