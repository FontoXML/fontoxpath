"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isSubtypeOf_1 = require("./isSubtypeOf");
const createAtomicValue_1 = require("./createAtomicValue");
const TEXT_NODE = 3;
function atomize(value, executionParameters) {
    if (isSubtypeOf_1.default(value.type, 'xs:anyAtomicType') ||
        isSubtypeOf_1.default(value.type, 'xs:untypedAtomic') ||
        isSubtypeOf_1.default(value.type, 'xs:boolean') ||
        isSubtypeOf_1.default(value.type, 'xs:decimal') ||
        isSubtypeOf_1.default(value.type, 'xs:double') ||
        isSubtypeOf_1.default(value.type, 'xs:float') ||
        isSubtypeOf_1.default(value.type, 'xs:integer') ||
        isSubtypeOf_1.default(value.type, 'xs:numeric') ||
        isSubtypeOf_1.default(value.type, 'xs:QName') ||
        isSubtypeOf_1.default(value.type, 'xs:string')) {
        return value;
    }
    if (isSubtypeOf_1.default(value.type, 'node()')) {
        const /** Node */ node = value.value;
        // TODO: Mix in types, by default get string value
        if (isSubtypeOf_1.default(value.type, 'attribute()')) {
            return createAtomicValue_1.default(node.value, 'xs:untypedAtomic');
        }
        // Text nodes and documents should return their text, as untyped atomic
        if (isSubtypeOf_1.default(value.type, 'text()')) {
            return createAtomicValue_1.default(executionParameters.domFacade.getData(node), 'xs:untypedAtomic');
        }
        // comments and PIs are string
        if (isSubtypeOf_1.default(value.type, 'comment()') || isSubtypeOf_1.default(value.type, 'processing-instruction()')) {
            return createAtomicValue_1.default(executionParameters.domFacade.getData(node), 'xs:string');
        }
        // This is an element or a document node. Because we do not know the specific type of this element.
        // Documents should always be an untypedAtomic, of elements, we do not know the type, so they are untypedAtomic too
        const allTextNodes = [];
        (function getTextNodes(node) {
            if (node.nodeType === TEXT_NODE || node.nodeType === 4) {
                allTextNodes.push(node);
                return;
            }
            executionParameters.domFacade.getChildNodes(node)
                .forEach(function (childNode) {
                getTextNodes(childNode);
            });
        })(node);
        return createAtomicValue_1.default(allTextNodes.map(function (textNode) {
            return executionParameters.domFacade.getData(textNode);
        }).join(''), 'xs:untypedAtomic');
    }
    // (function || map) && !array
    if (isSubtypeOf_1.default(value.type, 'function(*)') && !isSubtypeOf_1.default(value.type, 'array(*)')) {
        throw new Error(`FOTY0013: Atomization is not supported for ${value.type}.`);
    }
    throw new Error(`Atomizing ${value.type} is not implemented.`);
}
exports.default = atomize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRvbWl6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF0b21pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQ0FBd0M7QUFDeEMsMkRBQW9EO0FBTXBELE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQztBQUVwQixTQUF3QixPQUFPLENBQUMsS0FBWSxFQUFFLG1CQUF3QztJQUNyRixJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQztRQUM5QyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUM7UUFDM0MscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztRQUNyQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO1FBQ3JDLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUM7UUFDcEMscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztRQUNuQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDO1FBQ3JDLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUM7UUFDckMscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztRQUNuQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQUU7UUFDdEMsT0FBTyxLQUFLLENBQUM7S0FDYjtJQUVELElBQUkscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1FBQ3RDLE1BQU0sV0FBVyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRXJDLGtEQUFrRDtRQUNsRCxJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsRUFBRTtZQUMzQyxPQUFPLDJCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUN6RDtRQUVELHVFQUF1RTtRQUN2RSxJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRTtZQUN0QyxPQUFPLDJCQUFpQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUMxRjtRQUNELDhCQUE4QjtRQUM5QixJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtZQUNoRyxPQUFPLDJCQUFpQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDbkY7UUFFRCxtR0FBbUc7UUFDbkcsbUhBQW1IO1FBQ25ILE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN4QixDQUFDLFNBQVMsWUFBWSxDQUFFLElBQUk7WUFDM0IsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtnQkFDdkQsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEIsT0FBTzthQUNQO1lBQ0QsbUJBQW1CLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQy9DLE9BQU8sQ0FBQyxVQUFVLFNBQVM7Z0JBQzNCLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRVQsT0FBTywyQkFBaUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsUUFBUTtZQUMzRCxPQUFPLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7S0FDakM7SUFFRCw4QkFBOEI7SUFDOUIsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUU7UUFDbkYsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7S0FDN0U7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsS0FBSyxDQUFDLElBQUksc0JBQXNCLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBdkRELDBCQXVEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuL2lzU3VidHlwZU9mJztcbmltcG9ydCBjcmVhdGVBdG9taWNWYWx1ZSBmcm9tICcuL2NyZWF0ZUF0b21pY1ZhbHVlJztcblxuaW1wb3J0IFZhbHVlIGZyb20gJy4vVmFsdWUnO1xuaW1wb3J0IEF0b21pY1ZhbHVlIGZyb20gJy4vQXRvbWljVmFsdWUnO1xuaW1wb3J0IEV4ZWN1dGlvblBhcmFtZXRlcnMgZnJvbSAnLi4vRXhlY3V0aW9uUGFyYW1ldGVycyc7XG5cbmNvbnN0IFRFWFRfTk9ERSA9IDM7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGF0b21pemUodmFsdWU6IFZhbHVlLCBleGVjdXRpb25QYXJhbWV0ZXJzOiBFeGVjdXRpb25QYXJhbWV0ZXJzKTogQXRvbWljVmFsdWUge1xuXHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmFueUF0b21pY1R5cGUnKSB8fFxuXHRcdGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czp1bnR5cGVkQXRvbWljJykgfHxcblx0XHRpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6Ym9vbGVhbicpIHx8XG5cdFx0aXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmRlY2ltYWwnKSB8fFxuXHRcdGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpkb3VibGUnKSB8fFxuXHRcdGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpmbG9hdCcpIHx8XG5cdFx0aXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmludGVnZXInKSB8fFxuXHRcdGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpudW1lcmljJykgfHxcblx0XHRpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6UU5hbWUnKSB8fFxuXHRcdGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpzdHJpbmcnKSkge1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdGlmIChpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAnbm9kZSgpJykpIHtcblx0XHRjb25zdCAvKiogTm9kZSAqLyBub2RlID0gdmFsdWUudmFsdWU7XG5cblx0XHQvLyBUT0RPOiBNaXggaW4gdHlwZXMsIGJ5IGRlZmF1bHQgZ2V0IHN0cmluZyB2YWx1ZVxuXHRcdGlmIChpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAnYXR0cmlidXRlKCknKSkge1xuXHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKG5vZGUudmFsdWUsICd4czp1bnR5cGVkQXRvbWljJyk7XG5cdFx0fVxuXG5cdFx0Ly8gVGV4dCBub2RlcyBhbmQgZG9jdW1lbnRzIHNob3VsZCByZXR1cm4gdGhlaXIgdGV4dCwgYXMgdW50eXBlZCBhdG9taWNcblx0XHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3RleHQoKScpKSB7XG5cdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUoZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGUuZ2V0RGF0YShub2RlKSwgJ3hzOnVudHlwZWRBdG9taWMnKTtcblx0XHR9XG5cdFx0Ly8gY29tbWVudHMgYW5kIFBJcyBhcmUgc3RyaW5nXG5cdFx0aWYgKGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICdjb21tZW50KCknKSB8fCBpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAncHJvY2Vzc2luZy1pbnN0cnVjdGlvbigpJykpIHtcblx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZShleGVjdXRpb25QYXJhbWV0ZXJzLmRvbUZhY2FkZS5nZXREYXRhKG5vZGUpLCAneHM6c3RyaW5nJyk7XG5cdFx0fVxuXG5cdFx0Ly8gVGhpcyBpcyBhbiBlbGVtZW50IG9yIGEgZG9jdW1lbnQgbm9kZS4gQmVjYXVzZSB3ZSBkbyBub3Qga25vdyB0aGUgc3BlY2lmaWMgdHlwZSBvZiB0aGlzIGVsZW1lbnQuXG5cdFx0Ly8gRG9jdW1lbnRzIHNob3VsZCBhbHdheXMgYmUgYW4gdW50eXBlZEF0b21pYywgb2YgZWxlbWVudHMsIHdlIGRvIG5vdCBrbm93IHRoZSB0eXBlLCBzbyB0aGV5IGFyZSB1bnR5cGVkQXRvbWljIHRvb1xuXHRcdGNvbnN0IGFsbFRleHROb2RlcyA9IFtdO1xuXHRcdChmdW5jdGlvbiBnZXRUZXh0Tm9kZXMgKG5vZGUpIHtcblx0XHRcdGlmIChub2RlLm5vZGVUeXBlID09PSBURVhUX05PREUgfHwgbm9kZS5ub2RlVHlwZSA9PT0gNCkge1xuXHRcdFx0XHRhbGxUZXh0Tm9kZXMucHVzaChub2RlKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGUuZ2V0Q2hpbGROb2Rlcyhub2RlKVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGROb2RlKSB7XG5cdFx0XHRcdFx0Z2V0VGV4dE5vZGVzKGNoaWxkTm9kZSk7XG5cdFx0XHRcdH0pO1xuXHRcdH0pKG5vZGUpO1xuXG5cdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKGFsbFRleHROb2Rlcy5tYXAoZnVuY3Rpb24gKHRleHROb2RlKSB7XG5cdFx0XHRyZXR1cm4gZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGUuZ2V0RGF0YSh0ZXh0Tm9kZSk7XG5cdFx0fSkuam9pbignJyksICd4czp1bnR5cGVkQXRvbWljJyk7XG5cdH1cblxuXHQvLyAoZnVuY3Rpb24gfHwgbWFwKSAmJiAhYXJyYXlcblx0aWYgKGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICdmdW5jdGlvbigqKScpICYmICFpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAnYXJyYXkoKiknKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgRk9UWTAwMTM6IEF0b21pemF0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgZm9yICR7dmFsdWUudHlwZX0uYCk7XG5cdH1cblx0dGhyb3cgbmV3IEVycm9yKGBBdG9taXppbmcgJHt2YWx1ZS50eXBlfSBpcyBub3QgaW1wbGVtZW50ZWQuYCk7XG59XG4iXX0=