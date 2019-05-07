import ISequence from './dataTypes/ISequence';
import Value from './dataTypes/Value';
import DateTime from './dataTypes/valueTypes/DateTime';
import DayTimeDuration from './dataTypes/valueTypes/DayTimeDuration';
import { IAsyncIterator, IterationHint, notReady, ready } from './util/iterators';

type TemporalContext = {
	currentDateTime: DateTime | null;
	implicitTimezone: DayTimeDuration | null;
	isInitialized: boolean;
};

class DynamicContext {
	public contextItem: Value | null;
	public contextItemIndex: number;
	public contextSequence: ISequence;
	public variableBindings: { [s: string]: () => ISequence };
	private _temporalContext: TemporalContext;

	constructor(
		context: {
			contextItem: Value | null;
			contextItemIndex: number;
			contextSequence: ISequence;
			variableBindings: { [s: string]: () => ISequence };
		},
		temporalContext: TemporalContext | undefined = {
			currentDateTime: null,
			implicitTimezone: null,
			isInitialized: false
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

	public createSequenceIterator(contextSequence: ISequence): IAsyncIterator<DynamicContext> {
		let i = 0;
		const iterator = contextSequence.value;
		return {
			next: (hint: IterationHint) => {
				const value = iterator.next(hint);
				if (value.done) {
					return value;
				}
				if (!value.ready) {
					return notReady(value.promise);
				}
				return ready(this.scopeWithFocus(i++, value.value, contextSequence));
			}
		};
	}

	public getCurrentDateTime() {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString());
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.currentDateTime;
	}

	public getImplicitTimezone() {
		if (!this._temporalContext.isInitialized) {
			this._temporalContext.isInitialized = true;

			this._temporalContext.currentDateTime = DateTime.fromString(new Date().toISOString());
			this._temporalContext.implicitTimezone = DayTimeDuration.fromString('PT0S');
		}
		return this._temporalContext.implicitTimezone;
	}

	public scopeWithFocus(
		contextItemIndex: number,
		contextItem: Value | null,
		contextSequence: ISequence
	): DynamicContext {
		return new DynamicContext(
			{
				contextItem,
				contextItemIndex,
				contextSequence: contextSequence || this.contextSequence,
				variableBindings: this.variableBindings
			},
			this._temporalContext
		);
	}

	public scopeWithVariableBindings(variableBindings: {
		[s: string]: () => ISequence;
	}): DynamicContext {
		return new DynamicContext(
			{
				contextItem: this.contextItem,
				contextItemIndex: this.contextItemIndex,
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
}

export default DynamicContext;
