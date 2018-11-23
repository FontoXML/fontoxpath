import { ready, AsyncIterator } from './util/iterators';
import DateTime from './dataTypes/valueTypes/DateTime';
import DayTimeDuration from './dataTypes/valueTypes/DayTimeDuration';
import Sequence from './dataTypes/Sequence';
import Value from './dataTypes/Value';

/**
 * @typedef {!{isInitialized: boolean, currentDateTime: ?DateTime, implicitTimezone: ?DayTimeDuration}}
 */
let TemporalContext;

class DynamicContext {
	/**
	 * @param  {{contextItem: ?Value, contextItemIndex: number, contextSequence: !Sequence,variableBindings:!Object<function():!Sequence>}}  context  The context to overlay
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
		 * @type {?Value}
		 * @const
		 */
		this.contextItem = context.contextItem;

		/**
		 * @type {!Object<!function():!Sequence>}
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
	 * @param   {Value}  contextItem
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
	 * @param {!Object<!function():!Sequence>}  variableBindings
	 * @return  {!DynamicContext}
	 */
	scopeWithVariableBindings (variableBindings) {
		return new DynamicContext(
			{
				contextItemIndex: this.contextItemIndex,
				contextItem: this.contextItem,
				contextSequence: this.contextSequence,
				variableBindings: Object.assign(Object.create(null), this.variableBindings, variableBindings)
			},
			this._temporalContext);
	}

	/**
	 * @param   {!Sequence}  contextSequence
	 * @return  {!AsyncIterator<!DynamicContext>}
	 */
	createSequenceIterator (contextSequence) {
		let i = 0;
		const iterator = contextSequence.value;
		return /** @type {!AsyncIterator<!DynamicContext>}*/ ({
			next: () => {
				const value = iterator.next();
				if (value.done) {
					return value;
				}
				if (!value.ready) {
					return value;
				}
				return ready(this.scopeWithFocus(i++, /** @type {!Value} */(value.value), contextSequence));
			}
		});
	}
}

export default DynamicContext;
