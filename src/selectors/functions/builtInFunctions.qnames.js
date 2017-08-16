import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import QName from '../dataTypes/valueTypes/QName';
import { validatePattern } from '../dataTypes/typeHelpers';
import zipSingleton from '../util/zipSingleton';

function fnQName (_dynamicContext, paramURI, paramQName) {
	return zipSingleton([paramURI, paramQName], ([uriValue, lexicalQNameValue]) => {
		const lexicalQName = lexicalQNameValue.value;
		if (!validatePattern(lexicalQName, 'xs:QName')) {
			throw new Error('FOCA0002: The provided QName is invalid.');
		}
		const uri = uriValue ? uriValue.value || null : null;
		if (uri === null && lexicalQName.includes(':')) {
			throw new Error('FOCA0002: The URI of a QNAme may not be empty if a prefix is provided.');
		}
		// Skip URI validation for now

		if (paramURI.isEmpty()) {
			return Sequence.singleton(createAtomicValue(new QName('', null, lexicalQName), 'xs:QName'));
		}
		if (!lexicalQName.includes(':')) {
			// Only a local part
			return Sequence.singleton(createAtomicValue(new QName('', uri, lexicalQName), 'xs:QName'));
		}
		const [prefix, localPart] = lexicalQName.split(':');
		return Sequence.singleton(createAtomicValue(new QName(prefix, uri, localPart), 'xs:QName'));
	});
}

function fnPrefixFromQName (_dynamicContext, arg) {
	return zipSingleton([arg], ([qname]) => {
		if (qname === null) {
			return Sequence.empty();
		}
		const qnameValue = qname.value;
		if (!qnameValue.prefix) {
			return Sequence.empty();
		}
		return Sequence.singleton(createAtomicValue(qnameValue.prefix, 'xs:NCName'));
	});
}

function fnNamespaceURIFromQName (_dynamicContext, arg) {
	return arg.map(qname => {
		const qnameValue = qname.value;
		return createAtomicValue(qnameValue.namespaceURI || '', 'xs:anyURI');
	});

}

function fnLocalNameFromQName (_dynamicContext, arg) {
	return arg.map(qname => {
		const qnameValue = qname.value;
		return createAtomicValue(qnameValue.localPart, 'xs:NCName');
	});

}

export default {
	declarations: [
		{
			name: 'QName',
			argumentTypes: ['xs:string?', 'xs:string'],
			returnType: 'xs:QName',
			callFunction: fnQName
		},
		{
			name: 'prefix-from-QName',
			argumentTypes: ['xs:QName?'],
			returnType: 'xs:NCName?',
			callFunction: fnPrefixFromQName
		},
		{
			name: 'local-name-from-QName',
			argumentTypes: ['xs:QName?'],
			returnType: 'xs:NCName?',
			callFunction: fnLocalNameFromQName
		},
		{
			name: 'namespace-uri-from-QName',
			argumentTypes: ['xs:QName?'],
			returnType: 'xs:anyURI?',
			callFunction: fnNamespaceURIFromQName
		}
	]
};
