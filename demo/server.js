const staticAlias = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var distFileServer = new staticAlias.Server('./dist');
var srcFileServer = new staticAlias.Server('./src');
var demoFileServer = new staticAlias.Server('./demo');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
		if (request.url.startsWith('/src')) {
			request.url = request.url.substring(4) + '.js';
			srcFileServer.serve(request, response);
			return;
		}
		if (request.url.startsWith('/dist')) {
			distFileServer.serve(request, response);
			return;
		}

		console.log(request.url);
		demoFileServer.serve(request, response);
    }).resume();
}).listen(8080);
