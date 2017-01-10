import slimdom from 'slimdom';

import NodeNameSelector from 'fontoxpath/selectors/tests/NodeNameSelector';
import { domFacade } from 'fontoxpath';

describe('NodeNameSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const nodeNameSelector1 = new NodeNameSelector('nodeName'),
			nodeNameSelector2 = nodeNameSelector1;
		chai.expect(nodeNameSelector1.equals(nodeNameSelector2)).to.equal(true);
		chai.expect(nodeNameSelector2.equals(nodeNameSelector1)).to.equal(true);
	});

	it('it returns true if compared with an equal other NodeNameSelector', () => {
		const nodeNameSelector1 = new NodeNameSelector('nodeName'),
			nodeNameSelector2 = new NodeNameSelector('nodeName');
		chai.expect(nodeNameSelector1.equals(nodeNameSelector2)).to.equal(true);
		chai.expect(nodeNameSelector2.equals(nodeNameSelector1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other NodeNameSelector', () => {
		const nodeNameSelector1 = new NodeNameSelector('nodeName1'),
			nodeNameSelector2 = new NodeNameSelector('nodeName2');
		chai.expect(nodeNameSelector1.equals(nodeNameSelector2)).to.equal(false);
		chai.expect(nodeNameSelector2.equals(nodeNameSelector1)).to.equal(false);
	});
});

describe('NodeNameSelector.getBucket()', () => {
	it('returns name-{{name}} when passed a nodeName', () => {
		chai.expect(new NodeNameSelector('someNode').getBucket()).to.equal('name-someNode');
	});

	it('returns type-1 when passed *', () => {
		chai.expect(new NodeNameSelector('*').getBucket()).to.equal('type-1');
	});
});

describe('NodeNameSelector.matches()', () => {
	let document;
	beforeEach(() => {
		document = slimdom.createDocument();
	});

	it('returns true if it uses wildcards', () => {
		const nodeNameSelector = new NodeNameSelector('*');
		chai.expect(nodeNameSelector.matches(document.createElement('someElement'), domFacade)).to.equal(true);
	});

	it('returns true if it uses an array of nodeNames', () => {
		const nodeNameSelector = new NodeNameSelector(['someOtherElement', 'someElement']);
		chai.expect(nodeNameSelector.matches(document.createElement('someElement'), domFacade)).to.equal(true);
	});
});
