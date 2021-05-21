import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType, compileXPathToJavaScript, executeJavaScriptCompiledXPath } from 'fontoxpath';

function namespaceResolver(prefix: string) {
	if (prefix === 'as') {
		return 'http://example.com/as';
	}
	return '';
}


describe('operators', () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml'], documentNode);
	});
});
