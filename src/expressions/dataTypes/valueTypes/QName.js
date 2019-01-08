"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QName {
    /**
     * @param  prefix         The prefix of the QName, empty string if absent
     * @param  namespaceURI   The namespaceURI of the QName, empty string if absent
     * @param  localPart      The localPart of the QName, contains no colons
     */
    constructor(prefix, namespaceURI, localPart) {
        this.namespaceURI = namespaceURI || null;
        this.prefix = prefix || '';
        this.localPart = localPart;
    }
    buildPrefixedName() {
        return this.prefix ? this.prefix + ':' + this.localPart : this.localPart;
    }
}
exports.default = QName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUU5hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJRTmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sS0FBSztJQUlWOzs7O09BSUc7SUFDSCxZQUFhLE1BQWMsRUFBRSxZQUEyQixFQUFFLFNBQWlCO1FBQzFFLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxJQUFJLElBQUksQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDNUIsQ0FBQztJQUVELGlCQUFpQjtRQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUUsQ0FBQztDQUNEO0FBRUQsa0JBQWUsS0FBSyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUU5hbWUge1xuXHRuYW1lc3BhY2VVUkk6IHN0cmluZztcblx0cHJlZml4OiBzdHJpbmc7XG5cdGxvY2FsUGFydDogc3RyaW5nO1xuXHQvKipcblx0ICogQHBhcmFtICBwcmVmaXggICAgICAgICBUaGUgcHJlZml4IG9mIHRoZSBRTmFtZSwgZW1wdHkgc3RyaW5nIGlmIGFic2VudFxuXHQgKiBAcGFyYW0gIG5hbWVzcGFjZVVSSSAgIFRoZSBuYW1lc3BhY2VVUkkgb2YgdGhlIFFOYW1lLCBlbXB0eSBzdHJpbmcgaWYgYWJzZW50XG5cdCAqIEBwYXJhbSAgbG9jYWxQYXJ0ICAgICAgVGhlIGxvY2FsUGFydCBvZiB0aGUgUU5hbWUsIGNvbnRhaW5zIG5vIGNvbG9uc1xuXHQgKi9cblx0Y29uc3RydWN0b3IgKHByZWZpeDogc3RyaW5nLCBuYW1lc3BhY2VVUkk6IHN0cmluZyB8IG51bGwsIGxvY2FsUGFydDogc3RyaW5nKSB7XG5cdFx0dGhpcy5uYW1lc3BhY2VVUkkgPSBuYW1lc3BhY2VVUkkgfHwgbnVsbDtcblx0XHR0aGlzLnByZWZpeCA9IHByZWZpeCB8fCAnJztcblx0XHR0aGlzLmxvY2FsUGFydCA9IGxvY2FsUGFydDtcblx0fVxuXG5cdGJ1aWxkUHJlZml4ZWROYW1lICgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcmVmaXggPyB0aGlzLnByZWZpeCArICc6JyArIHRoaXMubG9jYWxQYXJ0IDogdGhpcy5sb2NhbFBhcnQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUU5hbWU7XG4iXX0=