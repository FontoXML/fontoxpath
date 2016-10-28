import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

describe('createSelectorFromXPath', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('matches hovercrafts full of eels', () => {
		jsonMLMapper.parse([
			'hovercraft',
			['eel'],
			['eel']
		], documentNode);
		chai.expect(evaluateXPath('self::hovercraft[eel and not(*[not(self::eel)])]', documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
	});
});
