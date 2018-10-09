
/**
 * Get the first child with the given name. Automatically skips attributes
 *
 * @param   {!Array<string|Object|Array>}  ast   The parent
 * @param   {string}                       name  The name of the child, without any prefixes
 *
 * @return  {?Array<string|Object|Array>}  The matching child, or null
 */
function getFirstChild (ast, name) {
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (ast[i][0] === name) {
			return ast[i];
		}
	}
	return null;
}

export default {
	getFirstChild: getFirstChild
};
