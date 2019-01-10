import { ready, AsyncIterator } from './util/iterators';
import DateTime from './dataTypes/valueTypes/DateTime';
import DayTimeDuration from './dataTypes/valueTypes/DayTimeDuration';
import ISequence from './dataTypes/ISequence';
import Value from './dataTypes/Value';

type TemporalContext = {
	isInitialized: boolean;
	currentDateTime: DateTime;
	implicitTimezone: DayTimeDuration;
};

class DynamicContext {
	_temporalContext: TemporalContext;
	contextItemIndex: number;
	contextSequence: ISequence;
	contextItem: Value;
	variableBindings: { [s: string]: () => ISequence };

	constructor(
		context: {
			contextItem: Value | null;
			contextItemIndex: number;
			contextSequence: ISequence;
			variableBindings: { [s: string]: () => ISequence };
		},
		temporalContext: TemporalContext | undefined = {
			isInitialized: false,
			currentDateTime: null,
			implicitTimezone: null
		}
	) {
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

		this.contextItem = context.contextItem;

		this.variableBindings = context.variableBindings || Object.create(null);
	}

	getCurrentDateTime() {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString());
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.currentDateTime;
	}

	getImplicitTimezone() {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString());
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.implicitTimezone;
	}

	scopeWithFocus(
		contextItemIndex: number,
		contextItem: Value,
		contextSequence: ISequence
	): DynamicContext {
		return new DynamicContext(
			{
				contextItemIndex: contextItemIndex,
				contextItem: contextItem,
				contextSequence: contextSequence || this.contextSequence,
				variableBindings: this.variableBindings
			},
			this._temporalContext
		);
	}

	scopeWithVariableBindings(variableBindings: { [s: string]: ISequence }): DynamicContext {
		return new DynamicContext(
			{
				contextItemIndex: this.contextItemIndex,
				contextItem: this.contextItem,
				contextSequence: this.contextSequence,
				variableBindings: Object.assign(
					Object.create(null),
					this.variableBindings,
					variableBindings
				)
			},
			this._temporalContext
		);
	}

	createSequenceIterator(contextSequence: ISequence): AsyncIterator<DynamicContext> {
		let i = 0;
		const iterator = contextSequence.value;
		return {
			next: () => {
				const value = iterator.next();
				if (value.done) {
					return value;
				}
				if (!value.ready) {
					return value;
				}
				return ready(this.scopeWithFocus(i++, value.value, contextSequence));
			}
		};
	}
}

export default DynamicContext;
