"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterators_1 = require("./iterators");
function createChildGenerator(domFacade, node) {
    const childNodes = domFacade.getChildNodes(node);
    let i = 0;
    const l = childNodes.length;
    return /** @type {!Iterator<!Node>} */ ({
        next() {
            if (i >= l) {
                return iterators_1.DONE_TOKEN;
            }
            return iterators_1.ready(childNodes[i++]);
        }
    });
}
exports.default = createChildGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQ2hpbGRHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjcmVhdGVDaGlsZEdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUFnRDtBQUdoRCxTQUF3QixvQkFBb0IsQ0FBRSxTQUFvQixFQUFFLElBQVU7SUFDN0UsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQzVCLE9BQU8sK0JBQStCLENBQUMsQ0FBQztRQUN2QyxJQUFJO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNYLE9BQU8sc0JBQVUsQ0FBQzthQUNsQjtZQUNELE9BQU8saUJBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBWkQsdUNBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET05FX1RPS0VOLCByZWFkeSB9IGZyb20gJy4vaXRlcmF0b3JzJztcbmltcG9ydCBEb21GYWNhZGUgZnJvbSAnc3JjL2RvbUZhY2FkZS9Eb21GYWNhZGUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDaGlsZEdlbmVyYXRvciAoZG9tRmFjYWRlOiBEb21GYWNhZGUsIG5vZGU6IE5vZGUpOiBJdGVyYXRvcjxOb2RlPiB7XG5cdGNvbnN0IGNoaWxkTm9kZXMgPSBkb21GYWNhZGUuZ2V0Q2hpbGROb2Rlcyhub2RlKTtcblx0bGV0IGkgPSAwO1xuXHRjb25zdCBsID0gY2hpbGROb2Rlcy5sZW5ndGg7XG5cdHJldHVybiAvKiogQHR5cGUgeyFJdGVyYXRvcjwhTm9kZT59ICovICh7XG5cdFx0bmV4dCAoKSB7XG5cdFx0XHRpZiAoaSA+PSBsKSB7XG5cdFx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlYWR5KGNoaWxkTm9kZXNbaSsrXSk7XG5cdFx0fVxuXHR9KTtcbn1cbiJdfQ==