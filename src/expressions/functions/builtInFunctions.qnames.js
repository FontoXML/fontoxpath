import SequenceFactory from '../dataTypes/SequenceFactory';
import createAtomicValue from '../dataTypes/createAtomicValue';
import QName from '../dataTypes/valueTypes/QName';
import { validatePattern } from '../dataTypes/typeHelpers';
import zipSingleton from '../util/zipSingleton';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from'./FunctionDefinitionType';

/**
 * @type {!FunctionDefinitionType}
 */
function fnQName (_dynamicContext, _executionParameters, _staticContext, paramURI, paramQName) {
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
			return SequenceFactory.singleton(createAtomicValue(new QName('', null, lexicalQName), 'xs:QName'));
		}
		if (!lexicalQName.includes(':')) {
			// Only a local part
			return SequenceFactory.singleton(createAtomicValue(new QName('', uri, lexicalQName), 'xs:QName'));
		}
		const [prefix, localPart] = lexicalQName.split(':');
		return SequenceFactory.singleton(createAtomicValue(new QName(prefix, uri, localPart), 'xs:QName'));
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnPrefixFromQName (_dynamicContext, _executionParameters, _staticContext, arg) {
	return zipSingleton([arg], ([qname]) => {
		if (qname === null) {
			return SequenceFactory.empty();
		}
		const qnameValue = qname.value;
		if (!qnameValue.prefix) {
			return SequenceFactory.empty();
		}
		return SequenceFactory.singleton(createAtomicValue(qnameValue.prefix, 'xs:NCName'));
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnNamespaceURIFromQName (_dynamicContext, _executionParameters, _staticContext, arg) {
	return arg.map(qname => {
		const qnameValue = qname.value;
		return createAtomicValue(qnameValue.namespaceURI || '', 'xs:anyURI');
	});

}

/**
 * @type {!FunctionDefinitionType}
 */
function fnLocalNameFromQName (_dynamicContext, _executionParameters, _staticContext, arg) {
	return arg.map(qname => {
		const qnameValue = qname.value;
		return createAtomicValue(qnameValue.localPart, 'xs:NCName');
	});

}

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'QName',
			argumentTypes: ['xs:string?', 'xs:string'],
			returnType: 'xs:QName',
			callFunction: fnQName
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'prefix-from-QName',
			argumentTypes: ['xs:QName?'],
			returnType: 'xs:NCName?',
			callFunction: fnPrefixFromQName
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'local-name-from-QName',
			argumentTypes: ['xs:QName?'],
			returnType: 'xs:NCName?',
			callFunction: fnLocalNameFromQName
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'namespace-uri-from-QName',
			argumentTypes: ['xs:QName?'],
			returnType: 'xs:anyURI?',
			callFunction: fnNamespaceURIFromQName
		}
	]
};
