import { Attr, CharacterData, Element, Node } from '../types/Types';

/**
 * The base interface of a dom facade
 *
 * @public
 */
export default interface IDomFacade {
	getAllAttributes(node: Element, bucket: string | null): Attr[];
	getAttribute(node: Element, attributeName: string): string | null;
	getChildNodes(node: Node, bucket: string | null): Node[];
	getData(node: Attr | CharacterData): string;
	getFirstChild(node: Node, bucket: string | null): Node | null;
	getLastChild(node: Node, bucket: string | null): Node | null;
	getNextSibling(node: Node, bucket: string | null): Node | null;
	getParentNode(node: Node, bucket: string | null): Node | null;
	getPreviousSibling(node: Node, bucket: string | null): Node | null;
}
