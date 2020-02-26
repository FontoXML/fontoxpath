import { Attr, CDATASection, Comment, Element, ProcessingInstruction, Text } from '../types/Types';

/**
 * Subset of the constructor methods present on Document. Can be used to create textnodes, elements,
 * attributes, CDataSecions, comments and processing instructions.
 *
 * @public
 */
export default interface ISimpleNodesFactory {
	createAttributeNS(namespaceURI: string, name: string): Attr;

	createCDATASection(contents: string): CDATASection;

	createComment(contents: string): Comment;

	createElementNS(namespaceURI: string, name: string): Element;

	createProcessingInstruction(target: string, data: string): ProcessingInstruction;

	createTextNode(contents: string): Text;
}
