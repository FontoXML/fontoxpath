import * as fontoxpath from '../src/index';
import * as buffer from 'buffer';
import * as xmljs from 'xml-js';

// https://stackoverflow.com/a/59621673/433626
window.Buffer = buffer.Buffer;

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
	, game = (level, load_xq, events) => {
		addEventListener("DOMContentLoaded", (e) => {
			const
			ns_xqib = 'http://mansoft.nl/xqib'
			, URI_BY_PREFIX = { b: ns_xqib }
			, req = new XMLHttpRequest()
			, reqListener = (e) => {
				const level = e.target.responseXML;
				fontoxpath.evaluateUpdatingExpression(
					load_xq
					, document.documentElement
					, null
					, { leveldoc: level.documentElement }
					, { language: fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE }
				)
				.then(result => {
					fontoxpath.executePendingUpdateList(result.pendingUpdateList);
/*		
					const compiledXQuery = fontoxpath.compileXPathToJavaScript(
						, click_xq
						, fontoxpath.evaluateXPath.ANY
						,
						{
							language: fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE,
							namespaceResolver: (prefix) => URI_BY_PREFIX[prefix]
						}
					);
*/		
					for (const [key, value] of Object.entries(events)) {
						console.log(`${key}: ${value}`);
						document.documentElement.addEventListener(key, (e) => {
							const evt = (new DOMParser).parseFromString("<event>" + xmljs.json2xml(stringify_object(e), {compact: true}) + "</event>", "application/xml");
							console.log(evt.documentElement);
							fontoxpath.evaluateUpdatingExpression(
								value
								, e.target
								, null
								,
								{
									leveldoc: level.documentElement,
									event: evt.documentElement
								}
								,
								{
									language: fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE,
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

			req.addEventListener("load", reqListener);
			req.open("GET", level);
			req.send();
		}, false);
	}
	;
	