import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode
} from './ConcreteNode';

import IExternalDomFacade from './IExternalDomFacade';

const externalDomFacade: IExternalDomFacade = {
	'getAllAttributes': (node: ConcreteElementNode): ConcreteAttributeNode[] => {
		return Array.from(node['attributes']);
	},
	'getAttribute': (node: ConcreteElementNode, attributeName: string): string => {
		return node.getAttribute(attributeName);
	},
	'getChildNodes': (node: ConcreteParentNode): ConcreteChildNode[] => {
		return Array.from(node['childNodes']) as ConcreteChildNode[];
	},
	'getData': (node: ConcreteAttributeNode | ConcreteCharacterDataNode): string => {
		return node['data'];
	},
	'getFirstChild': (node: ConcreteParentNode): ConcreteChildNode => {
		return node['firstChild'] as ConcreteChildNode;
	},
	'getLastChild': (node: ConcreteParentNode): ConcreteChildNode => {
		return node['lastChild'] as ConcreteChildNode;
	},
	'getNextSibling': (node: ConcreteChildNode): ConcreteChildNode => {
		return node['nextSibling'] as ConcreteChildNode;
	},
	'getParentNode': (node: ConcreteNode): ConcreteParentNode => {
		return node['parentNode'] as ConcreteParentNode;
	},
	'getPreviousSibling': (node: ConcreteChildNode): ConcreteChildNode => {
		return node['previousSibling'] as ConcreteChildNode;
	}
};

export default externalDomFacade;
