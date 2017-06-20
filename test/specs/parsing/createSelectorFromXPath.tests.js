import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

describe('createSelectorFromXPath', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('matches hovercrafts full of eels', () => {
		jsonMlMapper.parse([
			'hovercraft',
			['eel'],
			['eel']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('self::hovercraft[eel and not(*[not(self::eel)])]', documentNode.documentElement), [documentNode.documentElement]);
	});
});
