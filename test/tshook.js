const path = require('path');

function fromRoot (subdir) {
    return path.join(__dirname, '..', subdir);
}

require('ts-node').register({
    'compilerOptions': {
		baseUrl: fromRoot('.'),
		'paths': {
			'fontoxpath/*': [fromRoot('src')],
			'fontoxpath': [fromRoot('src/index.js')]
		},
        'allowJs': true,
		'lib': [
			'dom',
			'es6',
			'es2017',
			'esnext.asynciterable'
		],
        'target': 'es2017',
		'module': 'commonjs'
    }
});
