/**
 * @typedef {Array<string|Object|Array>} AST
 */
let AST;

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
 * @param   {!AST}    ast   The parent
 * @param   {string}  name  The name of the child, without any prefixes
 *
 * @return  {?AST}  The matching child, or null
 */
function getFirstChild (ast, name) {
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (name === '*' || ast[i][0] === name) {
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

export default {
	followPath: followPath,
	getChildren, getChildren,
	getFirstChild: getFirstChild,
	getTextContent: getTextContent,
	getAttribute: getAttribute
};
