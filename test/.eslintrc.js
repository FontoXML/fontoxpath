module.exports = {
	"extends": ['../.eslintrc.js'],
	"parserOptions": {
        "project": ["test/tsconfig.json"],
        "sourceType": "module"
    },
	"rules": {
		"no-new-func": "off",
		"@typescript-eslint/no-empty-function": "off",
		"no-console": "off",
		"@typescript-eslint/ban-types": "off",
		"import/no-extraneous-dependencies": "off"
	}
};
