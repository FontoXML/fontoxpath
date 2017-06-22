import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import QName from '../dataTypes/valueTypes/QName';
import { validatePattern } from '../dataTypes/typeHelpers';

function fnQName (_dynamicContext, paramURI, paramQName) {
	const lexicalQName = paramQName.first().value;
	if (!validatePattern(lexicalQName, 'xs:QName')) {
		throw new Error('FOCA0002: The provided QName is invalid.');
	}
	const uri = paramURI.isEmpty() ? null : paramURI.first().value || null;
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
}


function fnPrefixFromQName (_dynamicContext, arg) {
	if (arg.isEmpty()) {
		return arg;
	}
	const qname = arg.first().value;
	if (!qname.prefix) {
		return Sequence.empty();
	}
	return Sequence.singleton(createAtomicValue(qname.prefix, 'xs:NCName'));
}

function fnNamespaceURIFromQName (_dynamicContext, arg) {
	if (arg.isEmpty()) {
		return arg;
	}
	const qname = arg.first().value;
	return Sequence.singleton(createAtomicValue(qname.namespaceURI || '', 'xs:anyURI'));
}

function fnLocalNameFromQName (_dynamicContext, arg) {
	if (arg.isEmpty()) {
		return arg;
	}
	const qname = arg.first().value;
	return Sequence.singleton(createAtomicValue(qname.localPart, 'xs:NCName'));
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
