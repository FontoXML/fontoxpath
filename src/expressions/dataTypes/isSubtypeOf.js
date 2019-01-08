"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builtinDataTypesByName_1 = require("./builtins/builtinDataTypesByName");
function isSubtypeOfType(subType, superType) {
    if (superType.variety === 'union') {
        // It is a union type, which can only be the topmost types
        return !!superType.memberTypes.find(memberType => isSubtypeOfType(subType, memberType));
    }
    while (subType) {
        if (subType.name === superType.name) {
            return true;
        }
        if (subType.variety === 'union') {
            return !!subType.memberTypes.find(memberType => isSubtypeOfType(memberType, superType));
        }
        subType = subType.parent;
    }
    return false;
}
/**
 * xs:int is a subtype of xs:integer
 * xs:decimal is a subtype of xs:numeric
 * xs:NMTOKENS is a subtype of xs:NM TOKEN
 */
function isSubtypeOf(subTypeName, superTypeName) {
    if (subTypeName === superTypeName) {
        return true;
    }
    const superType = builtinDataTypesByName_1.default[superTypeName];
    const subType = builtinDataTypesByName_1.default[subTypeName];
    if (!superType) {
        if (!superTypeName.startsWith('xs:')) {
            // Note that 'xs' is the only namespace currently supported
            throw new Error(`XPST0081: The type ${superTypeName} could not be found.`);
        }
        throw new Error(`XPST0051: The type ${superTypeName} could not be found.`);
    }
    return isSubtypeOfType(subType, superType);
}
exports.default = isSubtypeOf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNTdWJ0eXBlT2YuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpc1N1YnR5cGVPZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhFQUF1RTtBQUV2RSxTQUFTLGVBQWUsQ0FBRSxPQUFPLEVBQUUsU0FBUztJQUMzQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO1FBQ2xDLDBEQUEwRDtRQUMxRCxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUN4RjtJQUVELE9BQU8sT0FBTyxFQUFFO1FBQ2YsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEVBQUU7WUFDcEMsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxPQUFPLEVBQUU7WUFDaEMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDeEY7UUFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUN6QjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUF3QixXQUFXLENBQUMsV0FBbUIsRUFBRSxhQUFxQjtJQUM3RSxJQUFJLFdBQVcsS0FBSyxhQUFhLEVBQUU7UUFDbEMsT0FBTyxJQUFJLENBQUM7S0FDWjtJQUVELE1BQU0sU0FBUyxHQUFHLGdDQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sT0FBTyxHQUFHLGdDQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXBELElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDZixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQywyREFBMkQ7WUFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsYUFBYSxzQkFBc0IsQ0FBQyxDQUFDO1NBQzNFO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsYUFBYSxzQkFBc0IsQ0FBQyxDQUFDO0tBQzNFO0lBRUQsT0FBTyxlQUFlLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFqQkQsOEJBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJ1aWx0aW5EYXRhVHlwZXNCeU5hbWUgZnJvbSAnLi9idWlsdGlucy9idWlsdGluRGF0YVR5cGVzQnlOYW1lJztcblxuZnVuY3Rpb24gaXNTdWJ0eXBlT2ZUeXBlIChzdWJUeXBlLCBzdXBlclR5cGUpIHtcblx0aWYgKHN1cGVyVHlwZS52YXJpZXR5ID09PSAndW5pb24nKSB7XG5cdFx0Ly8gSXQgaXMgYSB1bmlvbiB0eXBlLCB3aGljaCBjYW4gb25seSBiZSB0aGUgdG9wbW9zdCB0eXBlc1xuXHRcdHJldHVybiAhIXN1cGVyVHlwZS5tZW1iZXJUeXBlcy5maW5kKG1lbWJlclR5cGUgPT4gaXNTdWJ0eXBlT2ZUeXBlKHN1YlR5cGUsIG1lbWJlclR5cGUpKTtcblx0fVxuXG5cdHdoaWxlIChzdWJUeXBlKSB7XG5cdFx0aWYgKHN1YlR5cGUubmFtZSA9PT0gc3VwZXJUeXBlLm5hbWUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAoc3ViVHlwZS52YXJpZXR5ID09PSAndW5pb24nKSB7XG5cdFx0XHRyZXR1cm4gISFzdWJUeXBlLm1lbWJlclR5cGVzLmZpbmQobWVtYmVyVHlwZSA9PiBpc1N1YnR5cGVPZlR5cGUobWVtYmVyVHlwZSwgc3VwZXJUeXBlKSk7XG5cdFx0fVxuXHRcdHN1YlR5cGUgPSBzdWJUeXBlLnBhcmVudDtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogeHM6aW50IGlzIGEgc3VidHlwZSBvZiB4czppbnRlZ2VyXG4gKiB4czpkZWNpbWFsIGlzIGEgc3VidHlwZSBvZiB4czpudW1lcmljXG4gKiB4czpOTVRPS0VOUyBpcyBhIHN1YnR5cGUgb2YgeHM6Tk0gVE9LRU5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNTdWJ0eXBlT2Yoc3ViVHlwZU5hbWU6IHN0cmluZywgc3VwZXJUeXBlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdGlmIChzdWJUeXBlTmFtZSA9PT0gc3VwZXJUeXBlTmFtZSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Y29uc3Qgc3VwZXJUeXBlID0gYnVpbHRpbkRhdGFUeXBlc0J5TmFtZVtzdXBlclR5cGVOYW1lXTtcblx0Y29uc3Qgc3ViVHlwZSA9IGJ1aWx0aW5EYXRhVHlwZXNCeU5hbWVbc3ViVHlwZU5hbWVdO1xuXG5cdGlmICghc3VwZXJUeXBlKSB7XG5cdFx0aWYgKCFzdXBlclR5cGVOYW1lLnN0YXJ0c1dpdGgoJ3hzOicpKSB7XG5cdFx0XHQvLyBOb3RlIHRoYXQgJ3hzJyBpcyB0aGUgb25seSBuYW1lc3BhY2UgY3VycmVudGx5IHN1cHBvcnRlZFxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBYUFNUMDA4MTogVGhlIHR5cGUgJHtzdXBlclR5cGVOYW1lfSBjb3VsZCBub3QgYmUgZm91bmQuYCk7XG5cdFx0fVxuXHRcdHRocm93IG5ldyBFcnJvcihgWFBTVDAwNTE6IFRoZSB0eXBlICR7c3VwZXJUeXBlTmFtZX0gY291bGQgbm90IGJlIGZvdW5kLmApO1xuXHR9XG5cblx0cmV0dXJuIGlzU3VidHlwZU9mVHlwZShzdWJUeXBlLCBzdXBlclR5cGUpO1xufVxuIl19