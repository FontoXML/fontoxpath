"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FunctionValue_1 = require("./FunctionValue");
const SequenceFactory_1 = require("./SequenceFactory");
const builtInFunctions_maps_get_1 = require("../functions/builtInFunctions.maps.get");
const staticallyKnownNamespaces_1 = require("../staticallyKnownNamespaces");
class MapValue extends FunctionValue_1.default {
    constructor(keyValuePairs) {
        super({
            value: (dynamicContext, executionParameters, staticContext, key) => builtInFunctions_maps_get_1.default(dynamicContext, executionParameters, staticContext, SequenceFactory_1.default.singleton(this), key),
            localName: 'get',
            namespaceURI: staticallyKnownNamespaces_1.MAP_NAMESPACE_URI,
            argumentTypes: [{ type: 'item()', isRestArgument: false }],
            arity: 1,
            returnType: { type: 'item()', occurrence: '*' }
        });
        this.type = 'map(*)';
        this.keyValuePairs = keyValuePairs;
    }
}
exports.default = MapValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwVmFsdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNYXBWYWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUE0QztBQUM1Qyx1REFBZ0Q7QUFFaEQsc0ZBQTREO0FBQzVELDRFQUFpRTtBQUdqRSxNQUFNLFFBQVMsU0FBUSx1QkFBYTtJQUduQyxZQUFhLGFBQTZEO1FBQ3pFLEtBQUssQ0FBQztZQUNMLEtBQUssRUFBRSxDQUFDLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxtQ0FBTSxDQUFDLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUseUJBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ3BLLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFlBQVksRUFBRSw2Q0FBaUI7WUFDL0IsYUFBYSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQUNSLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRTtTQUMvQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUNwQyxDQUFDO0NBQ0Q7QUFFRCxrQkFBZSxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRnVuY3Rpb25WYWx1ZSBmcm9tICcuL0Z1bmN0aW9uVmFsdWUnO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi9WYWx1ZSc7XG5pbXBvcnQgbWFwR2V0IGZyb20gJy4uL2Z1bmN0aW9ucy9idWlsdEluRnVuY3Rpb25zLm1hcHMuZ2V0JztcbmltcG9ydCB7IE1BUF9OQU1FU1BBQ0VfVVJJIH0gZnJvbSAnLi4vc3RhdGljYWxseUtub3duTmFtZXNwYWNlcyc7XG5pbXBvcnQgSVNlcXVlbmNlIGZyb20gJy4vSVNlcXVlbmNlJztcblxuY2xhc3MgTWFwVmFsdWUgZXh0ZW5kcyBGdW5jdGlvblZhbHVlIHtcblx0a2V5VmFsdWVQYWlyczogeyBrZXk6IFZhbHVlOyB2YWx1ZTogKCkgPT4gSVNlcXVlbmNlOyB9W107XG5cblx0Y29uc3RydWN0b3IgKGtleVZhbHVlUGFpcnM6IEFycmF5PHsga2V5OiBWYWx1ZTsgdmFsdWU6ICgpID0+IElTZXF1ZW5jZTsgfT4pIHtcblx0XHRzdXBlcih7XG5cdFx0XHR2YWx1ZTogKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzLCBzdGF0aWNDb250ZXh0LCBrZXkpID0+IG1hcEdldChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycywgc3RhdGljQ29udGV4dCwgU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbih0aGlzKSwga2V5KSxcblx0XHRcdGxvY2FsTmFtZTogJ2dldCcsXG5cdFx0XHRuYW1lc3BhY2VVUkk6IE1BUF9OQU1FU1BBQ0VfVVJJLFxuXHRcdFx0YXJndW1lbnRUeXBlczogW3sgdHlwZTogJ2l0ZW0oKScsIGlzUmVzdEFyZ3VtZW50OiBmYWxzZSB9XSxcblx0XHRcdGFyaXR5OiAxLFxuXHRcdFx0cmV0dXJuVHlwZTogeyB0eXBlOiAnaXRlbSgpJywgb2NjdXJyZW5jZTogJyonIH1cblx0XHR9KTtcblx0XHR0aGlzLnR5cGUgPSAnbWFwKCopJztcblx0XHR0aGlzLmtleVZhbHVlUGFpcnMgPSBrZXlWYWx1ZVBhaXJzO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hcFZhbHVlO1xuIl19