import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Simple map operator', () => {
	it('accepts two single inputs: . ! name(.)', () => {
		const selector = parseSelector('. ! name(.)'),
		element = documentNode.createElement('someElement');
		chai.expect(
			evaluateXPath(selector, element, blueprint)
		).to.equal('someElement');
	});

	it('accepts a sequence as first expression: (1, 2, 3) ! string()', () => {
		const selector = parseSelector('(1, 2, 3) ! string()');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(['1', '2', '3']);
	});

	it('accepts a sequence as second expression: "abc" ! (concat("123", .), concat(., "123"))', () => {
		const selector = parseSelector('"abc" ! (concat("123", .), concat(., "123"))');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(['123abc', 'abc123']);
	});

	it('accepts a sequence as first and as second expression: ("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))', () => {
		const selector = parseSelector('("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(['a-a', 'b-a', 'c-a', 'a-b', 'b-b', 'c-b', 'a-c', 'b-c', 'c-c']);
	});

	it('accepts being stacked: . ! (@first, @second, @last) ! string(.)', () => {
		const selector = parseSelector('. ! (@first, @second, @last) ! string(.)'),
		element = documentNode.createElement('someElement');
		element.setAttribute('first', 'a');
		element.setAttribute('second', 'b');
		element.setAttribute('last', 'z');
		chai.expect(
			evaluateXPath(selector, element, blueprint)
		).to.deep.equal(['a', 'b', 'z']);
	});
});
