"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const Specificity_1 = require("../Specificity");
/**
 * @extends {Expression}
 */
class ContextItemExpression extends Expression_1.default {
    constructor() {
        super(new Specificity_1.default({}), [], {
            resultOrder: Expression_1.default.RESULT_ORDERINGS.SORTED
        });
    }
    evaluate(dynamicContext, _executionParameters) {
        if (dynamicContext.contextItem === null) {
            throw new Error('XPDY0002: context is absent, it needs to be present to use the "." operator');
        }
        return SequenceFactory_1.default.singleton(dynamicContext.contextItem);
    }
}
exports.default = ContextItemExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dEl0ZW1FeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29udGV4dEl0ZW1FeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXVDO0FBQ3ZDLGtFQUEyRDtBQUMzRCxnREFBeUM7QUFFekM7O0dBRUc7QUFDSCxNQUFNLHFCQUFzQixTQUFRLG9CQUFVO0lBQzdDO1FBQ0MsS0FBSyxDQUNKLElBQUkscUJBQVcsQ0FBQyxFQUFFLENBQUMsRUFDbkIsRUFBRSxFQUNGO1lBQ0MsV0FBVyxFQUFFLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTTtTQUMvQyxDQUNELENBQUM7SUFDSCxDQUFDO0lBRUQsUUFBUSxDQUFFLGNBQWMsRUFBRSxvQkFBb0I7UUFDN0MsSUFBSSxjQUFjLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRTtZQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7U0FDL0Y7UUFDRCxPQUFPLHlCQUFlLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBRUQ7QUFDRCxrQkFBZSxxQkFBcUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBTcGVjaWZpY2l0eSBmcm9tICcuLi9TcGVjaWZpY2l0eSc7XG5cbi8qKlxuICogQGV4dGVuZHMge0V4cHJlc3Npb259XG4gKi9cbmNsYXNzIENvbnRleHRJdGVtRXhwcmVzc2lvbiBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHRjb25zdHJ1Y3RvciAoKSB7XG5cdFx0c3VwZXIoXG5cdFx0XHRuZXcgU3BlY2lmaWNpdHkoe30pLFxuXHRcdFx0W10sXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdE9yZGVyOiBFeHByZXNzaW9uLlJFU1VMVF9PUkRFUklOR1MuU09SVEVEXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdGV2YWx1YXRlIChkeW5hbWljQ29udGV4dCwgX2V4ZWN1dGlvblBhcmFtZXRlcnMpIHtcblx0XHRpZiAoZHluYW1pY0NvbnRleHQuY29udGV4dEl0ZW0gPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignWFBEWTAwMDI6IGNvbnRleHQgaXMgYWJzZW50LCBpdCBuZWVkcyB0byBiZSBwcmVzZW50IHRvIHVzZSB0aGUgXCIuXCIgb3BlcmF0b3InKTtcblx0XHR9XG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oZHluYW1pY0NvbnRleHQuY29udGV4dEl0ZW0pO1xuXHR9XG5cbn1cbmV4cG9ydCBkZWZhdWx0IENvbnRleHRJdGVtRXhwcmVzc2lvbjtcbiJdfQ==