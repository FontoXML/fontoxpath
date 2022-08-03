import { NODE_TYPES } from '../domFacade/ConcreteNode';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import { stringToSequenceType } from '../expressions/dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../expressions/staticallyKnownNamespaces';
import { errXPTY0004 } from '../expressions/XPathErrors';
import { Element } from '../types/Types';
import { ASTAttributes, IAST } from './astHelper';

export default function convertXmlToAst(element: Element): IAST {
	const domFacade = new ExternalDomFacade();
	if (
		element.namespaceURI !== BUILT_IN_NAMESPACE_URIS.XQUERYX_NAMESPACE_URI &&
		element.namespaceURI !== BUILT_IN_NAMESPACE_URIS.XQUERYX_NAMESPACE_URI &&
		// We added the stacktrace nodes in our own namespace
		element.namespaceURI !== BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI &&
		element.namespaceURI !== BUILT_IN_NAMESPACE_URIS.XQUERYX_UPDATING_NAMESPACE_URI
	) {
		throw errXPTY0004('The XML structure passed as an XQueryX program was not valid XQueryX');
	}
	const ast: IAST = [element.localName === 'stackTrace' ? 'x:stackTrace' : element.localName];

	const attributes = domFacade.getAllAttributes(element);
	if (attributes && attributes.length > 0) {
		ast.push(
			Array.from(attributes).reduce<ASTAttributes>((attrs, attr) => {
				if (
					attr.localName === 'start' ||
					(attr.localName === 'end' && element.localName === 'stackTrace')
				) {
					attrs[attr.localName] = JSON.parse(attr.value);
				} else if (attr.localName === 'type') {
					attrs[attr.localName] = stringToSequenceType(attr.value);
				} else {
					attrs[attr.localName] = attr.value;
				}
				return attrs;
			}, {})
		);
	}

	const childNodes = domFacade.getChildNodes(element);
	for (const child of childNodes) {
		switch (child.nodeType) {
			case NODE_TYPES.ELEMENT_NODE:
				ast.push(convertXmlToAst(child as Element));
				break;
			case NODE_TYPES.TEXT_NODE:
				ast.push((child as Text).data);
		}
	}
	return ast;
}
