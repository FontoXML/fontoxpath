"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isSubtypeOf_1 = require("../../dataTypes/isSubtypeOf");
const SequenceFactory_1 = require("../../dataTypes/SequenceFactory");
const zipSingleton_1 = require("../../util/zipSingleton");
const documentOrderUtils_1 = require("../../dataTypes/documentOrderUtils");
function nodeCompare(operator, domFacade, firstSequence, secondSequence) {
    // https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp
    return firstSequence.switchCases({
        default: () => {
            throw new Error('XPTY0004: Sequences to compare are not singleton');
        },
        singleton: () => secondSequence.switchCases({
            default: () => {
                throw new Error('XPTY0004: Sequences to compare are not singleton');
            },
            singleton: () => {
                return zipSingleton_1.default([firstSequence, secondSequence], ([first, second]) => {
                    if (!isSubtypeOf_1.default(first.type, 'node()') || !isSubtypeOf_1.default(second.type, 'node()')) {
                        throw new Error('XPTY0004: Sequences to compare are not nodes');
                    }
                    switch (operator) {
                        case 'isOp':
                            return first === second ?
                                SequenceFactory_1.default.singletonTrueSequence() :
                                SequenceFactory_1.default.singletonFalseSequence();
                        case 'nodeBeforeOp':
                            return documentOrderUtils_1.compareNodePositions(domFacade, first, second) < 0 ?
                                SequenceFactory_1.default.singletonTrueSequence() :
                                SequenceFactory_1.default.singletonFalseSequence();
                        case 'nodeAfterOp':
                            return documentOrderUtils_1.compareNodePositions(domFacade, first, second) > 0 ?
                                SequenceFactory_1.default.singletonTrueSequence() :
                                SequenceFactory_1.default.singletonFalseSequence();
                        default:
                            throw new Error('Unexpected operator');
                    }
                });
            }
        })
    });
}
exports.default = nodeCompare;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZUNvbXBhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJub2RlQ29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZEQUFzRDtBQUN0RCxxRUFBOEQ7QUFDOUQsMERBQW1EO0FBQ25ELDJFQUEwRTtBQUcxRSxTQUF3QixXQUFXLENBQUMsUUFBZ0IsRUFBRSxTQUFTLEVBQUUsYUFBd0IsRUFBRSxjQUF5QjtJQUNuSCx1REFBdUQ7SUFDdkQsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFDRCxTQUFTLEVBQUUsR0FBRyxFQUFFO2dCQUVoQixPQUFPLHNCQUFZLENBQ2xCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxFQUMvQixDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUU7d0JBQzlFLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztxQkFDaEU7b0JBQ0YsUUFBUSxRQUFRLEVBQUU7d0JBQ2pCLEtBQUssTUFBTTs0QkFDVixPQUFPLEtBQUssS0FBSyxNQUFNLENBQUMsQ0FBQztnQ0FDeEIseUJBQWUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7Z0NBQ3pDLHlCQUFlLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzt3QkFFM0MsS0FBSyxjQUFjOzRCQUNsQixPQUFPLHlDQUFvQixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQzFELHlCQUFlLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO2dDQUN6Qyx5QkFBZSxDQUFDLHNCQUFzQixFQUFFLENBQUM7d0JBRTNDLEtBQUssYUFBYTs0QkFDakIsT0FBTyx5Q0FBb0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUMxRCx5QkFBZSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztnQ0FDekMseUJBQWUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO3dCQUUzQzs0QkFDQyxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7cUJBQ3hDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsQ0FBQztTQUNELENBQUM7S0FDRixDQUFDLENBQUM7QUFDSixDQUFDO0FBekNELDhCQXlDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuLi8uLi9kYXRhVHlwZXMvaXNTdWJ0eXBlT2YnO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi8uLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCB6aXBTaW5nbGV0b24gZnJvbSAnLi4vLi4vdXRpbC96aXBTaW5nbGV0b24nO1xuaW1wb3J0IHsgY29tcGFyZU5vZGVQb3NpdGlvbnMgfSBmcm9tICcuLi8uLi9kYXRhVHlwZXMvZG9jdW1lbnRPcmRlclV0aWxzJztcbmltcG9ydCBJU2VxdWVuY2UgZnJvbSAnc3JjL2V4cHJlc3Npb25zL2RhdGFUeXBlcy9JU2VxdWVuY2UnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub2RlQ29tcGFyZShvcGVyYXRvcjogc3RyaW5nLCBkb21GYWNhZGUsIGZpcnN0U2VxdWVuY2U6IElTZXF1ZW5jZSwgc2Vjb25kU2VxdWVuY2U6IElTZXF1ZW5jZSk6IElTZXF1ZW5jZSB7XG5cdC8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi94cGF0aC0zMS8jZG9jLXhwYXRoMzEtTm9kZUNvbXBcblx0cmV0dXJuIGZpcnN0U2VxdWVuY2Uuc3dpdGNoQ2FzZXMoe1xuXHRcdGRlZmF1bHQ6ICgpID0+IHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignWFBUWTAwMDQ6IFNlcXVlbmNlcyB0byBjb21wYXJlIGFyZSBub3Qgc2luZ2xldG9uJyk7XG5cdFx0fSxcblx0XHRzaW5nbGV0b246ICgpID0+IHNlY29uZFNlcXVlbmNlLnN3aXRjaENhc2VzKHtcblx0XHRcdGRlZmF1bHQ6ICgpID0+IHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdYUFRZMDAwNDogU2VxdWVuY2VzIHRvIGNvbXBhcmUgYXJlIG5vdCBzaW5nbGV0b24nKTtcblx0XHRcdH0sXG5cdFx0XHRzaW5nbGV0b246ICgpID0+IHtcblxuXHRcdFx0cmV0dXJuIHppcFNpbmdsZXRvbihcblx0XHRcdFx0W2ZpcnN0U2VxdWVuY2UsIHNlY29uZFNlcXVlbmNlXSxcblx0XHRcdFx0KFtmaXJzdCwgc2Vjb25kXSkgPT4ge1xuXHRcdFx0XHRcdGlmICghaXNTdWJ0eXBlT2YoZmlyc3QudHlwZSwgJ25vZGUoKScpIHx8ICFpc1N1YnR5cGVPZihzZWNvbmQudHlwZSwgJ25vZGUoKScpKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1hQVFkwMDA0OiBTZXF1ZW5jZXMgdG8gY29tcGFyZSBhcmUgbm90IG5vZGVzJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRzd2l0Y2ggKG9wZXJhdG9yKSB7XG5cdFx0XHRcdFx0Y2FzZSAnaXNPcCc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmlyc3QgPT09IHNlY29uZCA/XG5cdFx0XHRcdFx0XHRcdFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25UcnVlU2VxdWVuY2UoKSA6XG5cdFx0XHRcdFx0XHRcdFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25GYWxzZVNlcXVlbmNlKCk7XG5cblx0XHRcdFx0XHRjYXNlICdub2RlQmVmb3JlT3AnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbXBhcmVOb2RlUG9zaXRpb25zKGRvbUZhY2FkZSwgZmlyc3QsIHNlY29uZCkgPCAwID9cblx0XHRcdFx0XHRcdFx0U2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvblRydWVTZXF1ZW5jZSgpIDpcblx0XHRcdFx0XHRcdFx0U2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbkZhbHNlU2VxdWVuY2UoKTtcblxuXHRcdFx0XHRcdGNhc2UgJ25vZGVBZnRlck9wJzpcblx0XHRcdFx0XHRcdHJldHVybiBjb21wYXJlTm9kZVBvc2l0aW9ucyhkb21GYWNhZGUsIGZpcnN0LCBzZWNvbmQpID4gMCA/XG5cdFx0XHRcdFx0XHRcdFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25UcnVlU2VxdWVuY2UoKSA6XG5cdFx0XHRcdFx0XHRcdFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b25GYWxzZVNlcXVlbmNlKCk7XG5cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIG9wZXJhdG9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pXG5cdH0pO1xufVxuIl19