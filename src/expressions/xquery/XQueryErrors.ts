export const errXQTY0024 = function(node) {
	const nodeString =
		node.nodeType === node.ATTRIBUTE_NODE ? `${node.name}="${node.value}"` : node.outerHTML;
	return new Error(
		`XQTY0024: The node ${nodeString} follows a node that is not an attribute node or a namespace node.`
	);
};
export const errXQDY0025 = attributeName =>
	new Error(
		`XQDY0025: The attribute ${attributeName} does not have an unique name in the constructed element.`
	);
export const errXQDY0026 = content =>
	new Error(
		`XQDY0026: The content "${content}" for a processing instruction node contains "?>".`
	);
export const errXQST0040 = attributeName =>
	new Error(
		`XQST0040: The attribute ${attributeName} does not have an unique name in the constructed element.`
	);
export const errXQDY0041 = name =>
	new Error(
		`XQDY0041: The value "${name}" of a name expressions cannot be converted to a NCName.`
	);
export const errXQDY0044 = qName =>
	new Error(
		`XQDY0044: The node name "${qName.buildPrefixedName()}" is invalid for a computed attribute constructor.`
	);
export const errXQST0060 = () =>
	new Error('XQST0060: Functions declared in a module must reside in a namespace.');
export const errXQST0066 = () =>
	new Error('XQST0066: A Prolog may contain at most one default function namespace declaration.');
export const errXQST0070 = () =>
	new Error(
		'XQST0070: The prefixes xml and xmlns may not be used in a namespace declaration or be bound to another namespaceURI.'
	);
export const errXQDY0072 = content =>
	new Error(
		`XQDY0072: The content "${content}" for a comment node contains two adjacent hyphens or ends with a hyphen.`
	);
export const errXQDY0074 = name =>
	new Error(
		`XQDY0074: The value "${name}" of a name expressions cannot be converted to an expanded QName.`
	);
export const errXQDY0096 = qName =>
	new Error(
		`XQDY0096: The node name "${qName.buildPrefixedName()}" is invalid for a computed element constructor.`
	);
