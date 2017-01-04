import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToBoolean } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('or operator', () => {
	it('can parse an "or" selector', () => {
		const selector = ('false() or true()');
		chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
	});

	it('can parse an "or" selector with different buckets', () => {
		const selector = ('self::someElement or self::processing-instruction()');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('can parse a concatenation of ors', () => {
		const selector = ('false() or false() or false() or (: Note: the last true() will make te result true:) true()');
		chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
	});

	it('allows not in combination with or', () => {
		const selector = ('someChildElement or not(someOtherChild)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someOtherChildElement']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)).to.equal(true);
	});
});
