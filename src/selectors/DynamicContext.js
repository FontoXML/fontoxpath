/**
 * @typedef {./dataTypes/Sequence}
 */
let Sequence;

/**
 * All possible permutations
 * @typedef {!DynamicContext|{contextItem:!Sequence, contextSequence: !Sequence}|{domFacade:!IDomFacade}|{variables:Object}}|{contextItem: !Sequence, contextSequence: !Sequence, domFacade: !IDomFacade, variables: !Object}}
 */
let ScopingType;

class DynamicContext {
	/**
	 * @param  {DynamicContext|{contextItem: ?Sequence, contextSequence: ?Sequence, domFacade: !IDomFacade, variables: !Object}}  context  The context to overlay
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
		 * @type {!IDomFacade}
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
