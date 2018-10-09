/**
 * @typedef {Array<string|Object|Array>} AST
 */
let AST;

/**
 * @typedef {{type: string, occurrence: string}} TypeDeclaration
 */
let TypeDeclaration;

/**
 * Get the all children with the given name. Automatically skips attributes
 *
 * @param   {!AST}    ast   The parent
 * @param   {string}  name  The name of the children, without any prefixes
 *
 * @return  {Array<AST>}  The matching children
 */
function getChildren (ast, name) {
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
 * @param   {!AST}                  ast   The parent
 * @param   {string|Array<string>}  name  The name of the child, without any prefixes. Array for "or"
 *
 * @return  {?AST}  The matching child, or null
 */
function getFirstChild (ast, name) {
	if (name !== '*' && !Array.isArray(name)) {
		name = [name];
	}
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (name === '*' || name.includes(ast[i][0])) {
			return ast[i];
		}
	}
	return null;
}

/**
 * Get the textContent of the given ast node (assuming its type is simpleContent)
 *
 * @param   {!AST}    ast  The parent
 * @return  {string}  The string content
 */
function getTextContent (ast) {
	if (ast.length < 2) {
		return '';
	}
	if (typeof ast[1] === 'object') {
		return ast[2];
	}
	return ast[1];
}

/**
 * Get the type declaration described in the given ast node
 *
 * @param   {!AST}    ast  The parent
 * @return  {TypeDeclaration}  The type declaration
 */
function getTypeDeclaration (ast) {
	const typeDeclarationAst = getFirstChild(ast, 'typeDeclaration');
	if (!typeDeclarationAst || getFirstChild(typeDeclarationAst, 'voidSequenceType')) {
		return null;
	}

	const determineType = (typeAst) => {
		const typeDeclaration = getFirstChild(typeAst, '*');
		switch (typeDeclaration[0]) {
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
				return 'function(*)';
			case 'anyMapTest':
			case 'typedMapTest':
				return 'map(*)';
			case 'anyArrayTest':
			case 'typedArrayTest':
				return 'array(*)';
			case 'atomicType':
				return [getAttribute(typeDeclaration, 'prefix'), getTextContent(typeDeclaration)].join(':');
			case 'parenthesizedItemType':
				return determineType(getFirstChild(typeDeclaration, 'sequenceType'));
			case 'schemaElementTest':
			case 'schemaAttributeTest':
			case 'namespaceNodeTest':
			default:
				throw new Error(`Type declaration "${getFirstChild(typeDeclarationAst, '*')[0]}" is not supported.`);
		}
	};

	const type = determineType(typeDeclarationAst);

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
 *
 * @param   {!AST}            ast
 * @param   {!Array<string>}  path
 *
 * @return  {?AST}
 */
function followPath (ast, path) {
	return path.reduce(getFirstChild, ast);
}

/**
 * Get the value of the given attribute
 *
 * @param  {!AST}    ast
 * @param  {string}  name
 *
 * @return {atring|null}
 */
function getAttribute (ast, attributeName) {
	if (!Array.isArray(ast)) {
		return null;
	}
	const attrs = ast[1];
	if (typeof attrs !== 'object' || Array.isArray(attrs)) {
		return null;
	}

	return attrs[attributeName] || null;
}

/**
 * Get the parts of a QName
 *
 * @param  {!AST}  ast
 *
 * @return {{prefix: ?string, namespaceURI: ?string, localName: string}}
 */
function getQName (ast) {
	return {
		prefix: getAttribute(ast, 'prefix'),
		namespaceURI: getAttribute(ast, 'URI'),
		localName: getTextContent(ast)
	};
}

export default {
	followPath: followPath,
	getChildren, getChildren,
	getFirstChild: getFirstChild,
	getTextContent: getTextContent,
	getTypeDeclaration: getTypeDeclaration,
	getAttribute: getAttribute,
	getQName: getQName
};
