/**
 * The base interface of a dom facade
 *
 * @public
 */
export default interface IDomFacade {
	getAllAttributes(node: Element): Attr[];
	getAttribute(node: Element, attributeName: string): string | null;
	getChildNodes(node: Node): Node[];
	getData(node: Attr | CharacterData): string;
	getFirstChild(node: Node): Node | null;
	getLastChild(node: Node): Node | null;
	getNextSibling(node: Node): Node | null;
	getParentNode(node: Node): Node | null;
	getPreviousSibling(node: Node): Node | null;
}
