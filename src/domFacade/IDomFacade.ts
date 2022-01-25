import { Bucket } from '../expressions/util/Bucket';
import { Attr, CharacterData, Element, Node } from '../types/Types';

/**
 * The base interface of a dom facade
 *
 * @public
 */
export default interface IDomFacade {
	/**
	 * Get all attributes of this element.
	 * The bucket can be used to narrow down which attributes should be retrieved.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the attribute that will be used.
	 */
	getAllAttributes(node: Element, bucket?: Bucket | null): Attr[];

	/**
	 * Get the value of specified attribute of this element.
	 *
	 * @param  node -
	 * @param  attributeName -
	 */
	getAttribute(node: Element, attributeName: string): string | null;

	/**
	 * Get all child nodes of this element.
	 * The bucket can be used to narrow down which child nodes should be retrieved.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the attribute that will be used.
	 */
	getChildNodes(node: Node, bucket?: Bucket | null): Node[];

	/**
	 * Get the data of this element.
	 *
	 * @param  node -
	 */
	getData(node: Attr | CharacterData): string;

	/**
	 * Get the first child of this element.
	 * An implementation of IDomFacade is free to interpret the bucket to skip returning nodes that do not match the bucket, or use this information to its advantage.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the attribute that will be used.
	 */
	getFirstChild(node: Node, bucket?: Bucket | null): Node | null;

	/**
	 * Get the last child of this element.
	 * An implementation of IDomFacade is free to interpret the bucket to skip returning nodes that do not match the bucket, or use this information to its advantage.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the attribute that will be used.
	 */
	getLastChild(node: Node, bucket?: Bucket | null): Node | null;

	/**
	 * Get the next sibling of this node
	 * An implementation of IDomFacade is free to interpret the bucket to skip returning nodes that do not match the bucket, or use this information to its advantage.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the nextSibling that is requested.
	 */
	getNextSibling(node: Node, bucket?: Bucket | null): Node | null;

	/**
	 * Get the parent of this element.
	 * An implementation of IDomFacade is free to interpret the bucket to skip returning nodes that do not match the bucket, or use this information to its advantage.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the attribute that will be used.
	 */
	getParentNode(node: Node, bucket?: Bucket | null): Node | null;

	/**
	 * Get the previous sibling of this element.
	 * An implementation of IDomFacade is free to interpret the bucket to skip returning nodes that do not match the bucket, or use this information to its advantage.
	 *
	 * @param  node -
	 * @param  bucket - The bucket that matches the attribute that will be used.
	 */
	getPreviousSibling(node: Node, bucket?: Bucket | null): Node | null;
}
