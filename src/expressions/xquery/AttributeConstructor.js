"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XPathErrors_1 = require("../XPathErrors");
const XQueryErrors_1 = require("./XQueryErrors");
const Expression_1 = require("../Expression");
const Specificity_1 = require("../Specificity");
const nameExpressions_1 = require("./nameExpressions");
const iterators_1 = require("../util/iterators");
const createAtomicValue_1 = require("../dataTypes/createAtomicValue");
const createNodeValue_1 = require("../dataTypes/createNodeValue");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const QName_1 = require("../dataTypes/valueTypes/QName");
const concatSequences_1 = require("../util/concatSequences");
function createAttribute(nodesFactory, name, value) {
    const attr = nodesFactory.createAttributeNS(name.namespaceURI, name.buildPrefixedName());
    attr.value = value;
    return attr;
}
/**
 * @extends {Expression}
 */
class AttributeConstructor extends Expression_1.default {
    /**
     * @param  {} name
     * @param  {!} value
     */
    constructor(name, value) {
        let childExpressions = value.valueExprParts || [];
        childExpressions = childExpressions.concat(name.expr || []);
        super(new Specificity_1.default({}), childExpressions, {
            canBeStaticallyEvaluated: false,
            resultOrder: Expression_1.default.RESULT_ORDERINGS.UNSORTED
        });
        if (name.expr) {
            this._nameExpr = name.expr;
        }
        else {
            this.name = new QName_1.default(name.prefix, name.namespaceURI, name.localName);
        }
        this._value = value;
        this._staticContext = undefined;
    }
    performStaticEvaluation(staticContext) {
        this._staticContext = staticContext.cloneContext();
        if (this.name) {
            if (this.name.prefix && !this.name.namespaceURI) {
                const namespaceURI = staticContext.resolveNamespace(this.name.prefix);
                if (namespaceURI === undefined && this.name.prefix) {
                    throw XPathErrors_1.errXPST0081(this.name.prefix);
                }
                this.name.namespaceURI = namespaceURI || null;
            }
        }
        super.performStaticEvaluation(staticContext);
    }
    evaluate(dynamicContext, executionParameters) {
        const nodesFactory = executionParameters.nodesFactory;
        let nameIterator;
        let name;
        let valueIterator;
        let done = false;
        return SequenceFactory_1.default.create({
            next: () => {
                if (done) {
                    return iterators_1.DONE_TOKEN;
                }
                if (!name) {
                    if (this._nameExpr) {
                        if (!nameIterator) {
                            const nameSequence = this._nameExpr.evaluate(dynamicContext, executionParameters);
                            nameIterator = nameExpressions_1.evaluateQNameExpression(this._staticContext, executionParameters, nameSequence);
                        }
                        const nv = nameIterator.next();
                        if (!nv.ready) {
                            return nv;
                        }
                        name = nv.value.value;
                    }
                    else {
                        name = this.name;
                    }
                    if (name && (name.prefix === 'xmlns' ||
                        (!name.prefix && name.localPart === 'xmlns') ||
                        name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
                        (name.prefix === 'xml' && name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
                        (name.prefix && name.prefix !== 'xml' && name.namespaceURI === 'http://www.w3.org/XML/1998/namespace'))) {
                        throw XQueryErrors_1.errXQDY0044(name);
                    }
                }
                if (this._value.valueExprParts) {
                    const valueExprParts = this._value;
                    if (!valueIterator) {
                        valueIterator = concatSequences_1.default(valueExprParts
                            .map(expr => {
                            return expr
                                .evaluate(dynamicContext, executionParameters)
                                .atomize(executionParameters)
                                .mapAll(allValues => SequenceFactory_1.default.singleton(createAtomicValue_1.default(allValues.map(val => val.value).join(' '), 'xs:string')));
                        }))
                            .mapAll(allValueParts => SequenceFactory_1.default.singleton(createNodeValue_1.default(createAttribute(nodesFactory, name, allValueParts
                            .map(val => val.value)
                            .join(''))))).value;
                    }
                    return valueIterator.next();
                }
                done = true;
                return iterators_1.ready(createNodeValue_1.default(createAttribute(nodesFactory, name, this._value.value)));
            }
        });
    }
}
exports.default = AttributeConstructor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXR0cmlidXRlQ29uc3RydWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBdHRyaWJ1dGVDb25zdHJ1Y3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUE2QztBQUM3QyxpREFBNkM7QUFDN0MsOENBQXVDO0FBQ3ZDLGdEQUF5QztBQUV6Qyx1REFBNEQ7QUFDNUQsaURBQXNEO0FBQ3RELHNFQUErRDtBQUMvRCxrRUFBMkQ7QUFDM0Qsa0VBQTJEO0FBQzNELHlEQUFrRDtBQUVsRCw2REFBc0Q7QUFHdEQsU0FBUyxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLO0lBQ2pELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7SUFDekYsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbkIsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLG9CQUFxQixTQUFRLG9CQUFVO0lBTTVDOzs7T0FHRztJQUNILFlBQ0MsSUFBd0YsRUFDeEYsS0FBZ0U7UUFFaEUsSUFBSSxnQkFBZ0IsR0FBSSxLQUFhLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztRQUMzRCxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUUsSUFBWSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyRSxLQUFLLENBQ0osSUFBSSxxQkFBVyxDQUFDLEVBQUUsQ0FBQyxFQUNuQixnQkFBZ0IsRUFDaEI7WUFDQyx3QkFBd0IsRUFBRSxLQUFLO1lBQy9CLFdBQVcsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDLFFBQVE7U0FDakQsQ0FBQyxDQUFDO1FBRUosSUFBSyxJQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUksSUFBWSxDQUFDLElBQUksQ0FB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WUFDaEMsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQUVELGtCQUFlLG9CQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXJyWFBTVDAwODEgfSBmcm9tICcuLi9YUGF0aEVycm9ycyc7XG5pbXBvcnQgeyBlcnJYUURZMDA0NCB9IGZyb20gJy4vWFF1ZXJ5RXJyb3JzJztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4uL0V4cHJlc3Npb24nO1xuaW1wb3J0IFNwZWNpZmljaXR5IGZyb20gJy4uL1NwZWNpZmljaXR5JztcblxuaW1wb3J0IHsgZXZhbHVhdGVRTmFtZUV4cHJlc3Npb24gfSBmcm9tICcuL25hbWVFeHByZXNzaW9ucyc7XG5pbXBvcnQgeyBET05FX1RPS0VOLCByZWFkeSB9IGZyb20gJy4uL3V0aWwvaXRlcmF0b3JzJztcbmltcG9ydCBjcmVhdGVBdG9taWNWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvY3JlYXRlQXRvbWljVmFsdWUnO1xuaW1wb3J0IGNyZWF0ZU5vZGVWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvY3JlYXRlTm9kZVZhbHVlJztcbmltcG9ydCBTZXF1ZW5jZUZhY3RvcnkgZnJvbSAnLi4vZGF0YVR5cGVzL1NlcXVlbmNlRmFjdG9yeSc7XG5pbXBvcnQgUU5hbWUgZnJvbSAnLi4vZGF0YVR5cGVzL3ZhbHVlVHlwZXMvUU5hbWUnO1xuXG5pbXBvcnQgY29uY2F0U2VxdWVuY2VzIGZyb20gJy4uL3V0aWwvY29uY2F0U2VxdWVuY2VzJztcbmltcG9ydCBTdGF0aWNDb250ZXh0IGZyb20gJy4uL1N0YXRpY0NvbnRleHQnO1xuXG5mdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGUobm9kZXNGYWN0b3J5LCBuYW1lLCB2YWx1ZSkge1xuXHRjb25zdCBhdHRyID0gbm9kZXNGYWN0b3J5LmNyZWF0ZUF0dHJpYnV0ZU5TKG5hbWUubmFtZXNwYWNlVVJJLCBuYW1lLmJ1aWxkUHJlZml4ZWROYW1lKCkpO1xuXHRhdHRyLnZhbHVlID0gdmFsdWU7XG5cdHJldHVybiBhdHRyO1xufVxuXG4vKipcbiAqIEBleHRlbmRzIHtFeHByZXNzaW9ufVxuICovXG5jbGFzcyBBdHRyaWJ1dGVDb25zdHJ1Y3RvciBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHRfbmFtZUV4cHI6IEV4cHJlc3Npb247XG5cdG5hbWU6IFFOYW1lO1xuXHRfdmFsdWU6IHsgdmFsdWU6IHN0cmluZzsgfSB8IHsgdmFsdWVFeHByUGFydHM6IEV4cHJlc3Npb25bXTsgfTtcblx0X3N0YXRpY0NvbnRleHQ6IFN0YXRpY0NvbnRleHQ7XG5cblx0LyoqXG5cdCAqIEBwYXJhbSAge30gbmFtZVxuXHQgKiBAcGFyYW0gIHshfSB2YWx1ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0bmFtZTogeyBleHByOiBFeHByZXNzaW9uIH0gfCB7IHByZWZpeDogc3RyaW5nLCBuYW1lc3BhY2VVUkk6IHN0cmluZywgbG9jYWxOYW1lOiBzdHJpbmcgfSxcblx0XHR2YWx1ZTogeyB2YWx1ZTogc3RyaW5nIH0gfCB7IHZhbHVlRXhwclBhcnRzOiBBcnJheTxFeHByZXNzaW9uPiB9XG5cdCkge1xuXHRcdGxldCBjaGlsZEV4cHJlc3Npb25zID0gKHZhbHVlIGFzIGFueSkudmFsdWVFeHByUGFydHMgfHwgW107XG5cdFx0Y2hpbGRFeHByZXNzaW9ucyA9IGNoaWxkRXhwcmVzc2lvbnMuY29uY2F0KChuYW1lIGFzIGFueSkuZXhwciB8fCBbXSk7XG5cdFx0c3VwZXIoXG5cdFx0XHRuZXcgU3BlY2lmaWNpdHkoe30pLFxuXHRcdFx0Y2hpbGRFeHByZXNzaW9ucyxcblx0XHRcdHtcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBmYWxzZSxcblx0XHRcdFx0cmVzdWx0T3JkZXI6IEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5VTlNPUlRFRFxuXHRcdFx0fSk7XG5cblx0XHRpZiAoKG5hbWUgYXMgYW55KS5leHByKSB7XG5cdFx0XHR0aGlzLl9uYW1lRXhwciA9IChuYW1lIGFzIGFueSkuZXhwcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5uYW1lID0gbmV3IFFOYW1lKChuYW1lIGFzIGFueSkucHJlZml4LCAobmFtZSBhcyBhbnkpLm5hbWVzcGFjZVVSSSwgKG5hbWUgYXMgYW55KS5sb2NhbE5hbWUpO1xuXHRcdH1cblx0XHR0aGlzLl92YWx1ZSA9IHZhbHVlO1xuXHRcdHRoaXMuX3N0YXRpY0NvbnRleHQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRwZXJmb3JtU3RhdGljRXZhbHVhdGlvbihzdGF0aWNDb250ZXh0KSB7XG5cdFx0dGhpcy5fc3RhdGljQ29udGV4dCA9IHN0YXRpY0NvbnRleHQuY2xvbmVDb250ZXh0KCk7XG5cdFx0aWYgKHRoaXMubmFtZSkge1xuXHRcdFx0aWYgKHRoaXMubmFtZS5wcmVmaXggJiYgIXRoaXMubmFtZS5uYW1lc3BhY2VVUkkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZXNwYWNlVVJJID0gc3RhdGljQ29udGV4dC5yZXNvbHZlTmFtZXNwYWNlKHRoaXMubmFtZS5wcmVmaXgpO1xuXHRcdFx0XHRpZiAobmFtZXNwYWNlVVJJID09PSB1bmRlZmluZWQgJiYgdGhpcy5uYW1lLnByZWZpeCkge1xuXHRcdFx0XHRcdHRocm93IGVyclhQU1QwMDgxKHRoaXMubmFtZS5wcmVmaXgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubmFtZS5uYW1lc3BhY2VVUkkgPSBuYW1lc3BhY2VVUkkgfHwgbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0c3VwZXIucGVyZm9ybVN0YXRpY0V2YWx1YXRpb24oc3RhdGljQ29udGV4dCk7XG5cdH1cblxuXHRldmFsdWF0ZShkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycykge1xuXHRcdGNvbnN0IG5vZGVzRmFjdG9yeSA9IGV4ZWN1dGlvblBhcmFtZXRlcnMubm9kZXNGYWN0b3J5O1xuXHRcdGxldCBuYW1lSXRlcmF0b3I7XG5cdFx0bGV0IG5hbWU7XG5cblx0XHRsZXQgdmFsdWVJdGVyYXRvcjtcblxuXHRcdGxldCBkb25lID0gZmFsc2U7XG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5jcmVhdGUoe1xuXHRcdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0XHRpZiAoZG9uZSkge1xuXHRcdFx0XHRcdHJldHVybiBET05FX1RPS0VOO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFuYW1lKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX25hbWVFeHByKSB7XG5cdFx0XHRcdFx0XHRpZiAoIW5hbWVJdGVyYXRvcikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBuYW1lU2VxdWVuY2UgPSB0aGlzLl9uYW1lRXhwci5ldmFsdWF0ZShkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0XHRcdG5hbWVJdGVyYXRvciA9IGV2YWx1YXRlUU5hbWVFeHByZXNzaW9uKHRoaXMuX3N0YXRpY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIG5hbWVTZXF1ZW5jZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBudiA9IG5hbWVJdGVyYXRvci5uZXh0KCk7XG5cdFx0XHRcdFx0XHRpZiAoIW52LnJlYWR5KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBudjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5hbWUgPSBudi52YWx1ZS52YWx1ZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bmFtZSA9IHRoaXMubmFtZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAobmFtZSAmJiAobmFtZS5wcmVmaXggPT09ICd4bWxucycgfHxcblx0XHRcdFx0XHRcdCghbmFtZS5wcmVmaXggJiYgbmFtZS5sb2NhbFBhcnQgPT09ICd4bWxucycpIHx8XG5cdFx0XHRcdFx0XHRuYW1lLm5hbWVzcGFjZVVSSSA9PT0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvJyB8fFxuXHRcdFx0XHRcdFx0KG5hbWUucHJlZml4ID09PSAneG1sJyAmJiBuYW1lLm5hbWVzcGFjZVVSSSAhPT0gJ2h0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZScpIHx8XG5cdFx0XHRcdFx0XHQobmFtZS5wcmVmaXggJiYgbmFtZS5wcmVmaXggIT09ICd4bWwnICYmIG5hbWUubmFtZXNwYWNlVVJJID09PSAnaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlJykpKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnJYUURZMDA0NChuYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoKHRoaXMuX3ZhbHVlIGFzIGFueSkudmFsdWVFeHByUGFydHMpIHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZUV4cHJQYXJ0cyA9ICh0aGlzLl92YWx1ZSBhcyBhbnkpIGFzIEV4cHJlc3Npb25bXTtcblx0XHRcdFx0XHRpZiAoIXZhbHVlSXRlcmF0b3IpIHtcblx0XHRcdFx0XHRcdHZhbHVlSXRlcmF0b3IgPSBjb25jYXRTZXF1ZW5jZXMoXG5cdFx0XHRcdFx0XHRcdHZhbHVlRXhwclBhcnRzXG5cdFx0XHRcdFx0XHRcdFx0Lm1hcChleHByID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBleHByXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5ldmFsdWF0ZShkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycylcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmF0b21pemUoZXhlY3V0aW9uUGFyYW1ldGVycylcblx0XHRcdFx0XHRcdFx0XHRcdFx0Lm1hcEFsbChhbGxWYWx1ZXMgPT4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVBdG9taWNWYWx1ZShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFsbFZhbHVlcy5tYXAodmFsID0+IHZhbC52YWx1ZSkuam9pbignICcpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0J3hzOnN0cmluZycpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkpO1xuXHRcdFx0XHRcdFx0XHRcdH0pKVxuXHRcdFx0XHRcdFx0XHQubWFwQWxsKFxuXHRcdFx0XHRcdFx0XHRcdGFsbFZhbHVlUGFydHMgPT5cblx0XHRcdFx0XHRcdFx0XHRcdFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNyZWF0ZU5vZGVWYWx1ZShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVBdHRyaWJ1dGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRub2Rlc0ZhY3RvcnksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWxsVmFsdWVQYXJ0c1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQubWFwKHZhbCA9PiB2YWwudmFsdWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5qb2luKCcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpLnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWVJdGVyYXRvci5uZXh0KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkb25lID0gdHJ1ZTtcblxuXHRcdFx0XHRyZXR1cm4gcmVhZHkoY3JlYXRlTm9kZVZhbHVlKGNyZWF0ZUF0dHJpYnV0ZShcblx0XHRcdFx0XHRub2Rlc0ZhY3RvcnksXG5cdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHQodGhpcy5fdmFsdWUgYXMgYW55KS52YWx1ZSkpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBdHRyaWJ1dGVDb25zdHJ1Y3RvcjtcbiJdfQ==