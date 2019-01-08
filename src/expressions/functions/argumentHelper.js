"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const castToType_1 = require("../dataTypes/castToType");
const promoteToType_1 = require("../dataTypes/promoteToType");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
const atomize_1 = require("../dataTypes/atomize");
function mapItem(argumentItem, type, executionParameters, functionName) {
    if (isSubtypeOf_1.default(argumentItem.type, type)) {
        return argumentItem;
    }
    if (isSubtypeOf_1.default(argumentItem.type, 'node()')) {
        argumentItem = atomize_1.default(argumentItem, executionParameters);
    }
    // Everything is an anyAtomicType, so no casting necessary.
    if (type === 'xs:anyAtomicType') {
        return argumentItem;
    }
    if (isSubtypeOf_1.default(argumentItem.type, 'xs:untypedAtomic')) {
        // We might be able to cast this to the wished type
        const item = castToType_1.default(argumentItem, type);
        if (!item) {
            throw new Error(`XPTY0004 Unable to convert ${argumentItem.type} to type ${type} while calling ${functionName}`);
        }
        return item;
    }
    // We need to promote this
    const item = promoteToType_1.default(argumentItem, type);
    if (!item) {
        throw new Error(`XPTY0004 Unable to cast ${argumentItem.type} to type ${type} while calling ${functionName}`);
    }
    return item;
}
/**
 * Test whether the provided argument is valid to be used as an function argument of the given type
 */
exports.transformArgument = (argumentType, argument, executionParameters, functionName) => {
    switch (argumentType.occurrence) {
        case '?':
            return argument.switchCases({
                default: () => argument.map(value => mapItem(value, argumentType.type, executionParameters, functionName)),
                multiple: () => {
                    throw new Error(`XPTY0004: Multiplicity of function argument of type ${argumentType.type}${argumentType.occurrence} for ${functionName} is incorrect. Expected "?", but got "+".`);
                }
            });
        case '+':
            return argument.switchCases({
                empty: () => {
                    throw new Error(`XPTY0004: Multiplicity of function argument of type ${argumentType.type}${argumentType.occurrence} for ${functionName} is incorrect. Expected "+", but got "empty-sequence()"`);
                },
                default: () => argument.map(value => mapItem(value, argumentType.type, executionParameters, functionName))
            });
        case '*':
            return argument.map(value => mapItem(value, argumentType.type, executionParameters, functionName));
        default:
            // excactly one
            return argument.switchCases({
                singleton: () => argument.map(value => mapItem(value, argumentType.type, executionParameters, functionName)),
                default: () => {
                    throw new Error(`XPTY0004: Multiplicity of function argument of type ${argumentType.type}${argumentType.occurrence} for ${functionName} is incorrect. Expected exactly one`);
                }
            });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcmd1bWVudEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHdEQUFpRDtBQUNqRCw4REFBdUQ7QUFDdkQsMERBQW1EO0FBQ25ELGtEQUEyQztBQUszQyxTQUFTLE9BQU8sQ0FBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFlBQVk7SUFDdEUsSUFBSSxxQkFBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDekMsT0FBTyxZQUFZLENBQUM7S0FDcEI7SUFFRCxJQUFJLHFCQUFXLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRTtRQUM3QyxZQUFZLEdBQUcsaUJBQU8sQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztLQUMxRDtJQUNELDJEQUEyRDtJQUMzRCxJQUFJLElBQUksS0FBSyxrQkFBa0IsRUFBRTtRQUNoQyxPQUFPLFlBQVksQ0FBQztLQUNwQjtJQUNELElBQUkscUJBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7UUFDdkQsbURBQW1EO1FBQ25ELE1BQU0sSUFBSSxHQUFHLG9CQUFVLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVixNQUFNLElBQUksS0FBSyxDQUNkLDhCQUE4QixZQUFZLENBQUMsSUFBSSxZQUFZLElBQUksa0JBQWtCLFlBQVksRUFBRSxDQUFDLENBQUM7U0FDbEc7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNaO0lBRUQsMEJBQTBCO0lBQzFCLE1BQU0sSUFBSSxHQUFHLHVCQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVixNQUFNLElBQUksS0FBSyxDQUNkLDJCQUEyQixZQUFZLENBQUMsSUFBSSxZQUFZLElBQUksa0JBQWtCLFlBQVksRUFBRSxDQUFDLENBQUM7S0FDL0Y7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFFRDs7R0FFRztBQUNVLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxZQUE2QixFQUFFLFFBQW1CLEVBQUUsbUJBQXdDLEVBQUUsWUFBb0IsRUFBYSxFQUFFO0lBQ2xLLFFBQVEsWUFBWSxDQUFDLFVBQVUsRUFBRTtRQUNoQyxLQUFLLEdBQUc7WUFDUCxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQzNCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUMxRyxRQUFRLEVBQUUsR0FBRyxFQUFFO29CQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELFlBQVksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLFVBQVUsUUFBUSxZQUFZLDJDQUEyQyxDQUFDLENBQUM7Z0JBQ3BMLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixLQUFLLEdBQUc7WUFDUCxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQzNCLEtBQUssRUFBRSxHQUFHLEVBQUU7b0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsWUFBWSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxRQUFRLFlBQVkseURBQXlELENBQUMsQ0FBQztnQkFDbE0sQ0FBQztnQkFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUMxRyxDQUFDLENBQUM7UUFDSixLQUFLLEdBQUc7WUFDUCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNwRztZQUNDLGVBQWU7WUFDZixPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQzNCLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUM1RyxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLE1BQU0sSUFBSSxLQUFLLENBQ2QsdURBQXVELFlBQVksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLFVBQVUsUUFBUSxZQUFZLHFDQUFxQyxDQUFDLENBQUM7Z0JBQ25LLENBQUM7YUFDRyxDQUFDLENBQUM7S0FDSjtBQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeGVjdXRpb25QYXJhbWV0ZXJzIGZyb20gJy4uL0V4ZWN1dGlvblBhcmFtZXRlcnMnO1xuaW1wb3J0IGNhc3RUb1R5cGUgZnJvbSAnLi4vZGF0YVR5cGVzL2Nhc3RUb1R5cGUnO1xuaW1wb3J0IHByb21vdGVUb1R5cGUgZnJvbSAnLi4vZGF0YVR5cGVzL3Byb21vdGVUb1R5cGUnO1xuaW1wb3J0IGlzU3VidHlwZU9mIGZyb20gJy4uL2RhdGFUeXBlcy9pc1N1YnR5cGVPZic7XG5pbXBvcnQgYXRvbWl6ZSBmcm9tICcuLi9kYXRhVHlwZXMvYXRvbWl6ZSc7XG5cbmltcG9ydCBJU2VxdWVuY2UgZnJvbSAnLi4vZGF0YVR5cGVzL0lTZXF1ZW5jZSc7XG5pbXBvcnQgVHlwZURlY2xhcmF0aW9uIGZyb20gJy4uL2RhdGFUeXBlcy9UeXBlRGVjbGFyYXRpb24nO1xuXG5mdW5jdGlvbiBtYXBJdGVtIChhcmd1bWVudEl0ZW0sIHR5cGUsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIGZ1bmN0aW9uTmFtZSkge1xuXHRpZiAoaXNTdWJ0eXBlT2YoYXJndW1lbnRJdGVtLnR5cGUsIHR5cGUpKSB7XG5cdFx0cmV0dXJuIGFyZ3VtZW50SXRlbTtcblx0fVxuXG5cdGlmIChpc1N1YnR5cGVPZihhcmd1bWVudEl0ZW0udHlwZSwgJ25vZGUoKScpKSB7XG5cdFx0YXJndW1lbnRJdGVtID0gYXRvbWl6ZShhcmd1bWVudEl0ZW0sIGV4ZWN1dGlvblBhcmFtZXRlcnMpO1xuXHR9XG5cdC8vIEV2ZXJ5dGhpbmcgaXMgYW4gYW55QXRvbWljVHlwZSwgc28gbm8gY2FzdGluZyBuZWNlc3NhcnkuXG5cdGlmICh0eXBlID09PSAneHM6YW55QXRvbWljVHlwZScpIHtcblx0XHRyZXR1cm4gYXJndW1lbnRJdGVtO1xuXHR9XG5cdGlmIChpc1N1YnR5cGVPZihhcmd1bWVudEl0ZW0udHlwZSwgJ3hzOnVudHlwZWRBdG9taWMnKSkge1xuXHRcdC8vIFdlIG1pZ2h0IGJlIGFibGUgdG8gY2FzdCB0aGlzIHRvIHRoZSB3aXNoZWQgdHlwZVxuXHRcdGNvbnN0IGl0ZW0gPSBjYXN0VG9UeXBlKGFyZ3VtZW50SXRlbSwgdHlwZSk7XG5cdFx0aWYgKCFpdGVtKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdGBYUFRZMDAwNCBVbmFibGUgdG8gY29udmVydCAke2FyZ3VtZW50SXRlbS50eXBlfSB0byB0eXBlICR7dHlwZX0gd2hpbGUgY2FsbGluZyAke2Z1bmN0aW9uTmFtZX1gKTtcblx0XHR9XG5cdFx0cmV0dXJuIGl0ZW07XG5cdH1cblxuXHQvLyBXZSBuZWVkIHRvIHByb21vdGUgdGhpc1xuXHRjb25zdCBpdGVtID0gcHJvbW90ZVRvVHlwZShhcmd1bWVudEl0ZW0sIHR5cGUpO1xuXHRpZiAoIWl0ZW0pIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRgWFBUWTAwMDQgVW5hYmxlIHRvIGNhc3QgJHthcmd1bWVudEl0ZW0udHlwZX0gdG8gdHlwZSAke3R5cGV9IHdoaWxlIGNhbGxpbmcgJHtmdW5jdGlvbk5hbWV9YCk7XG5cdH1cblx0cmV0dXJuIGl0ZW07XG59XG5cbi8qKlxuICogVGVzdCB3aGV0aGVyIHRoZSBwcm92aWRlZCBhcmd1bWVudCBpcyB2YWxpZCB0byBiZSB1c2VkIGFzIGFuIGZ1bmN0aW9uIGFyZ3VtZW50IG9mIHRoZSBnaXZlbiB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1Bcmd1bWVudCA9IChhcmd1bWVudFR5cGU6IFR5cGVEZWNsYXJhdGlvbiwgYXJndW1lbnQ6IElTZXF1ZW5jZSwgZXhlY3V0aW9uUGFyYW1ldGVyczogRXhlY3V0aW9uUGFyYW1ldGVycywgZnVuY3Rpb25OYW1lOiBzdHJpbmcpOiBJU2VxdWVuY2UgPT4ge1xuXHRzd2l0Y2ggKGFyZ3VtZW50VHlwZS5vY2N1cnJlbmNlKSB7XG5cdFx0Y2FzZSAnPyc6XG5cdFx0XHRyZXR1cm4gYXJndW1lbnQuc3dpdGNoQ2FzZXMoe1xuXHRcdFx0XHRkZWZhdWx0OiAoKSA9PiBhcmd1bWVudC5tYXAodmFsdWUgPT4gbWFwSXRlbSh2YWx1ZSwgYXJndW1lbnRUeXBlLnR5cGUsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIGZ1bmN0aW9uTmFtZSkpLFxuXHRcdFx0XHRtdWx0aXBsZTogKCkgPT4ge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgWFBUWTAwMDQ6IE11bHRpcGxpY2l0eSBvZiBmdW5jdGlvbiBhcmd1bWVudCBvZiB0eXBlICR7YXJndW1lbnRUeXBlLnR5cGV9JHthcmd1bWVudFR5cGUub2NjdXJyZW5jZX0gZm9yICR7ZnVuY3Rpb25OYW1lfSBpcyBpbmNvcnJlY3QuIEV4cGVjdGVkIFwiP1wiLCBidXQgZ290IFwiK1wiLmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRjYXNlICcrJzpcblx0XHRcdHJldHVybiBhcmd1bWVudC5zd2l0Y2hDYXNlcyh7XG5cdFx0XHRcdGVtcHR5OiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBYUFRZMDAwNDogTXVsdGlwbGljaXR5IG9mIGZ1bmN0aW9uIGFyZ3VtZW50IG9mIHR5cGUgJHthcmd1bWVudFR5cGUudHlwZX0ke2FyZ3VtZW50VHlwZS5vY2N1cnJlbmNlfSBmb3IgJHtmdW5jdGlvbk5hbWV9IGlzIGluY29ycmVjdC4gRXhwZWN0ZWQgXCIrXCIsIGJ1dCBnb3QgXCJlbXB0eS1zZXF1ZW5jZSgpXCJgKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGVmYXVsdDogKCkgPT4gYXJndW1lbnQubWFwKHZhbHVlID0+IG1hcEl0ZW0odmFsdWUsIGFyZ3VtZW50VHlwZS50eXBlLCBleGVjdXRpb25QYXJhbWV0ZXJzLCBmdW5jdGlvbk5hbWUpKVxuXHRcdFx0fSk7XG5cdFx0Y2FzZSAnKic6XG5cdFx0XHRyZXR1cm4gYXJndW1lbnQubWFwKHZhbHVlID0+IG1hcEl0ZW0odmFsdWUsIGFyZ3VtZW50VHlwZS50eXBlLCBleGVjdXRpb25QYXJhbWV0ZXJzLCBmdW5jdGlvbk5hbWUpKTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gZXhjYWN0bHkgb25lXG5cdFx0XHRyZXR1cm4gYXJndW1lbnQuc3dpdGNoQ2FzZXMoe1xuXHRcdFx0XHRzaW5nbGV0b246ICgpID0+IGFyZ3VtZW50Lm1hcCh2YWx1ZSA9PiBtYXBJdGVtKHZhbHVlLCBhcmd1bWVudFR5cGUudHlwZSwgZXhlY3V0aW9uUGFyYW1ldGVycywgZnVuY3Rpb25OYW1lKSksXG5cdFx0XHRcdGRlZmF1bHQ6ICgpID0+IHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHRgWFBUWTAwMDQ6IE11bHRpcGxpY2l0eSBvZiBmdW5jdGlvbiBhcmd1bWVudCBvZiB0eXBlICR7YXJndW1lbnRUeXBlLnR5cGV9JHthcmd1bWVudFR5cGUub2NjdXJyZW5jZX0gZm9yICR7ZnVuY3Rpb25OYW1lfSBpcyBpbmNvcnJlY3QuIEV4cGVjdGVkIGV4YWN0bHkgb25lYCk7XG59XG5cdFx0XHR9KTtcblx0fVxufTtcbiJdfQ==