import * as chai from 'chai';
import { BaseType, evaluateXPathToString, registerCustomXPathFunction, SequenceType } from 'fontoxpath';
import { slimdom, sync } from 'slimdom-sax-parser';

describe('Browser tests', function () {
	describe('Custom functions union result order', function () {
		it('Returns the results in the same order across browsers', function () {
			const firstDocument = sync('<xml>1st Document</xml>');
			const secondDocument = sync('<xml>2nd Document</xml>');
			const thirdDocument = sync('<xml>3rd Document</xml>');

			registerCustomXPathFunction(
				'cf:firstDocument',
				[],
				{ kind: BaseType.ITEM, seqType: SequenceType.EXACTLY_ONE },
				() => {
					return firstDocument.documentElement;
				}
			);

			registerCustomXPathFunction(
				'cf:secondDocument',
				[],
				{ kind: BaseType.ITEM, seqType: SequenceType.EXACTLY_ONE },
				() => {
					return secondDocument.documentElement;
				}
			);

			registerCustomXPathFunction(
				'cf:thirdDocument',
				[],
				{ kind: BaseType.ITEM, seqType: SequenceType.EXACTLY_ONE },
				() => {
					return thirdDocument.documentElement;
				}
			);

			chai.assert.equal(
				evaluateXPathToString(
					'cf:firstDocument() | cf:secondDocument() | cf:thirdDocument()'
				),
				'1st Document 2nd Document 3rd Document'
			);
		});
	});
});
