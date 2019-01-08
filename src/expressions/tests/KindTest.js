"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestAbstractExpression_1 = require("./TestAbstractExpression");
const Specificity_1 = require("../Specificity");
class KindTest extends TestAbstractExpression_1.default {
    /**
     * @param  {number}  nodeType
     */
    constructor(nodeType) {
        super(new Specificity_1.default({
            [Specificity_1.default.NODETYPE_KIND]: 1
        }));
        this._nodeType = nodeType;
    }
    evaluateToBoolean(_dynamicContext, node) {
        if (this._nodeType === 3 && node.value.nodeType === 4) {
            // CDATA_SECTION_NODES should be regarded as text nodes, and CDATA does not exist in the XPath Data Model
            return true;
        }
        return this._nodeType === node.value.nodeType;
    }
    getBucket() {
        return 'type-' + this._nodeType;
    }
}
exports.default = KindTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2luZFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJLaW5kVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFFQUE4RDtBQUM5RCxnREFBeUM7QUFHekMsTUFBTSxRQUFTLFNBQVEsZ0NBQXNCO0lBQzVDOztPQUVHO0lBQ0gsWUFBYSxRQUFRO1FBQ3BCLEtBQUssQ0FDSixJQUFJLHFCQUFXLENBQUM7WUFDaEIsQ0FBQyxxQkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7U0FDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRUQsaUJBQWlCLENBQUUsZUFBZSxFQUFFLElBQUk7UUFDdkMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7WUFDdEQseUdBQXlHO1lBQ3pHLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDL0MsQ0FBQztJQUVELFNBQVM7UUFDUixPQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ2pDLENBQUM7Q0FDRDtBQUNELGtCQUFlLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXN0QWJzdHJhY3RFeHByZXNzaW9uIGZyb20gJy4vVGVzdEFic3RyYWN0RXhwcmVzc2lvbic7XG5pbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vU3BlY2lmaWNpdHknO1xuXG5cbmNsYXNzIEtpbmRUZXN0IGV4dGVuZHMgVGVzdEFic3RyYWN0RXhwcmVzc2lvbiB7XG5cdC8qKlxuXHQgKiBAcGFyYW0gIHtudW1iZXJ9ICBub2RlVHlwZVxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5vZGVUeXBlKSB7XG5cdFx0c3VwZXIoXG5cdFx0XHRuZXcgU3BlY2lmaWNpdHkoe1xuXHRcdFx0W1NwZWNpZmljaXR5Lk5PREVUWVBFX0tJTkRdOiAxXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fbm9kZVR5cGUgPSBub2RlVHlwZTtcblx0fVxuXG5cdGV2YWx1YXRlVG9Cb29sZWFuIChfZHluYW1pY0NvbnRleHQsIG5vZGUpIHtcblx0XHRpZiAodGhpcy5fbm9kZVR5cGUgPT09IDMgJiYgbm9kZS52YWx1ZS5ub2RlVHlwZSA9PT0gNCkge1xuXHRcdFx0Ly8gQ0RBVEFfU0VDVElPTl9OT0RFUyBzaG91bGQgYmUgcmVnYXJkZWQgYXMgdGV4dCBub2RlcywgYW5kIENEQVRBIGRvZXMgbm90IGV4aXN0IGluIHRoZSBYUGF0aCBEYXRhIE1vZGVsXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX25vZGVUeXBlID09PSBub2RlLnZhbHVlLm5vZGVUeXBlO1xuXHR9XG5cblx0Z2V0QnVja2V0ICgpIHtcblx0XHRyZXR1cm4gJ3R5cGUtJyArIHRoaXMuX25vZGVUeXBlO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBLaW5kVGVzdDtcbiJdfQ==