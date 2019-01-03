import DynamicContext from './DynamicContext';
import SequenceFactory from './dataTypes/SequenceFactory';

/**
 * A focus-free context, which can be used to 'statically' evaluate certain expressions
* @extends {DynamicContext}
 */
export default class UnfocusableDynamicContext extends DynamicContext {
	constructor ({ variables = {} }) {
		super({
			contextItem: null,
			contextItemIndex: -1,
			contextSequence: SequenceFactory.empty(),
			variables: variables,
			domFacade: null,
			resolveNamespacePrefix: () => '',
			createExpressionFromXPath: () => {
				throw new Error('Statically evaluating inline expressions is not supported.');
			}
		});
	}
}
