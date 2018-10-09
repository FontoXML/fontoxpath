export default {
	getFirstChild: (ast, name) => {
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
};
