"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builtinModels_1 = require("./builtinModels");
const dataTypeValidatorByName_1 = require("./dataTypeValidatorByName");
const facetsByDataTypeName_1 = require("../facets/facetsByDataTypeName");
const builtinDataTypesByName = Object.create(null);
builtinModels_1.default.forEach((model, index) => {
    const name = model.name;
    const restrictionsByName = model.restrictions || {};
    if (model.variety === 'primitive') {
        const parent = model.parent ? builtinDataTypesByName[model.parent] : null, validator = dataTypeValidatorByName_1.default[name] || null, facetHandlers = facetsByDataTypeName_1.default[name];
        builtinDataTypesByName[name] = {
            variety: 'primitive',
            name: name,
            restrictionsByName: restrictionsByName,
            parent: parent,
            validator: validator,
            facetHandlers: facetHandlers,
            memberTypes: []
        };
    }
    else if (model.variety === 'derived') {
        const base = builtinDataTypesByName[model.base], validator = dataTypeValidatorByName_1.default[name] || null;
        builtinDataTypesByName[name] = {
            variety: 'derived',
            name: name,
            restrictionsByName: restrictionsByName,
            parent: base,
            validator: validator,
            facetHandlers: base.facetHandlers,
            memberTypes: []
        };
    }
    else if (model.variety === 'list') {
        const type = builtinDataTypesByName[model.type];
        builtinDataTypesByName[name] = {
            variety: 'union',
            name: name,
            restrictionsByName: restrictionsByName,
            parent: type,
            validator: null,
            facetHandlers: facetsByDataTypeName_1.default.list,
            memberTypes: []
        };
    }
    else if (model.variety === 'union') {
        const memberTypes = model.memberTypes.map((memberTypeRef) => builtinDataTypesByName[memberTypeRef]);
        builtinDataTypesByName[name] = {
            variety: 'union',
            name: name || index,
            restrictionsByName: restrictionsByName,
            parent: null,
            validator: null,
            facetHandlers: facetsByDataTypeName_1.default.union,
            memberTypes: memberTypes
        };
    }
});
exports.default = builtinDataTypesByName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbHRpbkRhdGFUeXBlc0J5TmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWx0aW5EYXRhVHlwZXNCeU5hbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBNEM7QUFDNUMsdUVBQWdFO0FBQ2hFLHlFQUF5RTtBQUV6RSxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbkQsdUJBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDdEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN4QixNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO0lBRXBELElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUU7UUFDbEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ3hFLFNBQVMsR0FBRyxpQ0FBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQ2pELGFBQWEsR0FBRyw4QkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRztZQUM5QixPQUFPLEVBQUUsV0FBVztZQUNwQixJQUFJLEVBQUUsSUFBSTtZQUNWLGtCQUFrQixFQUFFLGtCQUFrQjtZQUN0QyxNQUFNLEVBQUUsTUFBTTtZQUNkLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLFdBQVcsRUFBRSxFQUFFO1NBQ2YsQ0FBQztLQUNGO1NBQ0ksSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRTtRQUNyQyxNQUFNLElBQUksR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQy9DLFNBQVMsR0FBRyxpQ0FBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDbEQsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDOUIsT0FBTyxFQUFFLFNBQVM7WUFDbEIsSUFBSSxFQUFFLElBQUk7WUFDVixrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsTUFBTSxFQUFFLElBQUk7WUFDWixTQUFTLEVBQUUsU0FBUztZQUNwQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDakMsV0FBVyxFQUFFLEVBQUU7U0FDZixDQUFDO0tBQ0Y7U0FDSSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssTUFBTSxFQUFFO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRztZQUM5QixPQUFPLEVBQUUsT0FBTztZQUNoQixJQUFJLEVBQUUsSUFBSTtZQUNWLGtCQUFrQixFQUFFLGtCQUFrQjtZQUN0QyxNQUFNLEVBQUUsSUFBSTtZQUNaLFNBQVMsRUFBRSxJQUFJO1lBQ2YsYUFBYSxFQUFFLDhCQUEyQixDQUFDLElBQUk7WUFDL0MsV0FBVyxFQUFFLEVBQUU7U0FDZixDQUFDO0tBQ0Y7U0FDSSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO1FBQ25DLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHO1lBQzlCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLElBQUksRUFBRSxJQUFJLElBQUksS0FBSztZQUNuQixrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsTUFBTSxFQUFFLElBQUk7WUFDWixTQUFTLEVBQUUsSUFBSTtZQUNmLGFBQWEsRUFBRSw4QkFBMkIsQ0FBQyxLQUFLO1lBQ2hELFdBQVcsRUFBRSxXQUFXO1NBQ3hCLENBQUM7S0FDRjtBQUNGLENBQUMsQ0FBQyxDQUFDO0FBSUgsa0JBQWUsc0JBQXNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYnVpbHRpbk1vZGVscyBmcm9tICcuL2J1aWx0aW5Nb2RlbHMnO1xuaW1wb3J0IGRhdGFUeXBlVmFsaWRhdG9yQnlOYW1lIGZyb20gJy4vZGF0YVR5cGVWYWxpZGF0b3JCeU5hbWUnO1xuaW1wb3J0IGZhY2V0SGFuZGxlcnNCeURhdGFUeXBlTmFtZSBmcm9tICcuLi9mYWNldHMvZmFjZXRzQnlEYXRhVHlwZU5hbWUnO1xuXG5jb25zdCBidWlsdGluRGF0YVR5cGVzQnlOYW1lID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuYnVpbHRpbk1vZGVscy5mb3JFYWNoKChtb2RlbCwgaW5kZXgpID0+IHtcblx0Y29uc3QgbmFtZSA9IG1vZGVsLm5hbWU7XG5cdGNvbnN0IHJlc3RyaWN0aW9uc0J5TmFtZSA9IG1vZGVsLnJlc3RyaWN0aW9ucyB8fCB7fTtcblxuXHRpZiAobW9kZWwudmFyaWV0eSA9PT0gJ3ByaW1pdGl2ZScpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBtb2RlbC5wYXJlbnQgPyBidWlsdGluRGF0YVR5cGVzQnlOYW1lW21vZGVsLnBhcmVudF0gOiBudWxsLFxuXHRcdFx0dmFsaWRhdG9yID0gZGF0YVR5cGVWYWxpZGF0b3JCeU5hbWVbbmFtZV0gfHwgbnVsbCxcblx0XHRcdGZhY2V0SGFuZGxlcnMgPSBmYWNldEhhbmRsZXJzQnlEYXRhVHlwZU5hbWVbbmFtZV07XG5cdFx0YnVpbHRpbkRhdGFUeXBlc0J5TmFtZVtuYW1lXSA9IHtcblx0XHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdFx0bmFtZTogbmFtZSxcblx0XHRcdHJlc3RyaWN0aW9uc0J5TmFtZTogcmVzdHJpY3Rpb25zQnlOYW1lLFxuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHR2YWxpZGF0b3I6IHZhbGlkYXRvcixcblx0XHRcdGZhY2V0SGFuZGxlcnM6IGZhY2V0SGFuZGxlcnMsXG5cdFx0XHRtZW1iZXJUeXBlczogW11cblx0XHR9O1xuXHR9XG5cdGVsc2UgaWYgKG1vZGVsLnZhcmlldHkgPT09ICdkZXJpdmVkJykge1xuXHRcdGNvbnN0IGJhc2UgPSBidWlsdGluRGF0YVR5cGVzQnlOYW1lW21vZGVsLmJhc2VdLFxuXHRcdHZhbGlkYXRvciA9IGRhdGFUeXBlVmFsaWRhdG9yQnlOYW1lW25hbWVdIHx8IG51bGw7XG5cdFx0YnVpbHRpbkRhdGFUeXBlc0J5TmFtZVtuYW1lXSA9IHtcblx0XHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRyZXN0cmljdGlvbnNCeU5hbWU6IHJlc3RyaWN0aW9uc0J5TmFtZSxcblx0XHRcdHBhcmVudDogYmFzZSxcblx0XHRcdHZhbGlkYXRvcjogdmFsaWRhdG9yLFxuXHRcdFx0ZmFjZXRIYW5kbGVyczogYmFzZS5mYWNldEhhbmRsZXJzLFxuXHRcdFx0bWVtYmVyVHlwZXM6IFtdXG5cdFx0fTtcblx0fVxuXHRlbHNlIGlmIChtb2RlbC52YXJpZXR5ID09PSAnbGlzdCcpIHtcblx0XHRjb25zdCB0eXBlID0gYnVpbHRpbkRhdGFUeXBlc0J5TmFtZVttb2RlbC50eXBlXTtcblx0XHRidWlsdGluRGF0YVR5cGVzQnlOYW1lW25hbWVdID0ge1xuXHRcdFx0dmFyaWV0eTogJ3VuaW9uJyxcblx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRyZXN0cmljdGlvbnNCeU5hbWU6IHJlc3RyaWN0aW9uc0J5TmFtZSxcblx0XHRcdHBhcmVudDogdHlwZSxcblx0XHRcdHZhbGlkYXRvcjogbnVsbCxcblx0XHRcdGZhY2V0SGFuZGxlcnM6IGZhY2V0SGFuZGxlcnNCeURhdGFUeXBlTmFtZS5saXN0LFxuXHRcdFx0bWVtYmVyVHlwZXM6IFtdXG5cdFx0fTtcblx0fVxuXHRlbHNlIGlmIChtb2RlbC52YXJpZXR5ID09PSAndW5pb24nKSB7XG5cdFx0Y29uc3QgbWVtYmVyVHlwZXMgPSBtb2RlbC5tZW1iZXJUeXBlcy5tYXAoKG1lbWJlclR5cGVSZWYpID0+IGJ1aWx0aW5EYXRhVHlwZXNCeU5hbWVbbWVtYmVyVHlwZVJlZl0pO1xuXHRcdGJ1aWx0aW5EYXRhVHlwZXNCeU5hbWVbbmFtZV0gPSB7XG5cdFx0XHR2YXJpZXR5OiAndW5pb24nLFxuXHRcdFx0bmFtZTogbmFtZSB8fCBpbmRleCxcblx0XHRcdHJlc3RyaWN0aW9uc0J5TmFtZTogcmVzdHJpY3Rpb25zQnlOYW1lLFxuXHRcdFx0cGFyZW50OiBudWxsLFxuXHRcdFx0dmFsaWRhdG9yOiBudWxsLFxuXHRcdFx0ZmFjZXRIYW5kbGVyczogZmFjZXRIYW5kbGVyc0J5RGF0YVR5cGVOYW1lLnVuaW9uLFxuXHRcdFx0bWVtYmVyVHlwZXM6IG1lbWJlclR5cGVzXG5cdFx0fTtcblx0fVxufSk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBidWlsdGluRGF0YVR5cGVzQnlOYW1lO1xuIl19