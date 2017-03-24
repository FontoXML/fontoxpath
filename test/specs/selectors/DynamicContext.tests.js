import DynamicContext from 'fontoxpath/selectors/DynamicContext';

describe('DynamicContext.createScopedContext()', () => {
	it('copies the exising context', () => {
		const dynamicContext = new DynamicContext({
				contextItem: 'contextItemValue1',
				contextSequence: 'contextSequence1',
				domFacade: 'domFacade1',
				variables: {
					variable: 'variables1'
				}
			}),
			scopedContext = dynamicContext.createScopedContext({});

		chai.assert.deepEqual(scopedContext, scopedContext);
		chai.assert.isFalse(dynamicContext === scopedContext);
	});

	it('copies the exising context and replaces the given values', () => {
		const dynamicContext = new DynamicContext({
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

		chai.assert.deepEqual(scopedContext, expectedContext);
		chai.assert.isFalse(dynamicContext === scopedContext);
	});
});
