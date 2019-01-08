"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestAbstractExpression_1 = require("./TestAbstractExpression");
const Specificity_1 = require("../Specificity");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
class NameTest extends TestAbstractExpression_1.default {
    /**
     * @param  {{prefix:string, namespaceURI: ?string, localName: string}} name
     * @param  {{kind: ?number}} [options=]
     */
    constructor(name, options = { kind: null }) {
        const { prefix, namespaceURI, localName } = name;
        const specificity = {};
        if (localName !== '*') {
            specificity[Specificity_1.default.NODENAME_KIND] = 1;
        }
        if (options.kind !== null) {
            specificity[Specificity_1.default.NODETYPE_KIND] = 1;
        }
        super(new Specificity_1.default(specificity));
        this._localName = localName;
        this._namespaceURI = namespaceURI;
        this._prefix = prefix || (namespaceURI ? null : '');
        this._kind = options.kind;
    }
    performStaticEvaluation(staticContext) {
        if (this._namespaceURI === null && this._prefix !== '*') {
            this._namespaceURI = staticContext.resolveNamespace(this._prefix || '');
            if (!this._namespaceURI && this._prefix) {
                throw new Error(`XPST0081: The prefix ${this._prefix} could not be resolved.`);
            }
        }
    }
    evaluateToBoolean(_dynamicContext, node) {
        const nodeIsElement = isSubtypeOf_1.default(node.type, 'element()');
        const nodeIsAttribute = isSubtypeOf_1.default(node.type, 'attribute()');
        if (!nodeIsElement && !nodeIsAttribute) {
            return false;
        }
        if (this._kind !== null && ((this._kind === 1 && !nodeIsElement) || this._kind === 2 && !nodeIsAttribute)) {
            return false;
        }
        // Easy cases first
        if (this._prefix === null && this._namespaceURI !== '' && this._localName === '*') {
            return true;
        }
        if (this._prefix === '*') {
            if (this._localName === '*') {
                return true;
            }
            return this._localName === node.value.localName;
        }
        if (this._localName !== '*') {
            if (this._localName !== node.value.localName) {
                return false;
            }
        }
        let resolvedNamespaceURI;
        if (this._prefix === '') {
            // An unprefixed QName, when used as a name test on an axis whose principal node kind is element,
            //    has the namespace URI of the default element/type namespace in the expression context;
            //    otherwise, it has no namespace URI.
            if (nodeIsElement) {
                resolvedNamespaceURI = this._namespaceURI || null;
            }
            else {
                resolvedNamespaceURI = null;
            }
        }
        else {
            // We have a prefixed name test.
            resolvedNamespaceURI = this._namespaceURI || null;
        }
        return node.value.namespaceURI === resolvedNamespaceURI;
    }
    getBucket() {
        if (this._localName === '*') {
            if (this._kind === null) {
                return null;
            }
            return `type-${this._kind}`;
        }
        return 'name-' + this._localName;
    }
}
exports.default = NameTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmFtZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJOYW1lVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFFQUE4RDtBQUM5RCxnREFBeUM7QUFDekMsMERBQW1EO0FBRW5ELE1BQU0sUUFBUyxTQUFRLGdDQUFzQjtJQUM1Qzs7O09BR0c7SUFDSCxZQUFhLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO1FBQzFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqRCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFdkIsSUFBSSxTQUFTLEtBQUssR0FBRyxFQUFFO1lBQ3RCLFdBQVcsQ0FBQyxxQkFBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzQztRQUNELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDMUIsV0FBVyxDQUFDLHFCQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsS0FBSyxDQUFDLElBQUkscUJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXBDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXBELElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztJQUMzQixDQUFDO0lBRUQsdUJBQXVCLENBQUUsYUFBYTtRQUNyQyxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssR0FBRyxFQUFFO1lBQ3hELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7WUFFeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLE9BQU8seUJBQXlCLENBQUMsQ0FBQzthQUMvRTtTQUNEO0lBQ0YsQ0FBQztJQUVELGlCQUFpQixDQUFFLGVBQWUsRUFBRSxJQUFJO1FBQ3ZDLE1BQU0sYUFBYSxHQUFHLHFCQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMxRCxNQUFNLGVBQWUsR0FBRyxxQkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN2QyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQzFHLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxtQkFBbUI7UUFDbkIsSUFDQyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtZQUMvRSxPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLEdBQUcsRUFBRTtZQUN6QixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFO2dCQUM1QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1NBRWhEO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7Z0JBQzdDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7U0FDRDtRQUVELElBQUksb0JBQW9CLENBQUM7UUFDekIsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN4QixpR0FBaUc7WUFDakcsNEZBQTRGO1lBQzVGLHlDQUF5QztZQUN6QyxJQUFJLGFBQWEsRUFBRTtnQkFDbEIsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUM7YUFDbEQ7aUJBQ0k7Z0JBQ0osb0JBQW9CLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1NBQ0Q7YUFDSTtZQUNKLGdDQUFnQztZQUNoQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQztTQUNsRDtRQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEtBQUssb0JBQW9CLENBQUM7SUFDekQsQ0FBQztJQUVELFNBQVM7UUFDUixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxDQUFDO0NBQ0Q7QUFFRCxrQkFBZSxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVzdEFic3RyYWN0RXhwcmVzc2lvbiBmcm9tICcuL1Rlc3RBYnN0cmFjdEV4cHJlc3Npb24nO1xuaW1wb3J0IFNwZWNpZmljaXR5IGZyb20gJy4uL1NwZWNpZmljaXR5JztcbmltcG9ydCBpc1N1YnR5cGVPZiBmcm9tICcuLi9kYXRhVHlwZXMvaXNTdWJ0eXBlT2YnO1xuXG5jbGFzcyBOYW1lVGVzdCBleHRlbmRzIFRlc3RBYnN0cmFjdEV4cHJlc3Npb24ge1xuXHQvKipcblx0ICogQHBhcmFtICB7e3ByZWZpeDpzdHJpbmcsIG5hbWVzcGFjZVVSSTogP3N0cmluZywgbG9jYWxOYW1lOiBzdHJpbmd9fSBuYW1lXG5cdCAqIEBwYXJhbSAge3traW5kOiA/bnVtYmVyfX0gW29wdGlvbnM9XVxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIG9wdGlvbnMgPSB7IGtpbmQ6IG51bGwgfSkge1xuXHRcdGNvbnN0IHsgcHJlZml4LCBuYW1lc3BhY2VVUkksIGxvY2FsTmFtZSB9ID0gbmFtZTtcblx0XHRjb25zdCBzcGVjaWZpY2l0eSA9IHt9O1xuXG5cdFx0aWYgKGxvY2FsTmFtZSAhPT0gJyonKSB7XG5cdFx0XHRzcGVjaWZpY2l0eVtTcGVjaWZpY2l0eS5OT0RFTkFNRV9LSU5EXSA9IDE7XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLmtpbmQgIT09IG51bGwpIHtcblx0XHRcdHNwZWNpZmljaXR5W1NwZWNpZmljaXR5Lk5PREVUWVBFX0tJTkRdID0gMTtcblx0XHR9XG5cdFx0c3VwZXIobmV3IFNwZWNpZmljaXR5KHNwZWNpZmljaXR5KSk7XG5cblx0XHR0aGlzLl9sb2NhbE5hbWUgPSBsb2NhbE5hbWU7XG5cdFx0dGhpcy5fbmFtZXNwYWNlVVJJID0gbmFtZXNwYWNlVVJJO1xuXHRcdHRoaXMuX3ByZWZpeCA9IHByZWZpeCB8fCAobmFtZXNwYWNlVVJJID8gbnVsbCA6ICcnKTtcblxuXHRcdHRoaXMuX2tpbmQgPSBvcHRpb25zLmtpbmQ7XG5cdH1cblxuXHRwZXJmb3JtU3RhdGljRXZhbHVhdGlvbiAoc3RhdGljQ29udGV4dCkge1xuXHRcdGlmICh0aGlzLl9uYW1lc3BhY2VVUkkgPT09IG51bGwgJiYgdGhpcy5fcHJlZml4ICE9PSAnKicpIHtcblx0XHRcdHRoaXMuX25hbWVzcGFjZVVSSSA9IHN0YXRpY0NvbnRleHQucmVzb2x2ZU5hbWVzcGFjZSh0aGlzLl9wcmVmaXggfHwgJycpO1xuXG5cdFx0XHRpZiAoIXRoaXMuX25hbWVzcGFjZVVSSSAmJiB0aGlzLl9wcmVmaXgpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBYUFNUMDA4MTogVGhlIHByZWZpeCAke3RoaXMuX3ByZWZpeH0gY291bGQgbm90IGJlIHJlc29sdmVkLmApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGV2YWx1YXRlVG9Cb29sZWFuIChfZHluYW1pY0NvbnRleHQsIG5vZGUpIHtcblx0XHRjb25zdCBub2RlSXNFbGVtZW50ID0gaXNTdWJ0eXBlT2Yobm9kZS50eXBlLCAnZWxlbWVudCgpJyk7XG5cdFx0Y29uc3Qgbm9kZUlzQXR0cmlidXRlID0gaXNTdWJ0eXBlT2Yobm9kZS50eXBlLCAnYXR0cmlidXRlKCknKTtcblx0XHRpZiAoIW5vZGVJc0VsZW1lbnQgJiYgIW5vZGVJc0F0dHJpYnV0ZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fa2luZCAhPT0gbnVsbCAmJiAoKHRoaXMuX2tpbmQgPT09IDEgJiYgIW5vZGVJc0VsZW1lbnQpIHx8IHRoaXMuX2tpbmQgPT09IDIgJiYgIW5vZGVJc0F0dHJpYnV0ZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Ly8gRWFzeSBjYXNlcyBmaXJzdFxuXHRcdGlmIChcblx0XHRcdHRoaXMuX3ByZWZpeCA9PT0gbnVsbCAmJiB0aGlzLl9uYW1lc3BhY2VVUkkgIT09ICcnICYmIHRoaXMuX2xvY2FsTmFtZSA9PT0gJyonKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuX3ByZWZpeCA9PT0gJyonKSB7XG5cdFx0XHRpZiAodGhpcy5fbG9jYWxOYW1lID09PSAnKicpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5fbG9jYWxOYW1lID09PSBub2RlLnZhbHVlLmxvY2FsTmFtZTtcblxuXHRcdH1cblx0XHRpZiAodGhpcy5fbG9jYWxOYW1lICE9PSAnKicpIHtcblx0XHRcdGlmICh0aGlzLl9sb2NhbE5hbWUgIT09IG5vZGUudmFsdWUubG9jYWxOYW1lKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgcmVzb2x2ZWROYW1lc3BhY2VVUkk7XG5cdFx0aWYgKHRoaXMuX3ByZWZpeCA9PT0gJycpIHtcblx0XHRcdC8vIEFuIHVucHJlZml4ZWQgUU5hbWUsIHdoZW4gdXNlZCBhcyBhIG5hbWUgdGVzdCBvbiBhbiBheGlzIHdob3NlIHByaW5jaXBhbCBub2RlIGtpbmQgaXMgZWxlbWVudCxcblx0XHRcdC8vICAgIGhhcyB0aGUgbmFtZXNwYWNlIFVSSSBvZiB0aGUgZGVmYXVsdCBlbGVtZW50L3R5cGUgbmFtZXNwYWNlIGluIHRoZSBleHByZXNzaW9uIGNvbnRleHQ7XG5cdFx0XHQvLyAgICBvdGhlcndpc2UsIGl0IGhhcyBubyBuYW1lc3BhY2UgVVJJLlxuXHRcdFx0aWYgKG5vZGVJc0VsZW1lbnQpIHtcblx0XHRcdFx0cmVzb2x2ZWROYW1lc3BhY2VVUkkgPSB0aGlzLl9uYW1lc3BhY2VVUkkgfHwgbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRyZXNvbHZlZE5hbWVzcGFjZVVSSSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gV2UgaGF2ZSBhIHByZWZpeGVkIG5hbWUgdGVzdC5cblx0XHRcdHJlc29sdmVkTmFtZXNwYWNlVVJJID0gdGhpcy5fbmFtZXNwYWNlVVJJIHx8IG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vZGUudmFsdWUubmFtZXNwYWNlVVJJID09PSByZXNvbHZlZE5hbWVzcGFjZVVSSTtcblx0fVxuXG5cdGdldEJ1Y2tldCAoKSB7XG5cdFx0aWYgKHRoaXMuX2xvY2FsTmFtZSA9PT0gJyonKSB7XG5cdFx0XHRpZiAodGhpcy5fa2luZCA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBgdHlwZS0ke3RoaXMuX2tpbmR9YDtcblx0XHR9XG5cdFx0cmV0dXJuICduYW1lLScgKyB0aGlzLl9sb2NhbE5hbWU7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTmFtZVRlc3Q7XG4iXX0=