import DynamicContext from 'fontoxpath/selectors/DynamicContext';
import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';

describe('DynamicContext scoping functions()', () => {
	it('copies the exising context', () => {
		const dynamicContext = new DynamicContext({
			contextItemIndex: 0,
			contextSequence: Sequence.singleton('contextSequence1'),
				domFacade: 'domFacade1',
				variables: {
					variable: 'variables1'
				}
			}),
			scopedContext = dynamicContext.scopeWithVariables({});

		chai.assert.deepEqual(scopedContext, scopedContext);
		chai.assert.isFalse(dynamicContext === scopedContext);
	});

	it('copies the exising context and replaces the given values', () => {
		const dynamicContext = new DynamicContext({
			contextItemIndex: 0,
			contextItem: 'contextSequence1',
			contextSequence: Sequence.singleton('contextSequence1'),
			domFacade: 'domFacade1',
			variables: {
				variable: 'variables1'
			}
		});
		const scopedContext = dynamicContext
			.scopeWithFocus(1, 'contextSequence2', Sequence.singleton('contextSequence2'))
			.scopeWithVariables({
				variable: 'variables2',
				extra: 'variable'
			});
		const expectedContext = new DynamicContext({
			contextItemIndex: 1,
			contextItem: scopedContext.contextItem,
			contextSequence: scopedContext.contextSequence,
			domFacade: 'domFacade1',
			variables: {
				variable: 'variables2',
				extra: 'variable'
			}
		});

		chai.assert.deepEqual(scopedContext, expectedContext);
		chai.assert.isFalse(dynamicContext === scopedContext);
	});
});
