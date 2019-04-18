/**
 * @public
 */
import {
	Attr,
	CDATASection,
	Comment,
	Document,
	Element,
	ProcessingInstruction,
	Text
} from '../types/Types';

export default interface INodesFactory {
	createAttributeNS(namespaceURI: string, name: string): Attr;

	createCDATASection(contents: string): CDATASection;

	createComment(contents: string): Comment;

	createDocument(): Document;

	createElementNS(namespaceURI: string, name: string): Element;

	createProcessingInstruction(target: string, data: string): ProcessingInstruction;

	createTextNode(contents: string): Text;
}
