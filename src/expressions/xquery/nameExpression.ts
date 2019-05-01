import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import { AsyncIterator } from '../util/iterators';
import { errXPTY0004 } from '../XPathErrors';
import { errXQDY0041, errXQDY0074 } from './XQueryErrors';

const nameExprErr = () => errXPTY0004('a single xs:string or xs:untypedAtomic');

const NCNameStartChar = /([A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])/;
const NCNameChar = new RegExp(`(${NCNameStartChar.source}|[-.0-9\xB7\u0300-\u036F\u203F\u2040])`);
const NCName = new RegExp(`${NCNameStartChar.source}${NCNameChar.source}*`, 'g');

const isValidNCName = name => {
	const matches = name.match(NCName);
	return matches ? matches.length === 1 : false;
};

export function evaluateNCNameExpression(
	executionParameters: ExecutionParameters,
	nameSequence: ISequence
): AsyncIterator<Value> {
	const name = nameSequence.atomize(executionParameters);
	return name.switchCases({
		singleton: seq => {
			const nameValue = seq.first();
			if (
				isSubtypeOf(nameValue.type, 'xs:string') ||
				isSubtypeOf(nameValue.type, 'xs:untypedAtomic')
			) {
				if (!isValidNCName(nameValue.value)) {
					throw errXQDY0041(nameValue.value);
				}
				return sequenceFactory.singleton(nameValue);
			}
			throw nameExprErr();
		},
		default: () => {
			throw nameExprErr();
		}
	}).value;
}

export function evaluateQNameExpression(
	staticContext: StaticContext,
	executionParameters: ExecutionParameters,
	nameSequence: ISequence
): AsyncIterator<Value> {
	const name = nameSequence.atomize(executionParameters);
	return name.switchCases({
		singleton: seq => {
			const nameValue = seq.first();
			if (isSubtypeOf(nameValue.type, 'xs:QName')) {
				return sequenceFactory.singleton(nameValue);
			} else if (
				isSubtypeOf(nameValue.type, 'xs:string') ||
				isSubtypeOf(nameValue.type, 'xs:untypedAtomic')
			) {
				let prefix: string;
				let namespaceURI: string;
				let localName: string;
				const parts = nameValue.value.split(':');
				if (parts.length === 1) {
					localName = parts[0];
				} else {
					prefix = parts[0];
					namespaceURI = staticContext.resolveNamespace(prefix);
					localName = parts[1];
				}
				if (!isValidNCName(localName) || (prefix && !isValidNCName(prefix))) {
					throw errXQDY0074(prefix ? `${prefix}:${localName}` : localName);
				}
				if (prefix && !namespaceURI) {
					throw errXQDY0074(`${prefix}:${localName}`);
				}
				return sequenceFactory.singleton({
					type: 'xs:QName',
					value: new QName(prefix, namespaceURI, localName)
				});
			}
			throw nameExprErr();
		},
		default: () => {
			throw nameExprErr();
		}
	}).value;
}
