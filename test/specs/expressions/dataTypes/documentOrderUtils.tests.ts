import * as chai from 'chai';
import { mergeSort } from 'fontoxpath/expressions/dataTypes/documentOrderUtils';

describe('Merge sort', () => {
	describe('Default comparison', () => {
		it('Orders numbers numerically', () => {
			chai.expect(mergeSort([3, 6, 5])).to.have.ordered.members([3, 5, 6]);
		});

		it('Orders strings alphabetically', () => {
			chai.expect(mergeSort(['c', 'a', 'b'])).to.have.ordered.members(['a', 'b', 'c']);
		});
	});

	describe('Custom comparison', () => {
		it('Orders based on the custom comparator', () => {
			const reverseOrderComparator = (value1, value2) => (value1 < value2 ? 0 : -1);
			chai.expect(mergeSort([3, 6, 5], reverseOrderComparator)).to.have.ordered.members([
				6, 5, 3,
			]);
		}),
			it('Orders based on any value less than 0', () => {
				const reverseOrderComparator = (value1, value2) => (value1 < value2 ? 0 : -5);
				chai.expect(mergeSort([3, 6, 5], reverseOrderComparator)).to.have.ordered.members([
					6, 5, 3,
				]);
			});

		it('Reverses the array if the comparer does not return less than 0', () => {
			const reverseComparator = () => 0;
			chai.expect(mergeSort([3, 6, 5], reverseComparator)).to.have.ordered.members([5, 6, 3]);
		});
	});
});
