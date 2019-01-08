"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createAtomicValue_1 = require("./createAtomicValue");
const isSubtypeOf_1 = require("./isSubtypeOf");
function promoteToType(value, type) {
    if (isSubtypeOf_1.default(value.type, 'xs:numeric')) {
        if (isSubtypeOf_1.default(value.type, 'xs:float')) {
            if (type === 'xs:double') {
                return createAtomicValue_1.default(value.value, 'xs:double');
            }
            return null;
        }
        if (isSubtypeOf_1.default(value.type, 'xs:decimal')) {
            if (type === 'xs:float') {
                return createAtomicValue_1.default(value.value, 'xs:float');
            }
            if (type === 'xs:double') {
                return createAtomicValue_1.default(value.value, 'xs:double');
            }
        }
        return null;
    }
    if (isSubtypeOf_1.default(value.type, 'xs:anyURI')) {
        if (type === 'xs:string') {
            return createAtomicValue_1.default(value.value, 'xs:string');
        }
    }
    return null;
}
exports.default = promoteToType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbW90ZVRvVHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByb21vdGVUb1R5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFBb0Q7QUFDcEQsK0NBQXdDO0FBRXhDLFNBQXdCLGFBQWEsQ0FBRSxLQUFLLEVBQUUsSUFBSTtJQUNqRCxJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsRUFBRTtRQUMxQyxJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN4QyxJQUFJLElBQUksS0FBSyxXQUFXLEVBQUU7Z0JBQ3pCLE9BQU8sMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNuRDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxJQUFJLHFCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsRUFBRTtZQUMxQyxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7Z0JBQ3hCLE9BQU8sMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNsRDtZQUNELElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRTtnQkFDekIsT0FBTywyQkFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ25EO1NBRUQ7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNaO0lBRUQsSUFBSSxxQkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQUU7UUFDekMsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ3pCLE9BQU8sMkJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNuRDtLQUNEO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBMUJELGdDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcmVhdGVBdG9taWNWYWx1ZSBmcm9tICcuL2NyZWF0ZUF0b21pY1ZhbHVlJztcbmltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuL2lzU3VidHlwZU9mJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJvbW90ZVRvVHlwZSAodmFsdWUsIHR5cGUpIHtcblx0aWYgKGlzU3VidHlwZU9mKHZhbHVlLnR5cGUsICd4czpudW1lcmljJykpIHtcblx0XHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmZsb2F0JykpIHtcblx0XHRcdGlmICh0eXBlID09PSAneHM6ZG91YmxlJykge1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUodmFsdWUudmFsdWUsICd4czpkb3VibGUnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRpZiAoaXNTdWJ0eXBlT2YodmFsdWUudHlwZSwgJ3hzOmRlY2ltYWwnKSkge1xuXHRcdFx0aWYgKHR5cGUgPT09ICd4czpmbG9hdCcpIHtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUF0b21pY1ZhbHVlKHZhbHVlLnZhbHVlLCAneHM6ZmxvYXQnKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlID09PSAneHM6ZG91YmxlJykge1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQXRvbWljVmFsdWUodmFsdWUudmFsdWUsICd4czpkb3VibGUnKTtcblx0XHRcdH1cblxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGlmIChpc1N1YnR5cGVPZih2YWx1ZS50eXBlLCAneHM6YW55VVJJJykpIHtcblx0XHRpZiAodHlwZSA9PT0gJ3hzOnN0cmluZycpIHtcblx0XHRcdHJldHVybiBjcmVhdGVBdG9taWNWYWx1ZSh2YWx1ZS52YWx1ZSwgJ3hzOnN0cmluZycpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cbiJdfQ==