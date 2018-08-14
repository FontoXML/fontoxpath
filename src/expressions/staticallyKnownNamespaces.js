export const XML_NAMESPACE_URI = 'http://www.w3.org/XML/1998/namespace';
export const XMLSCHEMA_NAMESPACE_URI = 'http://www.w3.org/2001/XMLSchema';
export const ARRAY_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions/array';
export const FUNCTIONS_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions';
export const MAP_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions/map';
export const MATH_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions/math';
export const FONTOXPATH_NAMESPACE_URI = 'http://fontoxml.com/fontoxpath';

export const staticallyKnownNamespaceByPrefix = {
	'xml': XML_NAMESPACE_URI,
	'xs': XMLSCHEMA_NAMESPACE_URI,
	'fn': FUNCTIONS_NAMESPACE_URI,
	'map': MAP_NAMESPACE_URI,
	'array': ARRAY_NAMESPACE_URI,
	'math': MATH_NAMESPACE_URI,
	'fontoxpath': FONTOXPATH_NAMESPACE_URI
};

export function registerStaticallyKnownNamespace (prefix, namespaceURI) {
	if (staticallyKnownNamespaceByPrefix[prefix]) {
		throw new Error('Prefix already registered: Do not register the same prefix twice.');
	}
	staticallyKnownNamespaceByPrefix[prefix] = namespaceURI;
}
