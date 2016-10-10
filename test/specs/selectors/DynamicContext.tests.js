define([
	'fontoxml-selectors/selectors/DynamicContext'
], function (
	DynamicContext
) {
	'use strict';

	describe('DynamicContext.createScopedContext()', function () {
		it('copies the exising context', function () {
			var dynamicContext = new DynamicContext({
					contextItem: 'contextItemValue1',
					contextSequence: 'contextSequence1',
					domFacade: 'domFacade1',
					variables: {
						variable: 'variables1'
					}
				}),
				scopedContext = dynamicContext.createScopedContext({});

			chai.expect(scopedContext).to.deep.equal(scopedContext);
			chai.expect(dynamicContext === scopedContext).to.equal(false);
		});

		it('copies the exising context and replaces the given values', function () {
			var dynamicContext = new DynamicContext({
					contextItem: 'contextItemValue1',
					contextSequence: 'contextSequence1',
					domFacade: 'domFacade1',
					variables: {
						variable: 'variables1'
					}
				}),
				scopedContext = dynamicContext.createScopedContext({
					contextItem: 'contextItemValue2',
					contextSequence: 'contextSequence2',
					domFacade: 'domFacade2',
					variables: {
						variable: 'variables2',
						extra: 'variable'
					}
				}),
				expectedContext = new DynamicContext({
					contextItem: 'contextItemValue2',
					contextSequence: 'contextSequence2',
					domFacade: 'domFacade2',
					variables: {
						variable: 'variables2',
						extra: 'variable'
					}
				});

			chai.expect(scopedContext).to.deep.equal(expectedContext);
			chai.expect(dynamicContext === scopedContext).to.equal(false);
		});
	});
});
