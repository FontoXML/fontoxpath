"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterators_1 = require("./util/iterators");
const DateTime_1 = require("./dataTypes/valueTypes/DateTime");
const DayTimeDuration_1 = require("./dataTypes/valueTypes/DayTimeDuration");
class DynamicContext {
    constructor(context, temporalContext = { isInitialized: false, currentDateTime: null, implicitTimezone: null }) {
        this._temporalContext = temporalContext;
        /**
         * @type {!number}
         * @const
         */
        this.contextItemIndex = context.contextItemIndex;
        /**
         * @type {!Sequence}
         * @const
         */
        this.contextSequence = context.contextSequence;
        this.contextItem = context.contextItem;
        this.variableBindings = context.variableBindings || Object.create(null);
    }
    getCurrentDateTime() {
        if (!this._temporalContext.isInitialized) {
            this._temporalContext.isInitialized = true;
            this._temporalContext.currentDateTime = DateTime_1.default.fromString(new Date().toISOString());
            this._temporalContext.implicitTimezone = DayTimeDuration_1.default.fromString('PT0S');
        }
        return this._temporalContext.currentDateTime;
    }
    getImplicitTimezone() {
        if (!this._temporalContext.isInitialized) {
            this._temporalContext.isInitialized = true;
            this._temporalContext.currentDateTime = DateTime_1.default.fromString(new Date().toISOString());
            this._temporalContext.implicitTimezone = DayTimeDuration_1.default.fromString('PT0S');
        }
        return this._temporalContext.implicitTimezone;
    }
    scopeWithFocus(contextItemIndex, contextItem, contextSequence) {
        return new DynamicContext({
            contextItemIndex: contextItemIndex,
            contextItem: contextItem,
            contextSequence: contextSequence || this.contextSequence,
            variableBindings: this.variableBindings
        }, this._temporalContext);
    }
    scopeWithVariableBindings(variableBindings) {
        return new DynamicContext({
            contextItemIndex: this.contextItemIndex,
            contextItem: this.contextItem,
            contextSequence: this.contextSequence,
            variableBindings: Object.assign(Object.create(null), this.variableBindings, variableBindings)
        }, this._temporalContext);
    }
    createSequenceIterator(contextSequence) {
        let i = 0;
        const iterator = contextSequence.value;
        return ({
            next: () => {
                const value = iterator.next();
                if (value.done) {
                    return value;
                }
                if (!value.ready) {
                    return value;
                }
                return iterators_1.ready(this.scopeWithFocus(i++, value.value, contextSequence));
            }
        });
    }
}
exports.default = DynamicContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHluYW1pY0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEeW5hbWljQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUF3RDtBQUN4RCw4REFBdUQ7QUFDdkQsNEVBQXFFO0FBTXJFLE1BQU0sY0FBYztJQU9uQixZQUNDLE9BQWdKLEVBQ2hKLGtCQUErQyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUU7UUFFdEgsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUV4Qzs7O1dBR0c7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1FBRWpEOzs7V0FHRztRQUNILElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQztRQUUvQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFFdkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCxrQkFBa0I7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUU7WUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFFM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixHQUFHLHlCQUFlLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVFO1FBQ0QsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDO0lBQzlDLENBQUM7SUFFRCxtQkFBbUI7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUU7WUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFFM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixHQUFHLHlCQUFlLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVFO1FBQ0QsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUM7SUFDL0MsQ0FBQztJQUVELGNBQWMsQ0FBQyxnQkFBd0IsRUFBRSxXQUFrQixFQUFFLGVBQTBCO1FBQ3RGLE9BQU8sSUFBSSxjQUFjLENBQ3hCO1lBQ0MsZ0JBQWdCLEVBQUUsZ0JBQWdCO1lBQ2xDLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLGVBQWUsRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWU7WUFDeEQsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtTQUN2QyxFQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxnQkFBMEM7UUFDbkUsT0FBTyxJQUFJLGNBQWMsQ0FDeEI7WUFDQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3ZDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDckMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQztTQUM3RixFQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxlQUEwQjtRQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQztZQUNQLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ1YsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM5QixJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7b0JBQ2YsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7b0JBQ2pCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUNELE9BQU8saUJBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN0RSxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBRUQsa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVhZHksIEFzeW5jSXRlcmF0b3IgfSBmcm9tICcuL3V0aWwvaXRlcmF0b3JzJztcbmltcG9ydCBEYXRlVGltZSBmcm9tICcuL2RhdGFUeXBlcy92YWx1ZVR5cGVzL0RhdGVUaW1lJztcbmltcG9ydCBEYXlUaW1lRHVyYXRpb24gZnJvbSAnLi9kYXRhVHlwZXMvdmFsdWVUeXBlcy9EYXlUaW1lRHVyYXRpb24nO1xuaW1wb3J0IElTZXF1ZW5jZSBmcm9tICcuL2RhdGFUeXBlcy9JU2VxdWVuY2UnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4vZGF0YVR5cGVzL1ZhbHVlJztcblxudHlwZSBUZW1wb3JhbENvbnRleHQgPSB7aXNJbml0aWFsaXplZDogYm9vbGVhbiwgY3VycmVudERhdGVUaW1lOiBEYXRlVGltZSwgaW1wbGljaXRUaW1lem9uZTogRGF5VGltZUR1cmF0aW9ufVxuXG5jbGFzcyBEeW5hbWljQ29udGV4dCB7XG5cdF90ZW1wb3JhbENvbnRleHQ6IFRlbXBvcmFsQ29udGV4dDtcblx0Y29udGV4dEl0ZW1JbmRleDogbnVtYmVyO1xuXHRjb250ZXh0U2VxdWVuY2U6IElTZXF1ZW5jZTtcblx0Y29udGV4dEl0ZW06IFZhbHVlO1xuXHR2YXJpYWJsZUJpbmRpbmdzOiB7W3M6IHN0cmluZ106ICgpID0+IElTZXF1ZW5jZX07XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0Y29udGV4dDogeyBjb250ZXh0SXRlbTogVmFsdWUgfCBudWxsOyBjb250ZXh0SXRlbUluZGV4OiBudW1iZXI7IGNvbnRleHRTZXF1ZW5jZTogSVNlcXVlbmNlOyB2YXJpYWJsZUJpbmRpbmdzOiB7W3M6IHN0cmluZ106ICgpID0+IElTZXF1ZW5jZTt9OyB9LFxuXHRcdHRlbXBvcmFsQ29udGV4dDogVGVtcG9yYWxDb250ZXh0IHwgdW5kZWZpbmVkID0geyBpc0luaXRpYWxpemVkOiBmYWxzZSwgY3VycmVudERhdGVUaW1lOiBudWxsLCBpbXBsaWNpdFRpbWV6b25lOiBudWxsIH1cblx0KSB7XG5cdFx0dGhpcy5fdGVtcG9yYWxDb250ZXh0ID0gdGVtcG9yYWxDb250ZXh0O1xuXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyFudW1iZXJ9XG5cdFx0ICogQGNvbnN0XG5cdFx0ICovXG5cdFx0dGhpcy5jb250ZXh0SXRlbUluZGV4ID0gY29udGV4dC5jb250ZXh0SXRlbUluZGV4O1xuXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyFTZXF1ZW5jZX1cblx0XHQgKiBAY29uc3Rcblx0XHQgKi9cblx0XHR0aGlzLmNvbnRleHRTZXF1ZW5jZSA9IGNvbnRleHQuY29udGV4dFNlcXVlbmNlO1xuXG5cdFx0dGhpcy5jb250ZXh0SXRlbSA9IGNvbnRleHQuY29udGV4dEl0ZW07XG5cblx0XHR0aGlzLnZhcmlhYmxlQmluZGluZ3MgPSBjb250ZXh0LnZhcmlhYmxlQmluZGluZ3MgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0fVxuXG5cdGdldEN1cnJlbnREYXRlVGltZSAoKSB7XG5cdFx0aWYgKCF0aGlzLl90ZW1wb3JhbENvbnRleHQuaXNJbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5fdGVtcG9yYWxDb250ZXh0LmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG5cdFx0XHR0aGlzLl90ZW1wb3JhbENvbnRleHQuY3VycmVudERhdGVUaW1lID0gRGF0ZVRpbWUuZnJvbVN0cmluZyhuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuXHRcdFx0dGhpcy5fdGVtcG9yYWxDb250ZXh0LmltcGxpY2l0VGltZXpvbmUgPSBEYXlUaW1lRHVyYXRpb24uZnJvbVN0cmluZygnUFQwUycpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fdGVtcG9yYWxDb250ZXh0LmN1cnJlbnREYXRlVGltZTtcblx0fVxuXG5cdGdldEltcGxpY2l0VGltZXpvbmUgKCkge1xuXHRcdGlmICghdGhpcy5fdGVtcG9yYWxDb250ZXh0LmlzSW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX3RlbXBvcmFsQ29udGV4dC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy5fdGVtcG9yYWxDb250ZXh0LmN1cnJlbnREYXRlVGltZSA9IERhdGVUaW1lLmZyb21TdHJpbmcobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcblx0XHRcdHRoaXMuX3RlbXBvcmFsQ29udGV4dC5pbXBsaWNpdFRpbWV6b25lID0gRGF5VGltZUR1cmF0aW9uLmZyb21TdHJpbmcoJ1BUMFMnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3RlbXBvcmFsQ29udGV4dC5pbXBsaWNpdFRpbWV6b25lO1xuXHR9XG5cblx0c2NvcGVXaXRoRm9jdXMoY29udGV4dEl0ZW1JbmRleDogbnVtYmVyLCBjb250ZXh0SXRlbTogVmFsdWUsIGNvbnRleHRTZXF1ZW5jZTogSVNlcXVlbmNlKTogRHluYW1pY0NvbnRleHQge1xuXHRcdHJldHVybiBuZXcgRHluYW1pY0NvbnRleHQoXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRleHRJdGVtSW5kZXg6IGNvbnRleHRJdGVtSW5kZXgsXG5cdFx0XHRcdGNvbnRleHRJdGVtOiBjb250ZXh0SXRlbSxcblx0XHRcdFx0Y29udGV4dFNlcXVlbmNlOiBjb250ZXh0U2VxdWVuY2UgfHwgdGhpcy5jb250ZXh0U2VxdWVuY2UsXG5cdFx0XHRcdHZhcmlhYmxlQmluZGluZ3M6IHRoaXMudmFyaWFibGVCaW5kaW5nc1xuXHRcdFx0fSxcblx0XHRcdHRoaXMuX3RlbXBvcmFsQ29udGV4dCk7XG5cdH1cblxuXHRzY29wZVdpdGhWYXJpYWJsZUJpbmRpbmdzKHZhcmlhYmxlQmluZGluZ3M6IHtbczogc3RyaW5nXTogSVNlcXVlbmNlfSk6IER5bmFtaWNDb250ZXh0IHtcblx0XHRyZXR1cm4gbmV3IER5bmFtaWNDb250ZXh0KFxuXHRcdFx0e1xuXHRcdFx0XHRjb250ZXh0SXRlbUluZGV4OiB0aGlzLmNvbnRleHRJdGVtSW5kZXgsXG5cdFx0XHRcdGNvbnRleHRJdGVtOiB0aGlzLmNvbnRleHRJdGVtLFxuXHRcdFx0XHRjb250ZXh0U2VxdWVuY2U6IHRoaXMuY29udGV4dFNlcXVlbmNlLFxuXHRcdFx0XHR2YXJpYWJsZUJpbmRpbmdzOiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUobnVsbCksIHRoaXMudmFyaWFibGVCaW5kaW5ncywgdmFyaWFibGVCaW5kaW5ncylcblx0XHRcdH0sXG5cdFx0XHR0aGlzLl90ZW1wb3JhbENvbnRleHQpO1xuXHR9XG5cblx0Y3JlYXRlU2VxdWVuY2VJdGVyYXRvcihjb250ZXh0U2VxdWVuY2U6IElTZXF1ZW5jZSk6IEFzeW5jSXRlcmF0b3I8RHluYW1pY0NvbnRleHQ+IHtcblx0XHRsZXQgaSA9IDA7XG5cdFx0Y29uc3QgaXRlcmF0b3IgPSBjb250ZXh0U2VxdWVuY2UudmFsdWU7XG5cdFx0cmV0dXJuICh7XG5cdFx0XHRuZXh0OiAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gaXRlcmF0b3IubmV4dCgpO1xuXHRcdFx0XHRpZiAodmFsdWUuZG9uZSkge1xuXHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIXZhbHVlLnJlYWR5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZWFkeSh0aGlzLnNjb3BlV2l0aEZvY3VzKGkrKywgdmFsdWUudmFsdWUsIGNvbnRleHRTZXF1ZW5jZSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IER5bmFtaWNDb250ZXh0O1xuIl19