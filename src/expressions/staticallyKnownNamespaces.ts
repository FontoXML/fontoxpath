export const enum BUILT_IN_NAMESPACE_URIS {
	XMLNS_NAMESPACE_URI = 'http://www.w3.org/2000/xmlns/',
	XML_NAMESPACE_URI = 'http://www.w3.org/XML/1998/namespace',
	XMLSCHEMA_NAMESPACE_URI = 'http://www.w3.org/2001/XMLSchema',
	ARRAY_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions/array',
	FUNCTIONS_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions',
	LOCAL_NAMESPACE_URI = 'http://www.w3.org/2005/xquery-local-functions',
	MAP_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions/map',
	MATH_NAMESPACE_URI = 'http://www.w3.org/2005/xpath-functions/math',
	FONTOXPATH_NAMESPACE_URI = 'http://fontoxml.com/fontoxpath',
}

export const staticallyKnownNamespaceByPrefix: {
	[prefix: string]: BUILT_IN_NAMESPACE_URIS | string;
} = {
	['xml']: BUILT_IN_NAMESPACE_URIS.XML_NAMESPACE_URI,
	['xs']: BUILT_IN_NAMESPACE_URIS.XMLSCHEMA_NAMESPACE_URI,
	['fn']: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
	['map']: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
	['array']: BUILT_IN_NAMESPACE_URIS.ARRAY_NAMESPACE_URI,
	['math']: BUILT_IN_NAMESPACE_URIS.MATH_NAMESPACE_URI,
	['fontoxpath']: BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI,
	['local']: BUILT_IN_NAMESPACE_URIS.LOCAL_NAMESPACE_URI,
};

export function registerStaticallyKnownNamespace(prefix: string, namespaceURI: string) {
	if (staticallyKnownNamespaceByPrefix[prefix]) {
		throw new Error('Prefix already registered: Do not register the same prefix twice.');
	}
	staticallyKnownNamespaceByPrefix[prefix] = namespaceURI;
}
