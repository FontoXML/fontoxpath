"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequenceFactory_1 = require("./dataTypes/SequenceFactory");
const createAtomicValue_1 = require("./dataTypes/createAtomicValue");
const ArrayValue_1 = require("./dataTypes/ArrayValue");
const MapValue_1 = require("./dataTypes/MapValue");
const createNodeValue_1 = require("./dataTypes/createNodeValue");
const createAtomicValue_2 = require("./dataTypes/createAtomicValue");
const DateTime_1 = require("./dataTypes/valueTypes/DateTime");
/**
 * Adapt a JavaScript value to the equivalent in XPath. This dynamically assigns the closest type
 *
 * @param  value
 * @return Null if the value is absent and the empty sequence should be
 * output instead
 */
function adaptItemToXPathValue(value) {
    if (value === null) {
        return null;
    }
    switch (typeof value) {
        case 'boolean':
            return value ? createAtomicValue_2.trueBoolean : createAtomicValue_2.falseBoolean;
        case 'number':
            return createAtomicValue_1.default(value, 'xs:decimal');
        case 'string':
            return createAtomicValue_1.default(value, 'xs:string');
        case 'object':
            // Test if it is a node
            if (value.nodeType) {
                return createNodeValue_1.default(value);
            }
            if (Array.isArray(value)) {
                return new ArrayValue_1.default(value
                    .map(arrayItem => {
                    if (arrayItem === undefined) {
                        return () => SequenceFactory_1.default.empty();
                    }
                    const adaptedValue = adaptItemToXPathValue(arrayItem);
                    let adaptedSequence;
                    if (adaptedValue === null) {
                        adaptedSequence = SequenceFactory_1.default.empty();
                    }
                    else {
                        adaptedSequence = SequenceFactory_1.default.singleton(adaptedValue);
                    }
                    return () => adaptedSequence;
                }));
            }
            // Make it a map
            return new MapValue_1.default(Object.keys(value)
                .filter(key => value[key] !== undefined)
                .map(key => {
                const adaptedValue = adaptItemToXPathValue(value[key]);
                let adaptedSequence;
                if (adaptedValue === null) {
                    adaptedSequence = SequenceFactory_1.default.empty();
                }
                else {
                    adaptedSequence = SequenceFactory_1.default.singleton(adaptedValue);
                }
                return {
                    key: createAtomicValue_1.default(key, 'xs:string'),
                    value: () => adaptedSequence
                };
            }));
    }
    throw new Error(`Value ${value} of type "${typeof value}" is not adaptable to an XPath value.`);
}
/**
 * Adapt a JavaScript value to the equivalent in XPath. This tries to keep the preferred type
 *
 * @param  value
 * @return Null if the value is absent and the empty sequence should be outputted instead
 */
function adaptJavaScriptValueToXPathValue(type, value) {
    if (value === null) {
        return null;
    }
    switch (type) {
        case 'xs:boolean':
            return value ? createAtomicValue_2.trueBoolean : createAtomicValue_2.falseBoolean;
        case 'xs:string':
            return createAtomicValue_1.default(value + '', 'xs:string');
        case 'xs:double':
        case 'xs:numeric':
            return createAtomicValue_1.default(+value, 'xs:double');
        case 'xs:decimal':
            return createAtomicValue_1.default(+value, 'xs:decimal');
        case 'xs:integer':
            return createAtomicValue_1.default(value | 0, 'xs:integer');
        case 'xs:float':
            return createAtomicValue_1.default(+value, 'xs:float');
        case 'xs:date':
        case 'xs:time':
        case 'xs:dateTime':
        case 'xs:gYearMonth':
        case 'xs:gYear':
        case 'xs:gMonthDay':
        case 'xs:gMonth':
        case 'xs:gDay':
            return createAtomicValue_1.default(DateTime_1.default.fromString(value.toISOString()).convertToType(type), type);
        case 'node()':
        case 'element()':
        case 'text':
        case 'comment()':
            return createNodeValue_1.default(value);
        case 'item()':
            return adaptItemToXPathValue(value);
        default:
            throw new Error(`Values of the type "${type}" can not be adapted to equivalent XPath values.`);
    }
}
function adaptJavaScriptValueToXPath(value, expectedType) {
    expectedType = expectedType || 'item()?';
    const parts = expectedType.match(/^([^+?*]*)([\+\*\?])?$/), type = parts[1], multiplicity = parts[2];
    switch (multiplicity) {
        case '?':
            const adaptedValue = adaptJavaScriptValueToXPathValue(type, value);
            if (adaptedValue === null) {
                return SequenceFactory_1.default.empty();
            }
            return SequenceFactory_1.default.singleton(adaptedValue);
        case '+':
        case '*': {
            const convertedValues = value.map(adaptJavaScriptValueToXPathValue.bind(null, type));
            return SequenceFactory_1.default.create(convertedValues.filter(convertedValue => convertedValue !== null));
        }
        default: {
            const adaptedValue = adaptJavaScriptValueToXPathValue(type, value);
            if (adaptedValue === null) {
                return SequenceFactory_1.default.empty();
            }
            return SequenceFactory_1.default.singleton(adaptedValue);
        }
    }
}
exports.default = adaptJavaScriptValueToXPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRKYXZhU2NyaXB0VmFsdWVUb1hQYXRoVmFsdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZGFwdEphdmFTY3JpcHRWYWx1ZVRvWFBhdGhWYWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlFQUEwRDtBQUMxRCxxRUFBOEQ7QUFDOUQsdURBQWdEO0FBQ2hELG1EQUE0QztBQUM1QyxpRUFBMEQ7QUFDMUQscUVBQTBFO0FBQzFFLDhEQUF1RDtBQUl2RDs7Ozs7O0dBTUc7QUFDSCxTQUFTLHFCQUFxQixDQUFDLEtBQVU7SUFDeEMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFFRCxRQUFRLE9BQU8sS0FBSyxFQUFFO1FBQ3JCLEtBQUssU0FBUztZQUNiLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQywrQkFBVyxDQUFDLENBQUMsQ0FBQyxnQ0FBWSxDQUFDO1FBQzNDLEtBQUssUUFBUTtZQUNaLE9BQU8sMkJBQWlCLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9DLEtBQUssUUFBUTtZQUNaLE9BQU8sMkJBQWlCLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLEtBQUssUUFBUTtZQUNaLHVCQUF1QjtZQUN2QixJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8seUJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QjtZQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLG9CQUFVLENBQ3BCLEtBQUs7cUJBQ0gsR0FBRyxDQUNMLFNBQVMsQ0FBQyxFQUFFO29CQUNYLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTt3QkFDNUIsT0FBTyxHQUFHLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO3FCQUNyQztvQkFDRCxNQUFNLFlBQVksR0FBRyxxQkFBcUIs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QUUsS0FBSyxDQUFDLENBQUM7WUFDbkUsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO2dCQUMxQixPQUFPLHlCQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDL0I7WUFDRCxPQUFPLHlCQUFlLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9DO0tBQ0Q7QUFDRixDQUFDO0FBOUJELDhDQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBjcmVhdGVBdG9taWNWYWx1ZSBmcm9tICcuL2RhdGFUeXBlcy9jcmVhdGVBdG9taWNWYWx1ZSc7XG5pbXBvcnQgQXJyYXlWYWx1ZSBmcm9tICcuL2RhdGFUeXBlcy9BcnJheVZhbHVlJztcbmltcG9ydCBNYXBWYWx1ZSBmcm9tICcuL2RhdGFUeXBlcy9NYXBWYWx1ZSc7XG5pbXBvcnQgY3JlYXRlTm9kZVZhbHVlIGZyb20gJy4vZGF0YVR5cGVzL2NyZWF0ZU5vZGVWYWx1ZSc7XG5pbXBvcnQgeyB0cnVlQm9vbGVhbiwgZmFsc2VCb29sZWFuIH0gZnJvbSAnLi9kYXRhVHlwZXMvY3JlYXRlQXRvbWljVmFsdWUnO1xuaW1wb3J0IERhdGVUaW1lIGZyb20gJy4vZGF0YVR5cGVzL3ZhbHVlVHlwZXMvRGF0ZVRpbWUnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4vZGF0YVR5cGVzL1ZhbHVlJztcbmltcG9ydCBJU2VxdWVuY2UgZnJvbSAnLi9kYXRhVHlwZXMvSVNlcXVlbmNlJztcblxuLyoqXG4gKiBBZGFwdCBhIEphdmFTY3JpcHQgdmFsdWUgdG8gdGhlIGVxdWl2YWxlbnQgaW4gWFBhdGguIFRoaXMgZHluYW1pY2FsbHkgYXNzaWducyB0aGUgY2xvc2VzdCB0eXBlXG4gKlxuICogQHBhcmFtICB2YWx1ZVxuICogQHJldHVybiBOdWxsIGlmIHRoZSB2YWx1ZSBpcyBhYnNlbnQgYW5kIHRoZSBlbXB0eSBzZXF1ZW5jZSBzaG91bGQgYmVcbiAqIG91dHB1dCBpbnN0ZWFkXG4gKi9cbmZ1bmN0aW9uIGFkYXB0SXRlbVRvWFBhdGhWYWx1ZSh2YWx1ZTogYW55KTogVmFsdWUgfCBudWxsIHtcblx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuXHRcdGNhc2UgJ2Jvb2xlYW4nOlxuXHRcdFx0cmV0dXJuIHZhbHVlID8gdHJ1ZUJvb2xlYW4gOiBmYWxzZUJvb2xlYW47XG5cdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZSh2YWx1ZSwgJ3hzOmRlY2ltYWwnKTtcblx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHZhbHVlLCAneHM6c3RyaW5nJyk7XG5cdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdC8vIFRlc3QgaWYgaXQgaXMgYSBub2RlXG5cdFx0XHRpZiAodmFsdWUubm9kZVR5cGUpIHtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZU5vZGVWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBBcnJheVZhbHVlKFxuXHRcdFx0XHRcdHZhbHVlXG5cdFx0XHRcdFx0XHQubWFwKFxuXHRcdFx0XHRcdGFycmF5SXRlbSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoYXJyYXlJdGVtID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuICgpID0+IFNlcXVlbmNlRmFjdG9yeS5lbXB0eSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgYWRhcHRlZFZhbHVlID0gYWRhcHRJdGVtVG9YUGF0aFZhbHVlKGFycmF5SXRlbSk7XG5cdFx0XHRcdFx0XHRsZXQgYWRhcHRlZFNlcXVlbmNlO1xuXHRcdFx0XHRcdFx0aWYgKGFkYXB0ZWRWYWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRhZGFwdGVkU2VxdWVuY2UgPSBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGFkYXB0ZWRTZXF1ZW5jZSA9IFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oYWRhcHRlZFZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiAoKSA9PiBhZGFwdGVkU2VxdWVuY2U7XG5cdFx0XHRcdFx0fSkpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTWFrZSBpdCBhIG1hcFxuXHRcdFx0cmV0dXJuIG5ldyBNYXBWYWx1ZShcblx0XHRcdFx0T2JqZWN0LmtleXModmFsdWUpXG5cdFx0XHRcdFx0LmZpbHRlcihrZXkgPT4gdmFsdWVba2V5XSAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdC5tYXAoa2V5ID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IGFkYXB0ZWRWYWx1ZSA9IGFkYXB0SXRlbVRvWFBhdGhWYWx1ZSh2YWx1ZVtrZXldKTtcblx0XHRcdFx0XHRcdGxldCBhZGFwdGVkU2VxdWVuY2U7XG5cdFx0XHRcdFx0XHRpZiAoYWRhcHRlZFZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGFkYXB0ZWRTZXF1ZW5jZSA9IFNlcXVlbmNlRmFjdG9yeS5lbXB0eSgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0YWRhcHRlZFNlcXVlbmNlID0gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihhZGFwdGVkVmFsdWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRrZXk6IGNyZWF0ZUF0b21pY1ZhbHVlKGtleSwgJ3hzOnN0cmluZycpLFxuXHRcdFx0XHRcdFx0dmFsdWU6ICgpID0+IGFkYXB0ZWRTZXF1ZW5jZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pKTtcblx0fVxuXHR0aHJvdyBuZXcgRXJyb3IoYFZhbHVlICR7dmFsdWV9IG9mIHR5cGUgXCIke3R5cGVvZiB2YWx1ZX1cIiBpcyBub3QgYWRhcHRhYmxlIHRvIGFuIFhQYXRoIHZhbHVlLmApO1xufVxuXG4vKipcbiAqIEFkYXB0IGEgSmF2YVNjcmlwdCB2YWx1ZSB0byB0aGUgZXF1aXZhbGVudCBpbiBYUGF0aC4gVGhpcyB0cmllcyB0byBrZWVwIHRoZSBwcmVmZXJyZWQgdHlwZVxuICpcbiAqIEBwYXJhbSAgdmFsdWVcbiAqIEByZXR1cm4gTnVsbCBpZiB0aGUgdmFsdWUgaXMgYWJzZW50IGFuZCB0aGUgZW1wdHkgc2VxdWVuY2Ugc2hvdWxkIGJlIG91dHB1dHRlZCBpbnN0ZWFkXG4gKi9cbmZ1bmN0aW9uIGFkYXB0SmF2YVNjcmlwdFZhbHVlVG9YUGF0aFZhbHVlKHR5cGUsIHZhbHVlOiBhbnkpOiBWYWx1ZSB8IG51bGwge1xuXHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRjYXNlICd4czpib29sZWFuJzpcblx0XHRcdHJldHVybiB2YWx1ZSA/IHRydWVCb29sZWFuIDogZmFsc2VCb29sZWFuO1xuXHRcdGNhc2UgJ3hzOnN0cmluZyc6XG5cdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUodmFsdWUgKyAnJywgJ3hzOnN0cmluZycpO1xuXHRcdGNhc2UgJ3hzOmRvdWJsZSc6XG5cdFx0Y2FzZSAneHM6bnVtZXJpYyc6XG5cdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoK3ZhbHVlLCAneHM6ZG91YmxlJyk7XG5cdFx0Y2FzZSAneHM6ZGVjaW1hbCc6XG5cdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoK3ZhbHVlLCAneHM6ZGVjaW1hbCcpO1xuXHRcdGNhc2UgJ3hzOmludGVnZXInOlxuXHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHZhbHVlIHwgMCwgJ3hzOmludGVnZXInKTtcblx0XHRjYXNlICd4czpmbG9hdCc6XG5cdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoK3ZhbHVlLCAneHM6ZmxvYXQnKTtcblx0XHRjYXNlICd4czpkYXRlJzpcblx0XHRjYXNlICd4czp0aW1lJzpcblx0XHRjYXNlICd4czpkYXRlVGltZSc6XG5cdFx0Y2FzZSAneHM6Z1llYXJNb250aCc6XG5cdFx0Y2FzZSAneHM6Z1llYXInOlxuXHRcdGNhc2UgJ3hzOmdNb250aERheSc6XG5cdFx0Y2FzZSAneHM6Z01vbnRoJzpcblx0XHRjYXNlICd4czpnRGF5Jzpcblx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShEYXRlVGltZS5mcm9tU3RyaW5nKHZhbHVlLnRvSVNPU3RyaW5nKCkpLmNvbnZlcnRUb1R5cGUodHlwZSksIHR5cGUpO1xuXHRcdGNhc2UgJ25vZGUoKSc6XG5cdFx0Y2FzZSAnZWxlbWVudCgpJzpcblx0XHRjYXNlICd0ZXh0Jzpcblx0XHRjYXNlICdjb21tZW50KCknOlxuXHRcdFx0cmV0dXJuIGNyZWF0ZU5vZGVWYWx1ZSh2YWx1ZSk7XG5cdFx0Y2FzZSAnaXRlbSgpJzpcblx0XHRcdHJldHVybiBhZGFwdEl0ZW1Ub1hQYXRoVmFsdWUodmFsdWUpO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFZhbHVlcyBvZiB0aGUgdHlwZSBcIiR7dHlwZX1cIiBjYW4gbm90IGJlIGFkYXB0ZWQgdG8gZXF1aXZhbGVudCBYUGF0aCB2YWx1ZXMuYCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRhcHRKYXZhU2NyaXB0VmFsdWVUb1hQYXRoKHZhbHVlOiBhbnksIGV4cGVjdGVkVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogSVNlcXVlbmNlIHtcblx0ZXhwZWN0ZWRUeXBlID0gZXhwZWN0ZWRUeXBlIHx8ICdpdGVtKCk/JztcblxuXHRjb25zdCBwYXJ0cyA9IGV4cGVjdGVkVHlwZS5tYXRjaCgvXihbXis/Kl0qKShbXFwrXFwqXFw/XSk/JC8pLFxuXHRcdHR5cGUgPSBwYXJ0c1sxXSxcblx0XHRtdWx0aXBsaWNpdHkgPSBwYXJ0c1syXTtcblxuXHRzd2l0Y2ggKG11bHRpcGxpY2l0eSkge1xuXHRcdGNhc2UgJz8nOlxuXHRcdFx0Y29uc3QgYWRhcHRlZFZhbHVlID0gYWRhcHRKYXZhU2NyaXB0VmFsdWVUb1hQYXRoVmFsdWUodHlwZSwgdmFsdWUpO1xuXHRcdFx0aWYgKGFkYXB0ZWRWYWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmVtcHR5KCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihhZGFwdGVkVmFsdWUpO1xuXG5cdFx0Y2FzZSAnKyc6XG5cdFx0Y2FzZSAnKic6IHtcblx0XHRcdGNvbnN0IGNvbnZlcnRlZFZhbHVlcyA9IHZhbHVlLm1hcChhZGFwdEphdmFTY3JpcHRWYWx1ZVRvWFBhdGhWYWx1ZS5iaW5kKG51bGwsIHR5cGUpKTtcblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKFxuXHRcdFx0XHRjb252ZXJ0ZWRWYWx1ZXMuZmlsdGVyKGNvbnZlcnRlZFZhbHVlID0+IGNvbnZlcnRlZFZhbHVlICE9PSBudWxsKSk7XG5cdFx0fVxuXG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0Y29uc3QgYWRhcHRlZFZhbHVlID0gYWRhcHRKYXZhU2NyaXB0VmFsdWVUb1hQYXRoVmFsdWUodHlwZSwgdmFsdWUpO1xuXHRcdFx0aWYgKGFkYXB0ZWRWYWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmVtcHR5KCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihhZGFwdGVkVmFsdWUpO1xuXHRcdH1cblx0fVxufVxuIl19