"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
/**
 * @extends {Expression}
 */
class QuantifiedExpression extends Expression_1.default {
    /**
     * @param  {string}              quantifier
     * @param  {!Array<InClause>}    inClauses
     * @param  {!Expression}         satisfiesExpr
     */
    constructor(quantifier, inClauses, satisfiesExpr) {
        const inClauseExpressions = inClauses.map(inClause => inClause.sourceExpr);
        const inClauseNames = inClauses.map(inClause => inClause.name);
        const specificity = inClauseExpressions.reduce((specificity, inClause) => specificity.add(inClause.specificity), satisfiesExpr.specificity);
        super(specificity, inClauseExpressions.concat(satisfiesExpr), {
            canBeStaticallyEvaluated: false
        });
        this._quantifier = quantifier;
        this._inClauseNames = inClauseNames;
        this._inClauseExpressions = inClauseExpressions;
        this._satisfiesExpr = satisfiesExpr;
        this._inClauseVariableNames = null;
    }
    performStaticEvaluation(staticContext) {
        this._inClauseVariableNames = [];
        for (let i = 0, l = this._inClauseNames.length; i < l; ++i) {
            const expr = this._inClauseExpressions[i];
            expr.performStaticEvaluation(staticContext);
            // The existance of this variable should be known for the next expression
            staticContext.introduceScope();
            const inClauseName = this._inClauseNames[i];
            const inClauseNameNamespaceURI = inClauseName.prefix ? staticContext.resolveNamespace(inClauseName.prefix) : null;
            const varBindingName = staticContext.registerVariable(inClauseNameNamespaceURI, inClauseName.localName);
            this._inClauseVariableNames[i] = varBindingName;
        }
        this._satisfiesExpr.performStaticEvaluation(staticContext);
        for (let i = 0, l = this._inClauseNames.length; i < l; ++i) {
            staticContext.removeScope();
        }
    }
    evaluate(dynamicContext, executionParameters) {
        let scopingContext = dynamicContext;
        const evaluatedInClauses = this._inClauseVariableNames.map((variableBinding, i) => {
            const allValuesInInClause = this._inClauseExpressions[i]
                .evaluateMaybeStatically(scopingContext, executionParameters).getAllValues();
            scopingContext = dynamicContext.scopeWithVariableBindings({
                [variableBinding]: () => SequenceFactory_1.default.create(allValuesInInClause)
            });
            return allValuesInInClause;
        });
        const indices = new Array(evaluatedInClauses.length).fill(0);
        indices[0] = -1;
        let hasOverflowed = true;
        while (hasOverflowed) {
            hasOverflowed = false;
            for (let i = 0, l = indices.length; i < l; ++i) {
                const valueArray = evaluatedInClauses[i];
                if (++indices[i] > valueArray.length - 1) {
                    indices[i] = 0;
                    continue;
                }
                const variables = Object.create(null);
                for (let y = 0; y < indices.length; y++) {
                    const value = evaluatedInClauses[y][indices[y]];
                    variables[this._inClauseVariableNames[y]] = () => SequenceFactory_1.default.singleton(value);
                }
                const context = dynamicContext.scopeWithVariableBindings(variables);
                const result = this._satisfiesExpr.evaluateMaybeStatically(context, executionParameters);
                if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
                    return SequenceFactory_1.default.singletonTrueSequence();
                }
                else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
                    return SequenceFactory_1.default.singletonFalseSequence();
                }
                hasOverflowed = true;
                break;
            }
        }
        // An every quantifier is true if all items match, a some is false if none of the items match
        return this._quantifier === 'every' ? SequenceFactory_1.default.singletonTrueSequence() : SequenceFactory_1.default.singletonFalseSequence();
    }
}
exports.default = QuantifiedExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVhbnRpZmllZEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJRdWFudGlmaWVkRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxrRUFBMkQ7QUFJM0Q7O0dBRUc7QUFDSCxNQUFNLG9CQUFxQixTQUFRLG9CQUFVO0lBTTVDOzs7O09BSUc7SUFDSCxZQUFZLFVBQWtCLEVBQUUsU0FBMEIsRUFBRSxhQUF5QjtRQUNwRixNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0UsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUvRCxNQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQzdDLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQ2hFLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1QixLQUFLLENBQ0osV0FBVyxFQUNYLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFDekM7WUFDQyx3QkFBd0IsRUFBRSxLQUFLO1NBQy9CLENBQUMsQ0FBQztRQUVKLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztRQUNoRCxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztRQUVwQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0lBQ3BDLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxhQUFhO1FBQ3BDLElBQUksQ0FB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ICcuLi9FeHByZXNzaW9uJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5cbnR5cGUgSW5DbGF1c2UgPSB7IG5hbWU6IHsgcHJlZml4OiBzdHJpbmcsIG5hbWVzcGFjZVVSSTogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZyB9LCBzb3VyY2VFeHByOiBFeHByZXNzaW9uIH07XG5cbi8qKlxuICogQGV4dGVuZHMge0V4cHJlc3Npb259XG4gKi9cbmNsYXNzIFF1YW50aWZpZWRFeHByZXNzaW9uIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdF9xdWFudGlmaWVyOiBzdHJpbmc7XG5cdF9pbkNsYXVzZU5hbWVzOiB7IHByZWZpeDogc3RyaW5nOyBuYW1lc3BhY2VVUkk6IHN0cmluZzsgbG9jYWxOYW1lOiBzdHJpbmc7IH1bXTtcblx0X2luQ2xhdXNlRXhwcmVzc2lvbnM6IEV4cHJlc3Npb25bXTtcblx0X3NhdGlzZmllc0V4cHI6IEV4cHJlc3Npb247XG5cdF9pbkNsYXVzZVZhcmlhYmxlTmFtZXM6IGFueTtcblx0LyoqXG5cdCAqIEBwYXJhbSAge3N0cmluZ30gICAgICAgICAgICAgIHF1YW50aWZpZXJcblx0ICogQHBhcmFtICB7IUFycmF5PEluQ2xhdXNlPn0gICAgaW5DbGF1c2VzXG5cdCAqIEBwYXJhbSAgeyFFeHByZXNzaW9ufSAgICAgICAgIHNhdGlzZmllc0V4cHJcblx0ICovXG5cdGNvbnN0cnVjdG9yKHF1YW50aWZpZXI6IHN0cmluZywgaW5DbGF1c2VzOiBBcnJheTxJbkNsYXVzZT4sIHNhdGlzZmllc0V4cHI6IEV4cHJlc3Npb24pIHtcblx0XHRjb25zdCBpbkNsYXVzZUV4cHJlc3Npb25zID0gaW5DbGF1c2VzLm1hcChpbkNsYXVzZSA9PiBpbkNsYXVzZS5zb3VyY2VFeHByKTtcblx0XHRjb25zdCBpbkNsYXVzZU5hbWVzID0gaW5DbGF1c2VzLm1hcChpbkNsYXVzZSA9PiBpbkNsYXVzZS5uYW1lKTtcblxuXHRcdGNvbnN0IHNwZWNpZmljaXR5ID0gaW5DbGF1c2VFeHByZXNzaW9ucy5yZWR1Y2UoXG5cdFx0XHQoc3BlY2lmaWNpdHksIGluQ2xhdXNlKSA9PiBzcGVjaWZpY2l0eS5hZGQoaW5DbGF1c2Uuc3BlY2lmaWNpdHkpLFxuXHRcdFx0c2F0aXNmaWVzRXhwci5zcGVjaWZpY2l0eSk7XG5cdFx0c3VwZXIoXG5cdFx0XHRzcGVjaWZpY2l0eSxcblx0XHRcdGluQ2xhdXNlRXhwcmVzc2lvbnMuY29uY2F0KHNhdGlzZmllc0V4cHIpLFxuXHRcdFx0e1xuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuX3F1YW50aWZpZXIgPSBxdWFudGlmaWVyO1xuXHRcdHRoaXMuX2luQ2xhdXNlTmFtZXMgPSBpbkNsYXVzZU5hbWVzO1xuXHRcdHRoaXMuX2luQ2xhdXNlRXhwcmVzc2lvbnMgPSBpbkNsYXVzZUV4cHJlc3Npb25zO1xuXHRcdHRoaXMuX3NhdGlzZmllc0V4cHIgPSBzYXRpc2ZpZXNFeHByO1xuXG5cdFx0dGhpcy5faW5DbGF1c2VWYXJpYWJsZU5hbWVzID0gbnVsbDtcblx0fVxuXG5cdHBlcmZvcm1TdGF0aWNFdmFsdWF0aW9uKHN0YXRpY0NvbnRleHQpIHtcblx0XHR0aGlzLl9pbkNsYXVzZVZhcmlhYmxlTmFtZXMgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuX2luQ2xhdXNlTmFtZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRjb25zdCBleHByID0gdGhpcy5faW5DbGF1c2VFeHByZXNzaW9uc1tpXTtcblx0XHRcdGV4cHIucGVyZm9ybVN0YXRpY0V2YWx1YXRpb24oc3RhdGljQ29udGV4dCk7XG5cblx0XHRcdC8vIFRoZSBleGlzdGFuY2Ugb2YgdGhpcyB2YXJpYWJsZSBzaG91bGQgYmUga25vd24gZm9yIHRoZSBuZXh0IGV4cHJlc3Npb25cblx0XHRcdHN0YXRpY0NvbnRleHQuaW50cm9kdWNlU2NvcGUoKTtcblx0XHRcdGNvbnN0IGluQ2xhdXNlTmFtZSA9IHRoaXMuX2luQ2xhdXNlTmFtZXNbaV07XG5cdFx0XHRjb25zdCBpbkNsYXVzZU5hbWVOYW1lc3BhY2VVUkkgPSBpbkNsYXVzZU5hbWUucHJlZml4ID8gc3RhdGljQ29udGV4dC5yZXNvbHZlTmFtZXNwYWNlKGluQ2xhdXNlTmFtZS5wcmVmaXgpIDogbnVsbDtcblx0XHRcdGNvbnN0IHZhckJpbmRpbmdOYW1lID0gc3RhdGljQ29udGV4dC5yZWdpc3RlclZhcmlhYmxlKGluQ2xhdXNlTmFtZU5hbWVzcGFjZVVSSSwgaW5DbGF1c2VOYW1lLmxvY2FsTmFtZSk7XG5cdFx0XHR0aGlzLl9pbkNsYXVzZVZhcmlhYmxlTmFtZXNbaV0gPSB2YXJCaW5kaW5nTmFtZTtcblx0XHR9XG5cblx0XHR0aGlzLl9zYXRpc2ZpZXNFeHByLnBlcmZvcm1TdGF0aWNFdmFsdWF0aW9uKHN0YXRpY0NvbnRleHQpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLl9pbkNsYXVzZU5hbWVzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuXHRcdFx0c3RhdGljQ29udGV4dC5yZW1vdmVTY29wZSgpO1xuXHRcdH1cblx0fVxuXG5cdGV2YWx1YXRlKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0bGV0IHNjb3BpbmdDb250ZXh0ID0gZHluYW1pY0NvbnRleHQ7XG5cdFx0Y29uc3QgZXZhbHVhdGVkSW5DbGF1c2VzID0gdGhpcy5faW5DbGF1c2VWYXJpYWJsZU5hbWVzLm1hcCgodmFyaWFibGVCaW5kaW5nLCBpKSA9PiB7XG5cdFx0XHRjb25zdCBhbGxWYWx1ZXNJbkluQ2xhdXNlID0gdGhpcy5faW5DbGF1c2VFeHByZXNzaW9uc1tpXVxuXHRcdFx0XHQuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoc2NvcGluZ0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpLmdldEFsbFZhbHVlcygpO1xuXG5cdFx0XHRzY29waW5nQ29udGV4dCA9IGR5bmFtaWNDb250ZXh0LnNjb3BlV2l0aFZhcmlhYmxlQmluZGluZ3Moe1xuXHRcdFx0XHRbdmFyaWFibGVCaW5kaW5nXTogKCkgPT4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZShhbGxWYWx1ZXNJbkluQ2xhdXNlKVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBhbGxWYWx1ZXNJbkluQ2xhdXNlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaW5kaWNlcyA9IG5ldyBBcnJheShldmFsdWF0ZWRJbkNsYXVzZXMubGVuZ3RoKS5maWxsKDApO1xuXHRcdGluZGljZXNbMF0gPSAtMTtcblxuXHRcdGxldCBoYXNPdmVyZmxvd2VkID0gdHJ1ZTtcblx0XHR3aGlsZSAoaGFzT3ZlcmZsb3dlZCkge1xuXHRcdFx0aGFzT3ZlcmZsb3dlZCA9IGZhbHNlO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSBpbmRpY2VzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZUFycmF5ID0gZXZhbHVhdGVkSW5DbGF1c2VzW2ldO1xuXHRcdFx0XHRpZiAoKytpbmRpY2VzW2ldID4gdmFsdWVBcnJheS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0aW5kaWNlc1tpXSA9IDA7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2YXJpYWJsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdFx0XHRcdGZvciAobGV0IHkgPSAwOyB5IDwgaW5kaWNlcy5sZW5ndGg7IHkrKykge1xuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gZXZhbHVhdGVkSW5DbGF1c2VzW3ldW2luZGljZXNbeV1dO1xuXHRcdFx0XHRcdHZhcmlhYmxlc1t0aGlzLl9pbkNsYXVzZVZhcmlhYmxlTmFtZXNbeV1dID0gKCkgPT4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbih2YWx1ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBjb250ZXh0ID0gZHluYW1pY0NvbnRleHQuc2NvcGVXaXRoVmFyaWFibGVCaW5kaW5ncyh2YXJpYWJsZXMpO1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0aGlzLl9zYXRpc2ZpZXNFeHByLmV2YWx1YXRlTWF5YmVTdGF0aWNhbGx5KGNvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXG5cdFx0XHRcdGlmIChyZXN1bHQuZ2V0RWZmZWN0aXZlQm9vbGVhblZhbHVlKCkgJiYgdGhpcy5fcXVhbnRpZmllciA9PT0gJ3NvbWUnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25UcnVlU2VxdWVuY2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICghcmVzdWx0LmdldEVmZmVjdGl2ZUJvb2xlYW5WYWx1ZSgpICYmIHRoaXMuX3F1YW50aWZpZXIgPT09ICdldmVyeScpIHtcblx0XHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbkZhbHNlU2VxdWVuY2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRoYXNPdmVyZmxvd2VkID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQW4gZXZlcnkgcXVhbnRpZmllciBpcyB0cnVlIGlmIGFsbCBpdGVtcyBtYXRjaCwgYSBzb21lIGlzIGZhbHNlIGlmIG5vbmUgb2YgdGhlIGl0ZW1zIG1hdGNoXG5cdFx0cmV0dXJuIHRoaXMuX3F1YW50aWZpZXIgPT09ICdldmVyeScgPyBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uVHJ1ZVNlcXVlbmNlKCkgOiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uRmFsc2VTZXF1ZW5jZSgpO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBRdWFudGlmaWVkRXhwcmVzc2lvbjtcbiJdfQ==