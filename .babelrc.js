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
			"module-resolver", {
			"alias": {
				"fontoxpath": process.argv.includes('--dist') ? "./dist/fontoxpath.js" : "./src/",
				"test-helpers": "./test/helpers/"
			}
			}
		]
	]
};
