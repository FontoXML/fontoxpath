"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const Specificity_1 = require("../Specificity");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const MapValue_1 = require("../dataTypes/MapValue");
const zipSingleton_1 = require("../util/zipSingleton");
const createDoublyIterableSequence_1 = require("../util/createDoublyIterableSequence");
/**
 * @extends {Expression}
 */
class MapConstructor extends Expression_1.default {
    /**
     * @param  {Array<{key: !Expression, value:! Expression}>}  entries  key-value tuples of expressions which will evaluate to key / value pairs
     */
    constructor(entries) {
        super(new Specificity_1.default({
            [Specificity_1.default.EXTERNAL_KIND]: 1
        }), entries.reduce((allExpressions, { key, value }) => allExpressions.concat(key, value), []), {
            canBeStaticallyEvaluated: false
        });
        this._entries = entries;
    }
    evaluate(dynamicContext, executionParameters) {
        const keySequences = this._entries
            .map(kvp => kvp.key.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters).switchCases({
            default: () => {
                throw new Error('XPTY0004: A key of a map should be a single atomizable value.');
            },
            singleton: seq => seq
        }));
        return zipSingleton_1.default(keySequences, keys => SequenceFactory_1.default.singleton(new MapValue_1.default(keys.map((key, keyIndex) => ({
            key,
            value: createDoublyIterableSequence_1.default(this._entries[keyIndex].value.evaluateMaybeStatically(dynamicContext, executionParameters))
        })))));
    }
}
exports.default = MapConstructor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwQ29uc3RydWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNYXBDb25zdHJ1Y3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxnREFBeUM7QUFDekMsa0VBQTJEO0FBQzNELG9EQUE2QztBQUM3Qyx1REFBZ0Q7QUFFaEQsdUZBQWdGO0FBRWhGOztHQUVHO0FBQ0gsTUFBTSxjQUFlLFNBQVEsb0JBQVU7SUFDdEM7O09BRUc7SUFDSCxZQUFhLE9BQU87UUFDbkIsS0FBSyxDQUNKLElBQUkscUJBQVcsQ0FBQztZQUNmLENBQUMscUJBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1NBQzlCLENBQUMsRUFDRixPQUFPLENBQUMsTUFBTSxDQUNiLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDM0U7WUFDQyx3QkFBd0IsRUFBRSxLQUFLO1NBQy9CLENBQUMsQ0FBQztRQUNKLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxRQUFRLENBQUUsY0FBYyxFQUFFLG1CQUFtQjtRQUM1QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUTthQUMvQixHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUN6SCxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztZQUNsRixDQUFDO1lBQ0QsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRztTQUNyQixDQUFDLENBQUMsQ0FBQztRQUVOLE9BQU8sc0JBQVksQ0FDbEIsWUFBWSxFQUNaLElBQUksQ0FBQyxFQUFFLENBQUMseUJBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLEdBQUc7WUFDSCxLQUFLLEVBQUUsc0NBQTRCLENBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxDQUMxRjtTQUNELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztDQUNEO0FBRUQsa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cHJlc3Npb24gZnJvbSAnLi4vRXhwcmVzc2lvbic7XG5pbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vU3BlY2lmaWNpdHknO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBNYXBWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvTWFwVmFsdWUnO1xuaW1wb3J0IHppcFNpbmdsZXRvbiBmcm9tICcuLi91dGlsL3ppcFNpbmdsZXRvbic7XG5cbmltcG9ydCBjcmVhdGVEb3VibHlJdGVyYWJsZVNlcXVlbmNlIGZyb20gJy4uL3V0aWwvY3JlYXRlRG91Ymx5SXRlcmFibGVTZXF1ZW5jZSc7XG5cbi8qKlxuICogQGV4dGVuZHMge0V4cHJlc3Npb259XG4gKi9cbmNsYXNzIE1hcENvbnN0cnVjdG9yIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdC8qKlxuXHQgKiBAcGFyYW0gIHtBcnJheTx7a2V5OiAhRXhwcmVzc2lvbiwgdmFsdWU6ISBFeHByZXNzaW9ufT59ICBlbnRyaWVzICBrZXktdmFsdWUgdHVwbGVzIG9mIGV4cHJlc3Npb25zIHdoaWNoIHdpbGwgZXZhbHVhdGUgdG8ga2V5IC8gdmFsdWUgcGFpcnNcblx0ICovXG5cdGNvbnN0cnVjdG9yIChlbnRyaWVzKSB7XG5cdFx0c3VwZXIoXG5cdFx0XHRuZXcgU3BlY2lmaWNpdHkoe1xuXHRcdFx0XHRbU3BlY2lmaWNpdHkuRVhURVJOQUxfS0lORF06IDFcblx0XHRcdH0pLFxuXHRcdFx0ZW50cmllcy5yZWR1Y2UoXG5cdFx0XHRcdChhbGxFeHByZXNzaW9ucywgeyBrZXksIHZhbHVlIH0pID0+IGFsbEV4cHJlc3Npb25zLmNvbmNhdChrZXksIHZhbHVlKSwgW10pLFxuXHRcdFx0e1xuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR0aGlzLl9lbnRyaWVzID0gZW50cmllcztcblx0fVxuXG5cdGV2YWx1YXRlIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGtleVNlcXVlbmNlcyA9IHRoaXMuX2VudHJpZXNcblx0XHRcdFx0Lm1hcChrdnAgPT4ga3ZwLmtleS5ldmFsdWF0ZU1heWJlU3RhdGljYWxseShkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykuYXRvbWl6ZShleGVjdXRpb25QYXJhbWV0ZXJzKS5zd2l0Y2hDYXNlcyh7XG5cdFx0XHRcdFx0ZGVmYXVsdDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUFRZMDAwNDogQSBrZXkgb2YgYSBtYXAgc2hvdWxkIGJlIGEgc2luZ2xlIGF0b21pemFibGUgdmFsdWUuJyk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzaW5nbGV0b246IHNlcSA9PiBzZXFcblx0XHRcdFx0fSkpO1xuXG5cdFx0cmV0dXJuIHppcFNpbmdsZXRvbihcblx0XHRcdGtleVNlcXVlbmNlcyxcblx0XHRcdGtleXMgPT4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihuZXcgTWFwVmFsdWUoa2V5cy5tYXAoKGtleSwga2V5SW5kZXgpID0+ICh7XG5cdFx0XHRcdGtleSxcblx0XHRcdFx0dmFsdWU6IGNyZWF0ZURvdWJseUl0ZXJhYmxlU2VxdWVuY2UoXG5cdFx0XHRcdFx0dGhpcy5fZW50cmllc1trZXlJbmRleF0udmFsdWUuZXZhbHVhdGVNYXliZVN0YXRpY2FsbHkoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMpXG5cdFx0XHRcdClcblx0XHRcdH0pKSkpKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXBDb25zdHJ1Y3RvcjtcbiJdfQ==