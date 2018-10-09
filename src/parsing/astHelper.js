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
	return ast[1] || '';
}

function followPath (ast, path) {
	return path.reduce(getFirstChild, ast);
}

export default {
	getChildren: getChildren,
	getFirstChild: getFirstChild,
	getTextContent: getTextContent,
	followPath: followPath
};
