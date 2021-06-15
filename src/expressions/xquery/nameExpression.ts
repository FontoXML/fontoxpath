import atomize from '../dataTypes/atomize';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import { IIterator } from '../util/iterators';
import { errXPTY0004 } from '../XPathErrors';
import { errXQDY0041, errXQDY0074 } from './XQueryErrors';

const nameExprErr = () =>
	errXPTY0004(
		'Casting not supported from given type to a single xs:string or xs:untypedAtomic or any of its derived types.'
	);

const NC_NAME_START_CHAR =
	/([A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])/;
const NC_NAME_CHAR = new RegExp(
	`(${NC_NAME_START_CHAR.source}|[-.0-9\xB7\u0300-\u036F\u203F\u2040])`
);
const NC_NAME = new RegExp(`${NC_NAME_START_CHAR.source}${NC_NAME_CHAR.source}*`, 'g');

const isValidNCName = (name: string) => {
	const matches = name.match(NC_NAME);
	return matches ? matches.length === 1 : false;
};

export function evaluateNCNameExpression(
	executionParameters: ExecutionParameters,
	nameSequence: ISequence
): IIterator<Value> {
	const name = atomize(nameSequence, executionParameters);
	return name.switchCases({
		singleton: (seq) => {
			const nameValue = seq.first();
			if (
				isSubtypeOf(nameValue.type, ValueType.XSSTRING) ||
				isSubtypeOf(nameValue.type, ValueType.XSUNTYPEDATOMIC)
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
		},
	}).value;
}

export function evaluateQNameExpression(
	staticContext: StaticContext,
	executionParameters: ExecutionParameters,
	nameSequence: ISequence
): IIterator<Value> {
	const name = atomize(nameSequence, executionParameters);
	return name.switchCases({
		singleton: (seq) => {
			const nameValue = seq.first();
			if (isSubtypeOf(nameValue.type, ValueType.XSQNAME)) {
				return sequenceFactory.singleton(nameValue);
			} else if (
				isSubtypeOf(nameValue.type, ValueType.XSSTRING) ||
				isSubtypeOf(nameValue.type, ValueType.XSUNTYPEDATOMIC)
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
					type: ValueType.XSQNAME,
					value: new QName(prefix, namespaceURI, localName),
				});
			}
			throw nameExprErr();
		},
		default: () => {
			throw nameExprErr();
		},
	}).value;
}
