import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe.skip('NodeTypeSelector', () => {
	it('can select any element -> element()', () => {
		const selector = ('self::element()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('can select any text node -> text()', () => {
		const selector = ('self::text()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			'Some text'
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('can select any PI -> processing-instruction()', () => {
		const selector = ('self::processing-instruction()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('can select any comment -> comment()', () => {
		const selector = ('self::comment()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['!', 'some comment']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});
});
