import Cache from '../caching/Cache';
/**
 * @typedef {./dataTypes/Sequence}
 */
let Sequence;

/**
 * All possible permutations
 * @typedef {!{contextItemIndex: !number, contextSequence: !Sequence}|{variables: Object}}|{contextItemIndex: number, contextSequence: !Sequence, domFacade: !IDomFacade, variables: !Object}}
 */
let ScopingType;

class DynamicContext {
	/**
	 * @param  {{contextItemIndex: ?number, contextSequence: ?Sequence, domFacade: !IDomFacade, variables: !Object, cache: Cache}}  context  The context to overlay
	 */
	constructor (context) {
		/**
		 * @type {?number}
		 * @const
		 */
		this.contextItemIndex = context.contextItemIndex;

		/**
		 * @type {?Sequence}
		 * @const
		 */
		this.contextSequence = context.contextSequence;

		/**
		 * @type {?./dataTypes/Item}
		 * @const
		 */
		this.contextItem = this.contextSequence && this.contextSequence.value[this.contextItemIndex] || null;

		/**
		 * @type {!IDomFacade}
		 * @const
		 */
		this.domFacade = context.domFacade;

		/**
		 * @type {!Object}
		 * @const
		 */
		this.variables = context.variables;

		this.cache = context.cache;
	}

	toString () {
		const variables = `(variables ${Object.keys(this.variables).map(varKey => `(var ${varKey} ${this.variables[varKey].toString()})`)})`;
		return `(dynamicContext ${this.contextSequence.value.length} ${this.contextItemIndex} ${this.contextItem.toString()} ${variables})`;
	}

	/**
	 * @param   {!ScopingType}    overlayContext
	 * @return  {!DynamicContext}
	 */
	createScopedContext (overlayContext) {
		return new DynamicContext({
			contextItemIndex: overlayContext.contextItemIndex !== undefined ? overlayContext.contextItemIndex : this.contextItemIndex,
			contextSequence: overlayContext.contextSequence ? overlayContext.contextSequence : this.contextSequence,
			domFacade: overlayContext.domFacade ? overlayContext.domFacade : this.domFacade,
			variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables,
			cache: this.cache
		});
	}

	* createSequenceIterator (contextSequence) {
		const innerContext = this.createScopedContext({ contextSequence, contextItemIndex: 0 });
		for (let i = 0, l = contextSequence.value.length; i < l; ++i) {
			innerContext.contextItemIndex = i;
			innerContext.contextItem = innerContext.contextSequence.value[innerContext.contextItemIndex];
			yield innerContext;
		}
	}
}

export default DynamicContext;
