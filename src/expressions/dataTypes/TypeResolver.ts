import { Node } from '../../types/Types';

declare type TypeResolver = (node: Node) => { namespaceURI: string; localName: string };

export default TypeResolver;
