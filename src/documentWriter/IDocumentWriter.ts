/**
 * @public
 */

import { Document, Element, Node } from '../types/Types';

export default interface IDocumentWriter {
	insertBefore(parent: Element | Document, newNode: Node, referenceNode: Node | null): void;
	removeAttributeNS(node: Element, namespace: string, name: string): void;
	removeChild(parent: Element | Document, child: Node): void;
	setAttributeNS(node: Element, namespace: string, name: string, value: string): void;
	setData(node: Node, data: string): void;
}
