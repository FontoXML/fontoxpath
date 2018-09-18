const fontoXPathAlias = process.argv.includes('--dist') ? "./dist/fontoxpath.js" : "./src/";

console.log(`Using ${fontoXPathAlias} as an alias for fontoxpath`);

module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"targets": {
					"node": "current"
				}
			}
		]
	],
	"plugins": [
		[
			"module-resolver",
			{
				"alias": {
					"fontoxpath": fontoXPathAlias,
					"test-helpers": "./test/helpers/"
				}
			}
		]
	]
};
