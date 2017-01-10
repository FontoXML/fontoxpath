import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

describe('createSelectorFromXPath', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('matches hovercrafts full of eels', () => {
		jsonMlMapper.parse([
			'hovercraft',
			['eel'],
			['eel']
		], documentNode);
		chai.expect(evaluateXPathToNodes('self::hovercraft[eel and not(*[not(self::eel)])]', documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement]);
	});
});
