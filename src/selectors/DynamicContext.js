/**
 * @typedef {./dataTypes/Sequence}
 */
let Sequence;

/**
 * All possible permutations
 * @typedef {!{contextItemIndex: !number, contextSequence: !Sequence}|{variables: Object}}|{contextItemIndex: number, contextSequence: !Sequence, domFacade: !IDomFacade, variables: !Object}}
 */
let ScopingType;

class Cache {
	constructor () {
		this._cache = Object.create(null);
	}
	withCache (dynamicContext, selectorString, computeFn) {
		const key = dynamicContext + '~' + selectorString;
		let entry = this._cache[key];
		if (!entry) {
			console.log('cache miss', this._cache);
			entry = this._cache[key] = computeFn();

		} else {
			console.log('cache hit');
		}
		return entry;
	}
}

const cache = new Cache();

class DynamicContext {
	/**
	 * @param  {{contextItemIndex: ?number, contextSequence: ?Sequence, domFacade: !IDomFacade, variables: !Object}}  context  The context to overlay
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

		this.cache = cache;
	}

	toString () {
		const variables = `(variables ${Object.keys(this.variables).map(varKey => `(var ${varKey} ${this.variables[varKey].toString()})`)})`;
		return `(dynamicContext ${this.contextSequence.toString()} ${this.contextItemIndex} ${variables})`;
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
			variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables
		});
	}
}

export default DynamicContext;
