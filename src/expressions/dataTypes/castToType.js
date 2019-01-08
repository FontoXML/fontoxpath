"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tryCastToType_1 = require("./casting/tryCastToType");
function castToType(value, type) {
    const result = tryCastToType_1.default(value, type);
    if (result.successful) {
        return result.value;
    }
    throw result.error;
}
exports.default = castToType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzdFRvVHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhc3RUb1R5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFBb0Q7QUFHcEQsU0FBd0IsVUFBVSxDQUFDLEtBQWtCLEVBQUUsSUFBWTtJQUNsRSxNQUFNLE1BQU0sR0FBRyx1QkFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7UUFDdEIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDO0tBQ3BCO0lBQ0QsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3BCLENBQUM7QUFORCw2QkFNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0cnlDYXN0VG9UeXBlIGZyb20gJy4vY2FzdGluZy90cnlDYXN0VG9UeXBlJztcbmltcG9ydCBBdG9taWNWYWx1ZSBmcm9tICcuL0F0b21pY1ZhbHVlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2FzdFRvVHlwZSh2YWx1ZTogQXRvbWljVmFsdWUsIHR5cGU6IHN0cmluZyk6IEF0b21pY1ZhbHVlIHtcblx0Y29uc3QgcmVzdWx0ID0gdHJ5Q2FzdFRvVHlwZSh2YWx1ZSwgdHlwZSk7XG5cdGlmIChyZXN1bHQuc3VjY2Vzc2Z1bCkge1xuXHRcdHJldHVybiByZXN1bHQudmFsdWU7XG5cdH1cblx0dGhyb3cgcmVzdWx0LmVycm9yO1xufVxuIl19