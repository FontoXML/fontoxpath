"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DynamicContext_1 = require("./DynamicContext");
const SequenceFactory_1 = require("./dataTypes/SequenceFactory");
class UnfocusableDynamicContext extends DynamicContext_1.default {
    constructor({ variableBindings = {} }) {
        super({
            contextItem: null,
            contextItemIndex: -1,
            contextSequence: SequenceFactory_1.default.empty(),
            variableBindings: variableBindings
        });
    }
}
exports.default = UnfocusableDynamicContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5mb2N1c2FibGVEeW5hbWljQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVuZm9jdXNhYmxlRHluYW1pY0NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBOEM7QUFDOUMsaUVBQTBEO0FBRTFELE1BQXFCLHlCQUEwQixTQUFRLHdCQUFjO0lBQ3BFLFlBQWEsRUFBRSxnQkFBZ0IsR0FBRyxFQUFFLEVBQUU7UUFDckMsS0FBSyxDQUFDO1lBQ0wsV0FBVyxFQUFFLElBQUk7WUFDakIsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLGVBQWUsRUFBRSx5QkFBZSxDQUFDLEtBQUssRUFBRTtZQUN4QyxnQkFBZ0IsRUFBRSxnQkFBZ0I7U0FDbEMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBVEQsNENBU0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRHluYW1pY0NvbnRleHQgZnJvbSAnLi9EeW5hbWljQ29udGV4dCc7XG5pbXBvcnQgU2VxdWVuY2VGYWN0b3J5IGZyb20gJy4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVuZm9jdXNhYmxlRHluYW1pY0NvbnRleHQgZXh0ZW5kcyBEeW5hbWljQ29udGV4dCB7XG5cdGNvbnN0cnVjdG9yICh7IHZhcmlhYmxlQmluZGluZ3MgPSB7fSB9KSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0Y29udGV4dEl0ZW06IG51bGwsXG5cdFx0XHRjb250ZXh0SXRlbUluZGV4OiAtMSxcblx0XHRcdGNvbnRleHRTZXF1ZW5jZTogU2VxdWVuY2VGYWN0b3J5LmVtcHR5KCksXG5cdFx0XHR2YXJpYWJsZUJpbmRpbmdzOiB2YXJpYWJsZUJpbmRpbmdzXG5cdFx0fSk7XG5cdH1cbn1cbiJdfQ==