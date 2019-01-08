"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function argumentListToString(argumentList) {
    return argumentList.map(function (argument) {
        if (argument === null) {
            return 'placeholder';
        }
        if (argument.isEmpty()) {
            return 'item()?';
        }
        if (argument.isSingleton()) {
            return argument.first().type || 'item()';
        }
        return argument.first().type + '+';
    })
        .map(types => `${types}`).join(', ');
}
exports.default = argumentListToString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRMaXN0VG9TdHJpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcmd1bWVudExpc3RUb1N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFNBQXdCLG9CQUFvQixDQUFFLFlBQThCO0lBQzNFLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLFFBQVE7UUFDekMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE9BQU8sYUFBYSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDdkIsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFFRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUMzQixPQUFPLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDO1NBQ3pDO1FBQ0QsT0FBTyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNwQyxDQUFDLENBQUM7U0FDQSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFmRCx1Q0FlQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJU2VxdWVuY2UgZnJvbSAnLi4vZGF0YVR5cGVzL0lTZXF1ZW5jZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFyZ3VtZW50TGlzdFRvU3RyaW5nIChhcmd1bWVudExpc3Q6IEFycmF5PElTZXF1ZW5jZT4pIHtcblx0cmV0dXJuIGFyZ3VtZW50TGlzdC5tYXAoZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG5cdFx0aWYgKGFyZ3VtZW50ID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gJ3BsYWNlaG9sZGVyJztcblx0XHR9XG5cdFx0aWYgKGFyZ3VtZW50LmlzRW1wdHkoKSkge1xuXHRcdFx0cmV0dXJuICdpdGVtKCk/Jztcblx0XHR9XG5cblx0XHRpZiAoYXJndW1lbnQuaXNTaW5nbGV0b24oKSkge1xuXHRcdFx0cmV0dXJuIGFyZ3VtZW50LmZpcnN0KCkudHlwZSB8fCAnaXRlbSgpJztcblx0XHR9XG5cdFx0cmV0dXJuIGFyZ3VtZW50LmZpcnN0KCkudHlwZSArICcrJztcblx0fSlcblx0XHQubWFwKHR5cGVzID0+IGAke3R5cGVzfWApLmpvaW4oJywgJyk7XG59XG4iXX0=