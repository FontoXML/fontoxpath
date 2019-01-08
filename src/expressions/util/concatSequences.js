"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const iterators_1 = require("./iterators");
function concatSequences(sequences) {
    let i = 0;
    let iterator = null;
    return SequenceFactory_1.default.create({
        next: () => {
            while (i < sequences.length) {
                if (!iterator) {
                    iterator = sequences[i].value;
                }
                const value = iterator.next();
                if (value.done) {
                    i++;
                    iterator = null;
                    continue;
                }
                return value;
            }
            return iterators_1.DONE_TOKEN;
        }
    });
}
exports.default = concatSequences;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uY2F0U2VxdWVuY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uY2F0U2VxdWVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0VBQTJEO0FBQzNELDJDQUF5QztBQUN6QyxTQUF3QixlQUFlLENBQUUsU0FBUztJQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsT0FBTyx5QkFBZSxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDNUIsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDZCxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztpQkFDOUI7Z0JBQ0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM5QixJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7b0JBQ2YsQ0FBQyxFQUFFLENBQUM7b0JBQ0osUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDaEIsU0FBUztpQkFDVDtnQkFDRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxzQkFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBcEJELGtDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgeyBET05FX1RPS0VOIH0gZnJvbSAnLi9pdGVyYXRvcnMnO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uY2F0U2VxdWVuY2VzIChzZXF1ZW5jZXMpIHtcblx0bGV0IGkgPSAwO1xuXHRsZXQgaXRlcmF0b3IgPSBudWxsO1xuXHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZSh7XG5cdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0d2hpbGUgKGkgPCBzZXF1ZW5jZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmICghaXRlcmF0b3IpIHtcblx0XHRcdFx0XHRpdGVyYXRvciA9IHNlcXVlbmNlc1tpXS52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IGl0ZXJhdG9yLm5leHQoKTtcblx0XHRcdFx0aWYgKHZhbHVlLmRvbmUpIHtcblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0aXRlcmF0b3IgPSBudWxsO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdH1cblx0fSk7XG59XG4iXX0=