import NodePredicateSelector from 'fontoxml-selectors/selectors/tests/NodePredicateSelector';

describe('NodePredicateSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const nodePredicateSelector1 = new NodePredicateSelector(() => {
				return;
			}),
			nodePredicateSelector2 = nodePredicateSelector1;
		chai.expect(nodePredicateSelector1.equals(nodePredicateSelector2)).to.equal(true);
		chai.expect(nodePredicateSelector2.equals(nodePredicateSelector1)).to.equal(true);
	});

	it.skip('it returns true if compared with an equal other NodePredicateSelector', () => {
		const nodePredicateSelector1 = new NodePredicateSelector(() => {
				return;
			}),
			nodePredicateSelector2 = new NodePredicateSelector(() => {
				return;
			});
		chai.expect(nodePredicateSelector1.equals(nodePredicateSelector2)).to.equal(true);
		chai.expect(nodePredicateSelector2.equals(nodePredicateSelector1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other NodePredicateSelector', () => {
		const nodePredicateSelector1 = new NodePredicateSelector(function(a, b) {
				return;
			}),
			nodePredicateSelector2 = new NodePredicateSelector(() => {
				return;
			});
		chai.expect(nodePredicateSelector1.equals(nodePredicateSelector2)).to.equal(false);
		chai.expect(nodePredicateSelector2.equals(nodePredicateSelector1)).to.equal(false);
	});
});
