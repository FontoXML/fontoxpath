import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe.skip('processing-instruction()', () => {
	it('allows processing instruction targets as literals', () => {
		const selector = parseSelector('self::processing-instruction("someTarget")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without a target', () => {
		const selector = parseSelector('self::processing-instruction()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('allows processing instruction targets as NCNames', () => {
		const selector = parseSelector('self::processing-instruction(someTarget)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without an axis, without a target', () => {
		const selector = parseSelector('processing-instruction()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without an axis, with a target NCName', () => {
		const selector = parseSelector('processing-instruction(someTarget)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without an axis, with a target literal string', () => {
		const selector = parseSelector('processing-instruction("someTarget")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});
});
