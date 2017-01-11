import DomFacade from '../DomFacade';
import Item from './dataTypes/Item';
import Sequence from './dataTypes/Sequence';

/**
 * All possible permutations
 * @typedef {DynamicContext|{contextItem:Sequence, contextSequence: Sequence}|{contextItem:Sequence}|{contextSequence:Sequence}|{domFacade:!DomFacade}|{variables:Object}}|{contextItem: Sequence, contextSequence: Sequence, domFacade: !DomFacade, variables: Object}|{contextItem: !Sequence, domFacade: !DomFacade, variables: !Object}}
 */
var ScopingType;

class DynamicContext {
	/**
	 * @param  {DynamicContext|{contextItem: ?Sequence, contextSequence: ?Sequence, domFacade: !DomFacade, variables: !Object}}  context  The context to overlay
	 */
	constructor (context) {
		/**
		 * @type {?Sequence}
		 */
		this.contextItem = context.contextItem;
		/**
		 * @type {?Sequence}
		 */
		this.contextSequence = context.contextSequence;
		/**
		 * @type {!DomFacade}
		 */
		this.domFacade = context.domFacade;

		/**
		 * @type {!Object}
		 */
		this.variables = context.variables;
	}

	/**
	 * @param   {!ScopingType}  overlayContext
	 * @return  {!DynamicContext}
	 */
	createScopedContext (overlayContext) {
		return new DynamicContext({
			contextItem: overlayContext.contextItem ? overlayContext.contextItem : this.contextItem,
			contextSequence: overlayContext.contextSequence ? overlayContext.contextSequence : this.contextSequence,
			domFacade: overlayContext.domFacade ? overlayContext.domFacade : this.domFacade,
			variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables
		});
	}
}

export default DynamicContext;
