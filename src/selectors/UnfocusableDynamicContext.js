import DynamicContext from './DynamicContext';
import Sequence from './dataTypes/Sequence';

/**
 * A focus-free context, which can be used to 'statically' evaluate certain expressions
* @extends {DynamicContext}
 */
export default class UnfocusableDynamicContext extends DynamicContext {
	constructor ({ variables = {} }) {
		super({
			contextItem: null,
			contextItemIndex: -1,
			contextSequence: Sequence.empty(),
			variables: variables,
			domFacade: null
		});
	}

	createScopedContext (scope) {
		if (scope.contextItem) {
			throw new Error('Can not create a focus-free dynamic context setting context');
		}
		// Only allow overlaying variables
		return new UnfocusableDynamicContext({
			variables: scope.variables ? Object.assign({}, this.variables, scope.variables) : this.variables
		});
	}
}
