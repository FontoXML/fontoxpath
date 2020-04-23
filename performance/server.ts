import http, { IncomingMessage, ServerResponse } from 'http';
import * as staticAlias from 'node-static';

const builtFileServer = new staticAlias.Server('./performance/lib');
const performanceFileServer = new staticAlias.Server('./performance');
const rootFileServer = new staticAlias.Server('./');
const modulesFileServer = new staticAlias.Server('./node_modules');

http.createServer((request: IncomingMessage, response: ServerResponse) => {
	request
		.addListener('end', () => {
			//
			// Serve files!
			//
			if (request.url.startsWith('/test')) {
				console.log('Serving .' + request.url);
				rootFileServer.serve(request, response);
				return;
			}

			switch (request.url) {
				case '/fontoxpath-perf.js':
				case '/fontoxpath-perf.js.map':
					console.log('Serving ./performance/lib' + request.url);
					builtFileServer.serve(request, response);
					break;
				case '/lodash/lodash.js':
				case '/platform/platform.js':
				case '/benchmark/benchmark.js':
					console.log('Serving ./node_modules' + request.url);
					modulesFileServer.serve(request, response);
					break;
				default:
					console.log('Serving ./performance' + request.url);
					performanceFileServer.serve(request, response);
					break;
			}
		})
		.resume();
}).listen(8080);
console.log('Now listening on localhost:8080');
