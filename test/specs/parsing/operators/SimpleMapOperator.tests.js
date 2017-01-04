import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToString, evaluateXPathToStrings } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Simple map operator', () => {
	it('accepts two single inputs: . ! name(.)', () => {

		const element = documentNode.createElement('someElement');
		chai.expect(
			evaluateXPathToString('. ! name(.)', element, domFacade)
		).to.equal('someElement');
	});

	it('accepts a sequence as first expression: (1, 2, 3) ! string()', () => {
		chai.expect(
			evaluateXPathToStrings('(1, 2, 3) ! string()', documentNode, domFacade)
		).to.deep.equal(['1', '2', '3']);
	});

	it('accepts a sequence as second expression: "abc" ! (concat("123", .), concat(., "123"))', () => {
		chai.expect(
			evaluateXPathToStrings('"abc" ! (concat("123", .), concat(., "123"))', documentNode, domFacade)
		).to.deep.equal(['123abc', 'abc123']);
	});

	it('accepts a sequence as first and as second expression: ("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))', () => {
		chai.expect(
			evaluateXPathToStrings('("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))', documentNode, domFacade)
		).to.deep.equal(['a-a', 'b-a', 'c-a', 'a-b', 'b-b', 'c-b', 'a-c', 'b-c', 'c-c']);
	});

	it('accepts being stacked: . ! (@first, @second, @last) ! string(.)', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('first', 'a');
		element.setAttribute('second', 'b');
		element.setAttribute('last', 'z');
		chai.expect(
			evaluateXPathToStrings('. ! (@first, @second, @last) ! string(.)', element, domFacade)
		).to.deep.equal(['a', 'b', 'z']);
	});
});
