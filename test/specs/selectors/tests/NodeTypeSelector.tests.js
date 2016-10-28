import NodeTypeSelector from 'fontoxml-selectors/selectors/tests/NodeTypeSelector';

describe('NodeTypeSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const nodeTypeSelector1 = new NodeTypeSelector(1),
			nodeTypeSelector2 = nodeTypeSelector1;
		chai.expect(nodeTypeSelector1.equals(nodeTypeSelector2)).to.equal(true);
		chai.expect(nodeTypeSelector2.equals(nodeTypeSelector1)).to.equal(true);
	});

	it('it returns true if compared with an equal other NodeTypeSelector', () => {
		const nodeTypeSelector1 = new NodeTypeSelector(1),
			nodeTypeSelector2 = new NodeTypeSelector(1);
		chai.expect(nodeTypeSelector1.equals(nodeTypeSelector2)).to.equal(true);
		chai.expect(nodeTypeSelector2.equals(nodeTypeSelector1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other NodeTypeSelector', () => {
		const nodeTypeSelector1 = new NodeTypeSelector(1),
			nodeTypeSelector2 = new NodeTypeSelector(2);
		chai.expect(nodeTypeSelector1.equals(nodeTypeSelector2)).to.equal(false);
		chai.expect(nodeTypeSelector2.equals(nodeTypeSelector1)).to.equal(false);
	});
});
