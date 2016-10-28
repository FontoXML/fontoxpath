import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('NodeTypeSelector', () => {
	it('can select any element -> element()', () => {
		const selector = parseSelector('self::element()');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
	});

	it('can select any text node -> text()', () => {
		const selector = parseSelector('self::text()');
		jsonMLMapper.parse([
			'someOtherParentElement',
			'Some text'
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
	});

	it('can select any PI -> processing-instruction()', () => {
		const selector = parseSelector('self::processing-instruction()');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['?someElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
	});

	it('can select any comment -> comment()', () => {
		const selector = parseSelector('self::comment()');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['!', 'some comment']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
	});
});
