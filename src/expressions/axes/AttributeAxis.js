"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const Specificity_1 = require("../Specificity");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
class AttributeAxis extends Expression_1.default {
    constructor(attributeTestExpression) {
        super(new Specificity_1.default({
            [Specificity_1.default.ATTRIBUTE_KIND]: 1
        }), [attributeTestExpression], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.UNSORTED,
            subtree: true,
            peer: true,
            canBeStaticallyEvaluated: false
        });
        this._attributeTestExpression = attributeTestExpression;
    }
    evaluate(dynamicContext, executionParameters) {
        const contextItem = dynamicContext.contextItem;
        if (contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
        }
        const domFacade = executionParameters.domFacade;
        if (!isSubtypeOf_1.default(contextItem.type, 'element()')) {
            return SequenceFactory_1.default.empty();
        }
        // The spec on attributes:
        // A set of Attribute Nodes constructed from the attribute information
        // items appearing in the [attributes] property.
        // This includes all of the "special" attributes (xml:lang, xml:space, xsi:type, etc.)
        // but does not include namespace declarations (because they are not attributes).
        const matchingAttributes = domFacade.getAllAttributes(contextItem.value)
            .filter(attr => attr.namespaceURI !== 'http://www.w3.org/2000/xmlns/')
            .map(attribute => createNodeValue_1.default(attribute))
            .filter(item => this._attributeTestExpression.evaluateToBoolean(dynamicContext, item));
        return SequenceFactory_1.default.create(matchingAttributes);
    }
    getBucket() {
        // The attribute axis is a non-empty sequence for only elements
        return 'type-1';
    }
}
exports.default = AttributeAxis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXR0cmlidXRlQXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkF0dHJpYnV0ZUF4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBdUM7QUFDdkMsZ0RBQXlDO0FBQ3pDLGtFQUEyRDtBQUMzRCxrRUFBMkQ7QUFDM0QsMERBQW1EO0FBR25ELE1BQU0sYUFBYyxTQUFRLG9CQUFVO0lBRXJDLFlBQVksdUJBQStDO1FBQzFELEtBQUssQ0FDSixJQUFJLHFCQUFXLENBQUM7WUFDZixDQUFDLHFCQUFXLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztTQUMvQixDQUFDLEVBQ0YsQ0FBQyx1QkFBdUIsQ0FBQyxFQUN6QjtZQUNDLFdBQVcsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDLFFBQVE7WUFDakQsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsSUFBSTtZQUNWLHdCQUF3QixFQUFFLEtBQUs7U0FDL0IsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLHdCQUF3QixHQUFHLHVCQUF1QixDQUFDO0lBQ3pELENBQUM7SUFFRCxRQUFRLENBQUUsY0FBYyxFQUFFLG1CQUFtQjtRQUM1QyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDO1FBQy9DLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7U0FDcEY7UUFFRCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUM7UUFFaEQsSUFBSSxDQUFDLHFCQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsRUFBRTtZQUNoRCxPQUFPLHlCQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDL0I7UUFFRCwwQkFBMEI7UUFDMUIsc0VBQXNFO1FBQ3RFLGdEQUFnRDtRQUNoRCxzRkFBc0Y7UUFDdEYsaUZBQWlGO1FBQ2pGLE1BQU0sa0JBQWtCLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7YUFDdEUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSywrQkFBK0IsQ0FBQzthQUNyRSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RixPQUFPLHlCQUFlLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELFNBQVM7UUFDUiwrREFBK0Q7UUFDL0QsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztDQUNEO0FBQ0Qsa0JBQWUsYUFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cHJlc3Npb24gZnJvbSAnLi4vRXhwcmVzc2lvbic7XG5pbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vU3BlY2lmaWNpdHknO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBjcmVhdGVOb2RlVmFsdWUgZnJvbSAnLi4vZGF0YVR5cGVzL2NyZWF0ZU5vZGVWYWx1ZSc7XG5pbXBvcnQgaXNTdWJ0eXBlT2YgZnJvbSAnLi4vZGF0YVR5cGVzL2lzU3VidHlwZU9mJztcbmltcG9ydCBUZXN0QWJzdHJhY3RFeHByZXNzaW9uIGZyb20gJy4uL3Rlc3RzL1Rlc3RBYnN0cmFjdEV4cHJlc3Npb24nO1xuXG5jbGFzcyBBdHRyaWJ1dGVBeGlzIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG5cdF9hdHRyaWJ1dGVUZXN0RXhwcmVzc2lvbjogVGVzdEFic3RyYWN0RXhwcmVzc2lvbjtcblx0Y29uc3RydWN0b3IoYXR0cmlidXRlVGVzdEV4cHJlc3Npb246IFRlc3RBYnN0cmFjdEV4cHJlc3Npb24pIHtcblx0XHRzdXBlcihcblx0XHRcdG5ldyBTcGVjaWZpY2l0eSh7XG5cdFx0XHRcdFtTcGVjaWZpY2l0eS5BVFRSSUJVVEVfS0lORF06IDFcblx0XHRcdH0pLFxuXHRcdFx0W2F0dHJpYnV0ZVRlc3RFeHByZXNzaW9uXSxcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0T3JkZXI6IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5VTlNPUlRFRCxcblx0XHRcdFx0c3VidHJlZTogdHJ1ZSxcblx0XHRcdFx0cGVlcjogdHJ1ZSxcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBmYWxzZVxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLl9hdHRyaWJ1dGVUZXN0RXhwcmVzc2lvbiA9IGF0dHJpYnV0ZVRlc3RFeHByZXNzaW9uO1xuXHR9XG5cblx0ZXZhbHVhdGUgKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0Y29uc3QgY29udGV4dEl0ZW0gPSBkeW5hbWljQ29udGV4dC5jb250ZXh0SXRlbTtcblx0XHRpZiAoY29udGV4dEl0ZW0gPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignWFBEWTAwMDI6IGNvbnRleHQgaXMgYWJzZW50LCBpdCBuZWVkcyB0byBiZSBwcmVzZW50IHRvIHVzZSBheGVzLicpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRvbUZhY2FkZSA9IGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlO1xuXG5cdFx0aWYgKCFpc1N1YnR5cGVPZihjb250ZXh0SXRlbS50eXBlLCAnZWxlbWVudCgpJykpIHtcblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0XHR9XG5cblx0XHQvLyBUaGUgc3BlYyBvbiBhdHRyaWJ1dGVzOlxuXHRcdC8vIEEgc2V0IG9mIEF0dHJpYnV0ZSBOb2RlcyBjb25zdHJ1Y3RlZCBmcm9tIHRoZSBhdHRyaWJ1dGUgaW5mb3JtYXRpb25cblx0XHQvLyBpdGVtcyBhcHBlYXJpbmcgaW4gdGhlIFthdHRyaWJ1dGVzXSBwcm9wZXJ0eS5cblx0XHQvLyBUaGlzIGluY2x1ZGVzIGFsbCBvZiB0aGUgXCJzcGVjaWFsXCIgYXR0cmlidXRlcyAoeG1sOmxhbmcsIHhtbDpzcGFjZSwgeHNpOnR5cGUsIGV0Yy4pXG5cdFx0Ly8gYnV0IGRvZXMgbm90IGluY2x1ZGUgbmFtZXNwYWNlIGRlY2xhcmF0aW9ucyAoYmVjYXVzZSB0aGV5IGFyZSBub3QgYXR0cmlidXRlcykuXG5cdFx0Y29uc3QgbWF0Y2hpbmdBdHRyaWJ1dGVzID0gZG9tRmFjYWRlLmdldEFsbEF0dHJpYnV0ZXMoY29udGV4dEl0ZW0udmFsdWUpXG5cdFx0XHQuZmlsdGVyKGF0dHIgPT4gYXR0ci5uYW1lc3BhY2VVUkkgIT09ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zLycpXG5cdFx0XHQubWFwKGF0dHJpYnV0ZSA9PiBjcmVhdGVOb2RlVmFsdWUoYXR0cmlidXRlKSlcblx0XHRcdC5maWx0ZXIoaXRlbSA9PiB0aGlzLl9hdHRyaWJ1dGVUZXN0RXhwcmVzc2lvbi5ldmFsdWF0ZVRvQm9vbGVhbihkeW5hbWljQ29udGV4dCwgaXRlbSkpO1xuXHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKG1hdGNoaW5nQXR0cmlidXRlcyk7XG5cdH1cblxuXHRnZXRCdWNrZXQgKCkge1xuXHRcdC8vIFRoZSBhdHRyaWJ1dGUgYXhpcyBpcyBhIG5vbi1lbXB0eSBzZXF1ZW5jZSBmb3Igb25seSBlbGVtZW50c1xuXHRcdHJldHVybiAndHlwZS0xJztcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgQXR0cmlidXRlQXhpcztcbiJdfQ==