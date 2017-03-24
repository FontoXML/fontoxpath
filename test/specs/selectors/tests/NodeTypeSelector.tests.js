import NodeTypeSelector from 'fontoxpath/selectors/tests/NodeTypeSelector';

describe('NodeTypeSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const nodeTypeSelector1 = new NodeTypeSelector(1),
			nodeTypeSelector2 = nodeTypeSelector1;
		chai.assert.isTrue(nodeTypeSelector1.equals(nodeTypeSelector2));
		chai.assert.isTrue(nodeTypeSelector2.equals(nodeTypeSelector1));
	});

	it('it returns true if compared with an equal other NodeTypeSelector', () => {
		const nodeTypeSelector1 = new NodeTypeSelector(1),
			nodeTypeSelector2 = new NodeTypeSelector(1);
		chai.assert.isTrue(nodeTypeSelector1.equals(nodeTypeSelector2));
		chai.assert.isTrue(nodeTypeSelector2.equals(nodeTypeSelector1));
	});

	it('it returns false if compared with an unequal other NodeTypeSelector', () => {
		const nodeTypeSelector1 = new NodeTypeSelector(1),
			nodeTypeSelector2 = new NodeTypeSelector(2);
		chai.assert.isFalse(nodeTypeSelector1.equals(nodeTypeSelector2));
		chai.assert.isFalse(nodeTypeSelector2.equals(nodeTypeSelector1));
	});
});
