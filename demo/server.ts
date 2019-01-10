import * as staticAlias from 'node-static';
import { IncomingMessage, ServerResponse } from 'http';

const builtFileServer = new staticAlias.Server('./demo/built');
const demoFileServer = new staticAlias.Server('./demo');
const distFileServer = new staticAlias.Server('./dist');

require('http').createServer(function (request: IncomingMessage, response: ServerResponse) {
	request.addListener('end', function () {
		//
		// Serve files!
		//
		if (request.url.startsWith('/src')) {
			request.url += '.js';
			builtFileServer.serve(request, response);
			return;
		}
		if (request.url.startsWith('/dist')) {
			distFileServer.serve(request, response);
			return;
		}
		if (request.url === '/main.js') {
			request.url = `/built/demo${request.url}`;
		} else if (request.url === '/parseAst') {
			request.url = `/built/demo${request.url}.js`;
		}

		console.log(request.url);
		demoFileServer.serve(request, response);
	}).resume();
}).listen(8080);
