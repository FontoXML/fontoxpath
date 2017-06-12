/**
 * @typedef {./dataTypes/Sequence}
 */
let Sequence;

/**
 * All possible permutations
 * @typedef {!{contextItemIndex: !number, contextSequence: ?Sequence}|{variables: Object}}|{contextItemIndex: number, contextSequence: !Sequence, variables: !Object}}
 */
let ScopingType;

class DynamicContext {
	/**
	 * @param  {{contextItem: ?./dataTypes/Value, contextItemIndex: number, contextSequence: !Sequence, domFacade: ?IDomFacade, variables: !Object}}  context  The context to overlay
	 */
	constructor (context) {
		/**
		 * @type {!number}
		 * @const
		 */
		this.contextItemIndex = context.contextItemIndex;

		/**
		 * @type {!Sequence}
		 * @const
		 */
		this.contextSequence = context.contextSequence;

		/**
		 * @type {?./dataTypes/Value}
		 * @const
		 */
		this.contextItem = context.contextItem;

		/**
		 * @type {?IDomFacade}
		 * @const
		 */
		this.domFacade = context.domFacade;

		/**
		 * @type {!Object}
		 * @const
		 */
		this.variables = context.variables;
	}

	/**
	 * @param   {!Object<string, !./dataTypes/Sequence>}    variables
	 * @return  {!DynamicContext}
	 */
	scopeWithVariables (variables) {
		return new DynamicContext({
			contextItemIndex: this.contextItemIndex,
			contextItem: this.contextItem,
			contextSequence: this.contextSequence,

			domFacade: this.domFacade,
			variables: Object.assign({}, this.variables, variables)
		});
	}

	/**
	 * @param   {number}             contextItemIndex
	 * @param   {./dataTypes/Value}  contextItem
	 * @param   {Sequence}           [contextSequence]
	 * @return  {!DynamicContext}
	 */
	scopeWithFocus (contextItemIndex, contextItem, contextSequence) {
		return new DynamicContext({
			contextItemIndex: contextItemIndex,
			contextItem: contextItem,
			contextSequence: contextSequence || this.contextSequence,

			domFacade: this.domFacade,
			variables: this.variables
		});
	}

	/**
	 * @param   {!./dataTypes/Sequence}  contextSequence
	 * @return  {!Iterator<!DynamicContext>}
	 */
	createSequenceIterator (contextSequence) {
		let i = 0;
		/**
		 * @type {!Iterator<!./dataTypes/Value>}
		 */
		const iterator = contextSequence.value();
		return /** @type {!Iterator<!DynamicContext>}*/ ({
			next: () => {
				const value = iterator.next();
				if (value.done) {
					return value;
				}
				return {
					done: false,
					value: this.scopeWithFocus( i++, value.value, contextSequence)
				};
			}
		});
	}
}

export default DynamicContext;
