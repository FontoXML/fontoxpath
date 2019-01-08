import TypeDeclaration from '../expressions/dataTypes/TypeDeclaration';

type QName = {prefix: string, namespaceURI: (string|null), localName: string};

export interface AST extends Array<(string|object|AST)> {
	0: string;
}


/**
 * Get the all children with the given name. Automatically skips attributes
 *
 * @param   ast   The parent
 * @param   name  The name of the children, without any prefixes
 *
 * @return  The matching children
 */
function getChildren (ast: AST, name: string): Array<AST> {
	const children = [];
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (name === '*' || ast[i][0] === name) {
			children.push(ast[i]);
		}
	}
	return children;
}

/**
 * Get the first child with the given name. Automatically skips attributes
 *
 * @param   ast   The parent
 * @param   name  The name of the child, without any prefixes. Array for "or"
 *
 * @return  The matching child, or null
 */
function getFirstChild (ast: AST, name: string | Array<string>): AST | null {
	if (name !== '*' && !Array.isArray(name)) {
		name = [name];
	}
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (name === '*' || name.includes(ast[i][0])) {
			return ast[i] as AST;
		}
	}
	return null;
}

/**
 * Get the textContent of the given ast node (assuming its type is simpleContent)
 *
 * @param   ast  The parent
 * @return  The string content
 */
function getTextContent(ast: AST): string {
	if (ast.length < 2) {
		return '';
	}
	if (typeof ast[1] === 'object') {
		return (ast[2] || '') as string;
	}
	return (ast[1] as string) || '';
}

/**
 * Get the type declaration described in the given ast node
 *
 * @param   ast  The parent
 * @return  The type declaration
 */
function getTypeDeclaration(ast: AST): TypeDeclaration {
	const typeDeclarationAst = getFirstChild(ast, 'typeDeclaration');
	if (!typeDeclarationAst || getFirstChild(typeDeclarationAst, 'voidSequenceType')) {
		return { type: 'item()', occurrence: '*' };
	}

	const determineType = (typeAst) => {
		switch (typeAst[0]) {
			case 'documentTest':
				return 'document()';
			case 'elementTest':
				return 'element()';
			case 'attributeTest':
				return 'attribute()';
			case 'piTest':
				return 'processing-instruction()';
			case 'commentTest':
				return 'comment()';
			case 'textTest':
				return 'text()';
			case 'anyKindTest':
				return 'node()';
			case 'anyItemType':
				return 'item()';
			case 'anyFunctionTest':
			case 'functionTest':
			case 'typedFunctionTest':
				return 'function(*)';
			case 'anyMapTest':
			case 'typedMapTest':
				return 'map(*)';
			case 'anyArrayTest':
			case 'typedArrayTest':
				return 'array(*)';
			case 'atomicType':
				return [getAttribute(typeAst, 'prefix'), getTextContent(typeAst)].join(':');
			case 'parenthesizedItemType':
				return determineType(getFirstChild(typeAst, '*'));
			case 'schemaElementTest':
			case 'schemaAttributeTest':
			case 'namespaceNodeTest':
			default:
				throw new Error(`Type declaration "${getFirstChild(typeDeclarationAst, '*')[0]}" is not supported.`);
		}
	};

	const type = determineType(getFirstChild(typeDeclarationAst, '*'));

	let occurrence = null;
	const occurrenceNode = getFirstChild(typeDeclarationAst, 'occurrenceIndicator');
	if (occurrenceNode) {
		occurrence = getTextContent(occurrenceNode);
	}

	return {
		type,
		occurrence
	};
}

/**
 * Follow a path to an AST node
 */
function followPath(ast: AST, path: Array<string>): AST | null {
	return path.reduce(getFirstChild, ast);
}

/**
 * Get the value of the given attribute
 */
function getAttribute(ast: AST, attributeName: string): string | null {
	if (!Array.isArray(ast)) {
		return null;
	}
	const attrs = ast[1];
	if (typeof attrs !== 'object' || Array.isArray(attrs)) {
		return null;
	}

	return attributeName in attrs ? attrs[attributeName] : null;
}

/**
 * Get the parts of a QName
 */
function getQName(ast: AST): QName {
	return {
		prefix: getAttribute(ast, 'prefix') || '',
		namespaceURI: getAttribute(ast, 'URI'),
		localName: getTextContent(ast)
	};
}

export default {
	followPath: followPath,
	getChildren: getChildren,
	getFirstChild: getFirstChild,
	getTextContent: getTextContent,
	getTypeDeclaration: getTypeDeclaration,
	getAttribute: getAttribute,
	getQName: getQName
};