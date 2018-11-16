import XPATHPARSER_VERSION from './XPATHPARSER_VERSION';
import xPathParserRaw from './xPathParser.raw';
import compileAstToExpression from './compileAstToExpression';
import parseExpression from './parseExpression';

import astHelper from './astHelper';

function supportsAsyncCompilation () {
	// For async compilation, we'll need at least webworkers, Blop and URL.
	// For the extra storage, we'll need indexedDB. These are all not available on Node.JS, and on some older browsers
	return typeof indexedDB !== 'undefined' &&
		typeof Blob !== 'undefined' &&
		typeof Worker !== 'undefined' &&
		typeof URL !== 'undefined';
}

let createExpressionFromXPathAsync;

if (supportsAsyncCompilation()) {
	// We can compile asynchronously, set up a connection to the database as eager as possible
	const SELECTOR_STORE_NAME = 'fontoxpath';
	const SELECTOR_INDEXED_DB_NAME = 'fontoxpath-cache';


	// Webworkers need a function string
	const compileFunction = [
		xPathParserRaw(),
		'',
		'self.onmessage = function (event) {',
		'	var ast;',
		'	try {',
		'		// We are not interested in parsing XQuery async (yet)',
		'		ast = self.xPathParser.parse(event.data.xPath);',
		'	} catch (error) {',
		'		self.postMessage({',
		'			success: false,',
		'			key: event.data.key,',
		'			error: error.message',
		'		});',
		'		return;',
		'	}',

		'	self.postMessage({',
		'		success: true,',
		'		key: event.data.key,',
		'		ast: ast',
		'	});',
		'}'
	].join('\n');


	const blob = new Blob([compileFunction]);
	const worker = new Worker(URL.createObjectURL(blob));

	/**
	 * @type {Object<string, function({success:boolean, ast:?Array<*>, error:Error})>}
	 */
	const waitingTaskCallbackByTaskKey = Object.create(null);

	worker.onmessage = function (/** @type {MessageEvent} */ event) {
		waitingTaskCallbackByTaskKey[event.data['key']](event.data);
	};

	worker.onerror = function (/** @type {Event} */ event) {
		console.error(event);
	};

	function recreateDatabase (database) {
		if (database.objectStoreNames.contains(SELECTOR_STORE_NAME)) {
			database.deleteObjectStore(SELECTOR_STORE_NAME);
		}
		database.createObjectStore(
			SELECTOR_STORE_NAME, {
				keyPath: 'xPath',
				autoIncrement: false
			});
	}

	const databaseLoadingDone = () => new Promise(function (resolve, reject) {
			const databaseCreateRequest = indexedDB.open(SELECTOR_INDEXED_DB_NAME, XPATHPARSER_VERSION);
			databaseCreateRequest.onsuccess = function () {
				const db = databaseCreateRequest.result;
				resolve(db);
			};

			databaseCreateRequest.onerror = function (evt) {
				// event.error can not be used, as well as error.code.
				if (databaseCreateRequest['error']['name'] === 'VersionError') {
					evt.preventDefault();
					console.warn('Expression persisting cache downgrade needed. Recreating database.', databaseCreateRequest['error']);
					const deleteDatabaseRequest = indexedDB.deleteDatabase(SELECTOR_INDEXED_DB_NAME);
					deleteDatabaseRequest.onsuccess = function () {
						// Re-open database, do not retry if errors
						const secondAttemptCreateRequest = indexedDB.open(SELECTOR_INDEXED_DB_NAME, XPATHPARSER_VERSION);
						secondAttemptCreateRequest.onsuccess = function () {
							const db = secondAttemptCreateRequest['result'];
							resolve(db);
						};
						secondAttemptCreateRequest.onupgradeneeded = function () {
							return recreateDatabase(secondAttemptCreateRequest['result']);
						};
					};
					deleteDatabaseRequest.onerror = function () {
						reject(deleteDatabaseRequest['error']);
					};
					return;
				}

				reject(databaseCreateRequest['error']);
			};

			databaseCreateRequest.onupgradeneeded = function () {
				return recreateDatabase(databaseCreateRequest['result']);
			};
		});

	let saveTransactionTimeout = null;
	const pendingSaves = [];

	function queueSave (db, xPathString, ast) {
		if (!saveTransactionTimeout) {
			saveTransactionTimeout = setTimeout(function () {
				const objectStore = db.transaction(SELECTOR_STORE_NAME, 'readwrite').objectStore(SELECTOR_STORE_NAME);
				pendingSaves.forEach(function (callback) {
					callback(objectStore);
				});
				saveTransactionTimeout = null;
				pendingSaves.length = 0;
			}, 250);
		}

		return new Promise(function (resolve, reject) {
			pendingSaves.push(function (objectStore) {
				// The keys of the items in the object store must be retained
				const request = objectStore.add({
						'xPath': xPathString,
						'ast': ast
					});
				request.onsuccess = function () {
					resolve();
				};
				request.onerror = function () {
					reject();
				};
			});
		});
	}

	/**
	 * @return {Promise}
	 */
	function compileXPathAsync (db, xPathString) {
		return new Promise(function (resolve, reject) {
			waitingTaskCallbackByTaskKey[xPathString] = function (result) {
				// The result came from the worker, outside of the closure compiler
				delete waitingTaskCallbackByTaskKey[xPathString];

				if (!result['success']) {
					reject(new Error('Unable to parse XPath: ' + xPathString + '.\n' + result['error']));
					return;
				}
				queueSave(db, xPathString, result['ast'])
					.catch(function (error) {
						// Swallow errors, we have an AST, so not
						// being able to save it should only cost us
						// some load time performance for any next
						// loads.
						console.warn(error);
					})
					.then(function () {
						const ast = (/** @type {!Array<*>} */(result['ast']));
						const queryBody = (/** @type {!Array<*>} */(astHelper.followPath(
							ast,
							['mainModule', 'queryBody', '*']
						)));
						const selector = compileAstToExpression(queryBody, { allowXQuery: false, allowUpdating: false });
						resolve(selector);
					})
					.catch(reject);
			};

			worker.postMessage({
				'key': xPathString,
				'xPath': xPathString
			});
		});
	}

	const compileDonePromiseByXPathString = Object.create(null);

	/**
	 * Parse an XPath string to a selector.
	 * Only single step paths can be compiled
	 *
	 * @param  {string}  xPathString      The string to parse
	 */
	createExpressionFromXPathAsync = function createExpressionFromXPathAsync (xPathString) {
		if (compileDonePromiseByXPathString[xPathString]) {
			return compileDonePromiseByXPathString[xPathString];
		}
		compileDonePromiseByXPathString[xPathString] = databaseLoadingDone().then(
            function (db) {
                return new Promise(
                    function (resolve, reject) {
                        const objectStore = db.transaction(SELECTOR_STORE_NAME, 'readonly').objectStore(SELECTOR_STORE_NAME);
                        const request = objectStore.get(xPathString);
                        request.onsuccess = function (event) {
                            const xPathAndAst = request.result;
                            if (!xPathAndAst) {
                                // Not found, compile it.
                                compileXPathAsync(db, xPathString).then(resolve, reject);
                                return;
                            }
							const queryBody = /** @type {!Array} */ (astHelper.followPath(xPathAndAst['ast'], ['mainModule', 'queryBody', '*']));
                            resolve(compileAstToExpression(queryBody, { allowXQuery: false, allowUpdating: false }));
                        };

                        request.onerror = function event (evt) {
                            console.log('Error:', evt);
                            compileXPathAsync(db, xPathString).then(resolve, reject);
                        };
                    });
            });

		return compileDonePromiseByXPathString[xPathString];
	};
}
else {
	createExpressionFromXPathAsync = xPathString => new Promise(resolve => {
		const ast = parseExpression(xPathString, { allowXQuery: false });
		const queryBody = /** @type {!Array} */ (astHelper.followPath(ast, ['mainModule', 'queryBody', '*']));
		resolve(compileAstToExpression(queryBody, { allowXQuery: false, allowUpdating: false }));
	});
}

export default createExpressionFromXPathAsync;
