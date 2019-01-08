"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Specificity_1 = require("../Specificity");
const Expression_1 = require("../Expression");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createAtomicValue_1 = require("../dataTypes/createAtomicValue");
/**
 * @extends {Expression}
 */
class Literal extends Expression_1.default {
    /**
     * @param  jsValue
     * @param  type
     */
    constructor(jsValue, type) {
        super(new Specificity_1.default({}), [], {
            canBeStaticallyEvaluated: true,
            resultOrder: Expression_1.default.RESULT_ORDERINGS.SORTED
        });
        this._type = type;
        let value;
        switch (type) {
            case 'xs:integer':
                value = createAtomicValue_1.default(parseInt(jsValue, 10), type);
                break;
            case 'xs:string':
                value = createAtomicValue_1.default(jsValue + '', type);
                break;
            case 'xs:decimal':
                value = createAtomicValue_1.default(parseFloat(jsValue), type);
                break;
            case 'xs:double':
                value = createAtomicValue_1.default(parseFloat(jsValue), type);
                break;
            default:
                throw new TypeError('Type ' + type + ' not expected in a literal');
        }
        this._createValueSequence = () => SequenceFactory_1.default.singleton(value);
    }
    evaluate(_dynamicContext) {
        return this._createValueSequence();
    }
}
exports.default = Literal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGl0ZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkxpdGVyYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBeUM7QUFDekMsOENBQXVDO0FBQ3ZDLGtFQUEyRDtBQUUzRCxzRUFBK0Q7QUFFL0Q7O0dBRUc7QUFDSCxNQUFNLE9BQVEsU0FBUSxvQkFBVTtJQUUvQjs7O09BR0c7SUFDSCxZQUFhLE9BQWUsRUFBRSxJQUFZO1FBQ3pDLEtBQUssQ0FDSixJQUFJLHFCQUFXLENBQUMsRUFBRSxDQUFDLEVBQ25CLEVBQUUsRUFDRjtZQUNDLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsV0FBVyxFQUFFLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTTtTQUMvQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLEtBQUssQ0FBQztRQUNWLFFBQVEsSUFBSSxFQUFFO1lBQ2IsS0FBSyxZQUFZO2dCQUNoQixLQUFLLEdBQUcsMkJBQWlCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdkQsTUFBTTtZQUNQLEtBQUssV0FBVztnQkFDZixLQUFLLEdBQUcsMkJBQWlCLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDOUMsTUFBTTtZQUNQLEtBQUssWUFBWTtnQkFDaEIsS0FBSyxHQUFHLDJCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckQsTUFBTTtZQUNQLEtBQUssV0FBVztnQkFDZixLQUFLLEdBQUcsMkJBQWlCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNyRCxNQUFNO1lBQ1A7Z0JBQ0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLDRCQUE0QixDQUFDLENBQUM7U0FDcEU7UUFFRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxFQUFFLENBQUMseUJBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELFFBQVEsQ0FBRSxlQUFlO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNEO0FBRUQsa0JBQWUsT0FBTyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNwZWNpZmljaXR5IGZyb20gJy4uL1NwZWNpZmljaXR5JztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcblxuaW1wb3J0IGNyZWF0ZUF0b21pY1ZhbHVlIGZyb20gJy4uL2RhdGFUeXBlcy9jcmVhdGVBdG9taWNWYWx1ZSc7XG5cbi8qKlxuICogQGV4dGVuZHMge0V4cHJlc3Npb259XG4gKi9cbmNsYXNzIExpdGVyYWwgZXh0ZW5kcyBFeHByZXNzaW9uIHtcblx0X3R5cGU6IHN0cmluZztcblx0LyoqXG5cdCAqIEBwYXJhbSAganNWYWx1ZVxuXHQgKiBAcGFyYW0gIHR5cGVcblx0ICovXG5cdGNvbnN0cnVjdG9yIChqc1ZhbHVlOiBzdHJpbmcsIHR5cGU6IHN0cmluZykge1xuXHRcdHN1cGVyKFxuXHRcdFx0bmV3IFNwZWNpZmljaXR5KHt9KSxcblx0XHRcdFtdLFxuXHRcdFx0e1xuXHRcdFx0XHRjYW5CZVN0YXRpY2FsbHlFdmFsdWF0ZWQ6IHRydWUsXG5cdFx0XHRcdHJlc3VsdE9yZGVyOiBFeHByZXNzaW9uLlJFU1VMVF9PUkRFUklOR1MuU09SVEVEXG5cdFx0XHR9KTtcblx0XHR0aGlzLl90eXBlID0gdHlwZTtcblxuXHRcdGxldCB2YWx1ZTtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgJ3hzOmludGVnZXInOlxuXHRcdFx0XHR2YWx1ZSA9IGNyZWF0ZUF0b21pY1ZhbHVlKHBhcnNlSW50KGpzVmFsdWUsIDEwKSwgdHlwZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAneHM6c3RyaW5nJzpcblx0XHRcdFx0dmFsdWUgPSBjcmVhdGVBdG9taWNWYWx1ZShqc1ZhbHVlICsgJycsIHR5cGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3hzOmRlY2ltYWwnOlxuXHRcdFx0XHR2YWx1ZSA9IGNyZWF0ZUF0b21pY1ZhbHVlKHBhcnNlRmxvYXQoanNWYWx1ZSksIHR5cGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3hzOmRvdWJsZSc6XG5cdFx0XHRcdHZhbHVlID0gY3JlYXRlQXRvbWljVmFsdWUocGFyc2VGbG9hdChqc1ZhbHVlKSwgdHlwZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVHlwZSAnICsgdHlwZSArICcgbm90IGV4cGVjdGVkIGluIGEgbGl0ZXJhbCcpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NyZWF0ZVZhbHVlU2VxdWVuY2UgPSAoKSA9PiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKHZhbHVlKTtcblx0fVxuXG5cdGV2YWx1YXRlIChfZHluYW1pY0NvbnRleHQpIHtcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlVmFsdWVTZXF1ZW5jZSgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpdGVyYWw7XG4iXX0=