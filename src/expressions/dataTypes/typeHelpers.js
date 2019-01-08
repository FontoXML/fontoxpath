"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builtinDataTypesByName_1 = require("./builtins/builtinDataTypesByName");
/**
 * @param   {string}  typeName
 * @return  {?string}
 */
function getPrimitiveTypeName(typeName) {
    let type = builtinDataTypesByName_1.default[typeName];
    while (type && type.variety !== 'primitive') {
        type = type.parent;
    }
    return !type ? null : type.name;
}
exports.getPrimitiveTypeName = getPrimitiveTypeName;
/**
 * @param   {string}  string
 * @param   {string}  typeName
 * @return  {string}
 */
function normalizeWhitespace(string, typeName) {
    const type = builtinDataTypesByName_1.default[typeName];
    const restrictionsByName = type.restrictionsByName;
    if (!restrictionsByName || !restrictionsByName.whiteSpace) {
        if (!type.parent) {
            return string;
        }
        return normalizeWhitespace(string, type.parent.name);
    }
    const whiteSpaceType = type.restrictionsByName.whiteSpace;
    switch (whiteSpaceType) {
        case 'preserve':
            return string;
        case 'replace':
            return string.replace(/[\u0009\u000A\u000D]/g, ' ');
        case 'collapse':
            return string.replace(/[\u0009\u000A\u000D]/g, ' ').replace(/ {2,}/g, ' ').replace(/^ | $/g, '');
    }
    return string;
}
exports.normalizeWhitespace = normalizeWhitespace;
/**
 * @param   {string}   string
 * @param   {string}   typeName
 * @return  {boolean}
 */
function validatePattern(string, typeName) {
    let type = builtinDataTypesByName_1.default[typeName];
    while (type && type.validator === null) {
        if (type.variety === 'list' || type.variety === 'union') {
            return true;
        }
        type = type.parent;
    }
    if (!type) {
        return true;
    }
    return type.validator(string);
}
exports.validatePattern = validatePattern;
function getHandlerForFacet(type, facetName) {
    while (type) {
        if (type.facetHandlers && type.facetHandlers[facetName]) {
            return type.facetHandlers[facetName];
        }
        type = type.parent;
    }
    return () => true;
}
/**
 * @param   {string}  value
 * @param   {string}  typeName
 * @return  {boolean}
 */
function validateRestrictions(value, typeName) {
    let type = builtinDataTypesByName_1.default[typeName];
    while (type) {
        if (!type.restrictionsByName) {
            type = type.parent;
            continue;
        }
        const matchesRestrictions = Object.keys(type.restrictionsByName).every(restrictionName => {
            if (restrictionName === 'whiteSpace') {
                // whiteSpace will be handled separately
                return true;
            }
            const validationFunction = getHandlerForFacet(type, restrictionName);
            if (!validationFunction) {
                return true;
            }
            return validationFunction(value, type.restrictionsByName[restrictionName]);
        });
        if (!matchesRestrictions) {
            return false;
        }
        type = type.parent;
    }
    return true;
}
exports.validateRestrictions = validateRestrictions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhFQUF1RTtBQUN2RTs7O0dBR0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBRSxRQUFRO0lBQzdDLElBQUksSUFBSSxHQUFHLGdDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO1FBQzVDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ25CO0lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2pDLENBQUM7QUFORCxvREFNQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixtQkFBbUIsQ0FBRSxNQUFNLEVBQUUsUUFBUTtJQUNwRCxNQUFNLElBQUksR0FBRyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNuRCxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUU7UUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTyxNQUFNLENBQUM7U0FDZDtRQUNELE9BQU8sbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDckQ7SUFDRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO0lBQzFELFFBQVEsY0FBYyxFQUFFO1FBQ3ZCLEtBQUssVUFBVTtZQUNkLE9BQU8sTUFBTSxDQUFDO1FBQ2YsS0FBSyxTQUFTO1lBQ2IsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXJELEtBQUssVUFBVTtZQUNkLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDbEc7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFwQkQsa0RBb0JDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGVBQWUsQ0FBRSxNQUFNLEVBQUUsUUFBUTtJQUNoRCxJQUFJLElBQUksR0FBRyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtRQUN2QyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQ3hELE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNuQjtJQUNELElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFaRCwwQ0FZQztBQUVELFNBQVMsa0JBQWtCLENBQUUsSUFBSSxFQUFFLFNBQVM7SUFDM0MsT0FBTyxJQUFJLEVBQUU7UUFDWixJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN4RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDckM7UUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNuQjtJQUNELE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ25CLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0Isb0JBQW9CLENBQUUsS0FBSyxFQUFFLFFBQVE7SUFDcEQsSUFBSSxJQUFJLEdBQUcsZ0NBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUMsT0FBTyxJQUFJLEVBQUU7UUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzdCLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ25CLFNBQVM7U0FDVDtRQUVELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDeEYsSUFBSSxlQUFlLEtBQUssWUFBWSxFQUFFO2dCQUNyQyx3Q0FBd0M7Z0JBQ3hDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLGtCQUFrQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN6QixPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDbkI7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUEzQkQsb0RBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJ1aWx0aW5EYXRhVHlwZXNCeU5hbWUgZnJvbSAnLi9idWlsdGlucy9idWlsdGluRGF0YVR5cGVzQnlOYW1lJztcbi8qKlxuICogQHBhcmFtICAge3N0cmluZ30gIHR5cGVOYW1lXG4gKiBAcmV0dXJuICB7P3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW1pdGl2ZVR5cGVOYW1lICh0eXBlTmFtZSkge1xuXHRsZXQgdHlwZSA9IGJ1aWx0aW5EYXRhVHlwZXNCeU5hbWVbdHlwZU5hbWVdO1xuXHR3aGlsZSAodHlwZSAmJiB0eXBlLnZhcmlldHkgIT09ICdwcmltaXRpdmUnKSB7XG5cdFx0dHlwZSA9IHR5cGUucGFyZW50O1xuXHR9XG5cdHJldHVybiAhdHlwZSA/IG51bGwgOiB0eXBlLm5hbWU7XG59XG5cbi8qKlxuICogQHBhcmFtICAge3N0cmluZ30gIHN0cmluZ1xuICogQHBhcmFtICAge3N0cmluZ30gIHR5cGVOYW1lXG4gKiBAcmV0dXJuICB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplV2hpdGVzcGFjZSAoc3RyaW5nLCB0eXBlTmFtZSkge1xuXHRjb25zdCB0eXBlID0gYnVpbHRpbkRhdGFUeXBlc0J5TmFtZVt0eXBlTmFtZV07XG5cdGNvbnN0IHJlc3RyaWN0aW9uc0J5TmFtZSA9IHR5cGUucmVzdHJpY3Rpb25zQnlOYW1lO1xuXHRpZiAoIXJlc3RyaWN0aW9uc0J5TmFtZSB8fCAhcmVzdHJpY3Rpb25zQnlOYW1lLndoaXRlU3BhY2UpIHtcblx0XHRpZiAoIXR5cGUucGFyZW50KSB7XG5cdFx0XHRyZXR1cm4gc3RyaW5nO1xuXHRcdH1cblx0XHRyZXR1cm4gbm9ybWFsaXplV2hpdGVzcGFjZShzdHJpbmcsIHR5cGUucGFyZW50Lm5hbWUpO1xuXHR9XG5cdGNvbnN0IHdoaXRlU3BhY2VUeXBlID0gdHlwZS5yZXN0cmljdGlvbnNCeU5hbWUud2hpdGVTcGFjZTtcblx0c3dpdGNoICh3aGl0ZVNwYWNlVHlwZSkge1xuXHRcdGNhc2UgJ3ByZXNlcnZlJzpcblx0XHRcdHJldHVybiBzdHJpbmc7XG5cdFx0Y2FzZSAncmVwbGFjZSc6XG5cdFx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1tcXHUwMDA5XFx1MDAwQVxcdTAwMERdL2csICcgJyk7XG5cblx0XHRjYXNlICdjb2xsYXBzZSc6XG5cdFx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1tcXHUwMDA5XFx1MDAwQVxcdTAwMERdL2csICcgJykucmVwbGFjZSgvIHsyLH0vZywgJyAnKS5yZXBsYWNlKC9eIHwgJC9nLCAnJyk7XG5cdH1cblx0cmV0dXJuIHN0cmluZztcbn1cblxuLyoqXG4gKiBAcGFyYW0gICB7c3RyaW5nfSAgIHN0cmluZ1xuICogQHBhcmFtICAge3N0cmluZ30gICB0eXBlTmFtZVxuICogQHJldHVybiAge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVBhdHRlcm4gKHN0cmluZywgdHlwZU5hbWUpIHtcblx0bGV0IHR5cGUgPSBidWlsdGluRGF0YVR5cGVzQnlOYW1lW3R5cGVOYW1lXTtcblx0d2hpbGUgKHR5cGUgJiYgdHlwZS52YWxpZGF0b3IgPT09IG51bGwpIHtcblx0XHRpZiAodHlwZS52YXJpZXR5ID09PSAnbGlzdCcgfHwgdHlwZS52YXJpZXR5ID09PSAndW5pb24nKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0dHlwZSA9IHR5cGUucGFyZW50O1xuXHR9XG5cdGlmICghdHlwZSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiB0eXBlLnZhbGlkYXRvcihzdHJpbmcpO1xufVxuXG5mdW5jdGlvbiBnZXRIYW5kbGVyRm9yRmFjZXQgKHR5cGUsIGZhY2V0TmFtZSkge1xuXHR3aGlsZSAodHlwZSkge1xuXHRcdGlmICh0eXBlLmZhY2V0SGFuZGxlcnMgJiYgdHlwZS5mYWNldEhhbmRsZXJzW2ZhY2V0TmFtZV0pIHtcblx0XHRcdHJldHVybiB0eXBlLmZhY2V0SGFuZGxlcnNbZmFjZXROYW1lXTtcblx0XHR9XG5cdFx0dHlwZSA9IHR5cGUucGFyZW50O1xuXHR9XG5cdHJldHVybiAoKSA9PiB0cnVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgIHtzdHJpbmd9ICB2YWx1ZVxuICogQHBhcmFtICAge3N0cmluZ30gIHR5cGVOYW1lXG4gKiBAcmV0dXJuICB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUmVzdHJpY3Rpb25zICh2YWx1ZSwgdHlwZU5hbWUpIHtcblx0bGV0IHR5cGUgPSBidWlsdGluRGF0YVR5cGVzQnlOYW1lW3R5cGVOYW1lXTtcblx0d2hpbGUgKHR5cGUpIHtcblx0XHRpZiAoIXR5cGUucmVzdHJpY3Rpb25zQnlOYW1lKSB7XG5cdFx0XHR0eXBlID0gdHlwZS5wYXJlbnQ7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCBtYXRjaGVzUmVzdHJpY3Rpb25zID0gT2JqZWN0LmtleXModHlwZS5yZXN0cmljdGlvbnNCeU5hbWUpLmV2ZXJ5KHJlc3RyaWN0aW9uTmFtZSA9PiB7XG5cdFx0XHRpZiAocmVzdHJpY3Rpb25OYW1lID09PSAnd2hpdGVTcGFjZScpIHtcblx0XHRcdFx0Ly8gd2hpdGVTcGFjZSB3aWxsIGJlIGhhbmRsZWQgc2VwYXJhdGVseVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgdmFsaWRhdGlvbkZ1bmN0aW9uID0gZ2V0SGFuZGxlckZvckZhY2V0KHR5cGUsIHJlc3RyaWN0aW9uTmFtZSk7XG5cdFx0XHRpZiAoIXZhbGlkYXRpb25GdW5jdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB2YWxpZGF0aW9uRnVuY3Rpb24odmFsdWUsIHR5cGUucmVzdHJpY3Rpb25zQnlOYW1lW3Jlc3RyaWN0aW9uTmFtZV0pO1xuXHRcdH0pO1xuXG5cdFx0aWYgKCFtYXRjaGVzUmVzdHJpY3Rpb25zKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHR5cGUgPSB0eXBlLnBhcmVudDtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==