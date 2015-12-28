// Require.js config
require.config({
	"baseUrl": "/test",

	"packages": [
		{
			"name": "fontoxml-selectors",
			"location": "../src"
		},
		{
			"name": "fontoxml-blueprints",
			"location": "../lib/fontoxml-blueprints/src"
		},
		{
			"name": "fontoxml-dom-identification",
			"location": "../lib/fontoxml-dom-identification/src"
		},
		{
			"name": "fontoxml-dom-utils",
			"location": "../lib/fontoxml-dom-utils/src"
		},
		{
			"name": "slimdom",
			"location": "../lib/fontoxml-vendor-slimdom/src"
		}
	],

	"shim": {

	}
});
