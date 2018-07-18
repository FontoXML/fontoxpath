import { ready } from './util/iterators';
import DateTime from './dataTypes/valueTypes/DateTime';
import DayTimeDuration from './dataTypes/valueTypes/DayTimeDuration';

/**
 * @typedef {./dataTypes/Sequence}
 */
let Sequence;

/**
 * @typedef {!{isInitialized: boolean, currentDateTime: ?DateTime, implicitTimezone: ?DayTimeDuration}}
 */
let TemporalContext;

class DynamicContext {
	/**
	 * @param  {{contextItem: ?./dataTypes/Value, contextItemIndex: number, contextSequence: !Sequence,variableBindings:!Object<!Sequence>}}  context  The context to overlay
	 * @param  {!TemporalContext=}  temporalContext
	 */
	constructor (context, temporalContext = { isInitialized: false, currentDateTime: null, implicitTimezone: null }) {
		this._temporalContext = temporalContext;

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
		 * @type {!Object<!Sequence>}
		 */
		this.variableBindings = context.variableBindings || Object.create(null);
	}

	getCurrentDateTime () {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString());
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.currentDateTime;
	}

	getImplicitTimezone () {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString());
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.implicitTimezone;
	}

	/**
	 * @param   {number}             contextItemIndex
	 * @param   {./dataTypes/Value}  contextItem
	 * @param   {Sequence}           [contextSequence]
	 * @return  {!DynamicContext}
	 */
	scopeWithFocus (contextItemIndex, contextItem, contextSequence) {
		return new DynamicContext(
			{
				contextItemIndex: contextItemIndex,
				contextItem: contextItem,
				contextSequence: contextSequence || this.contextSequence,
				variableBindings: this.variableBindings
			},
			this._temporalContext);
	}

	/**
	 * @param {!Object<!Sequence>}  variableBindings
	 * @return  {!DynamicContext}
	 */
	scopeWithVariableBindings (variableBindings) {
		return new DynamicContext(
			{
				variableBindings: Object.assign(Object.create(null), this.variableBindings, variableBindings),
				contextItemIndex: this.contextItemIndex,
				contextItem: this.contextItem,
				contextSequence: this.contextSequence
			},
			this._temporalContext);
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
				if (!value.ready) {
					return value;
				}
				return ready(this.scopeWithFocus( i++, value.value, contextSequence));
			}
		});
	}
}

export default DynamicContext;
