import * as fontoxpath from '../src/index';
import * as buffer from 'buffer';
import * as xmljs from 'xml-js';

// https://stackoverflow.com/a/59621673/433626
window.Buffer = buffer.Buffer;

function BufferLoader(sounds) {
    if (sounds.length > 0) {
        var audioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new audioContext;
        this.sounds = sounds;
        for (var i = 0; i < sounds.length; ++i)
            this.loadBuffer(sounds[i].href, i);
    }
	return this;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
                request.response,
                function(buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.sounds[loader.sounds[index].name] = buffer;
                }
        );
    };

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    };

    request.send();
};

BufferLoader.prototype.playSound = function(name) {
	const bs = this.context.createBufferSource();
	bs.buffer = this.sounds[name];
	bs.connect(this.context.destination);
	bs.start();
};

let webaudios;

export const
	getQueryVariable = (variable, defval) => {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) == variable) {
				return decodeURIComponent(pair[1]);
			}
		}
		return decodeURIComponent(defval);
	}
	// https://stackoverflow.com/a/58416333/433626
	, stringify_object = (object, depth=0, max_depth=2) => {
		// change max_depth to see more levels, for a touch event, 2 is good
		if (depth > max_depth)
			return 'Object';

		const obj = {};
		for (let key in object) {
			let value = object[key];
			if (value instanceof Node) {
				// specify which properties you want to see from the node
				//value = {id: value.id};
			} else if (value instanceof Window) {
				//value = 'Window';
			} else if (value instanceof Function) {
				//value = 'Function';
			} else if (value instanceof Object) {
				value = stringify_object(value, depth+1, max_depth);
				obj[key] = value;
			} else {
				obj[key] = value;
			}
		}
		return depth ? obj: JSON.stringify(obj);
	}
	, load_sounds = (sounds) => {
		webaudios = new BufferLoader(sounds)
	}
	, play_sound = (name) => {
		webaudios.playSound(name);
	}	
	, game = (level, levelnr, load_xq, events) => {
		addEventListener("DOMContentLoaded", (e) => {
			const
			ns_xqib = 'http://mansoft.nl/xqib'
			, URI_BY_PREFIX = {
				 b: ns_xqib
			}
			, req = new XMLHttpRequest()
			, reqListener = (e) => {
				const leveldoc = e.target.responseXML;
				fontoxpath.evaluateUpdatingExpression(
					load_xq
					, document
					, null
					, {
						webdoc: document,
						leveldoc: leveldoc,
						levelnr: levelnr
					}
					,
					{
						namespaceResolver: (prefix) => URI_BY_PREFIX[prefix]
					}
				)
				.then(result => {
					fontoxpath.executePendingUpdateList(result.pendingUpdateList);
					const xqueryx = {};
					for (const [key, value] of Object.entries(events)) {
						console.log(`${key}: ${value}`);
						xqueryx[key] = fontoxpath.parseScript(
							value,
							{
								language: fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE,
							},
							document
						);
						document.documentElement.addEventListener(key, (e) => {
							const evt = (new DOMParser).parseFromString("<event>" + xmljs.json2xml(stringify_object(e), {compact: true}) + "</event>", "application/xml");
							console.log(evt.documentElement);
							fontoxpath.evaluateUpdatingExpression(
								xqueryx[e.type]
								, e.target
								, null
								,
								{
									webdoc: document,
									leveldoc: leveldoc,
									event: evt.documentElement
								}
								,
								{
									namespaceResolver: (prefix) => URI_BY_PREFIX[prefix]
								}
							)
							.then(result => {
								fontoxpath.executePendingUpdateList(result.pendingUpdateList);
							});
						}, false);
					}
				});
			}	
			;
			
			// Register a function called 'alert' in the 'b' namespace:
			fontoxpath.registerCustomXPathFunction({namespaceURI: ns_xqib, localName: 'alert'}, ['xs:string'], 'xs:string', (_, str) => { alert(str); return str });
			fontoxpath.registerCustomXPathFunction({namespaceURI: ns_xqib, localName: 'play-sound'}, ['xs:string'], 'xs:string', (_, sound) => { play_sound(sound); return sound });

			req.addEventListener("load", reqListener);
			req.open("GET", level);
			req.send();
		}, false);
	}
	;

