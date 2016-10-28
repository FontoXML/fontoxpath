import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('or operator', () => {
	it('can parse an "or" selector', () => {
		const selector = parseSelector('false() or true()');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
	});

	it('can parse an "or" selector with different buckets', () => {
		const selector = parseSelector('self::someElement or self::processing-instruction()');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		chai.expect(selector.getBucket()).to.equal(null);
	});

	it('can parse a concatenation of ors', () => {
		const selector = parseSelector('false() or false() or false() or (: Note: the last true() will make te result true:) true()');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
	});

	it('allows not in combination with or', () => {
		const selector = parseSelector('someChildElement or not(someOtherChild)');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someOtherChildElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.equal(true);
	});
});
