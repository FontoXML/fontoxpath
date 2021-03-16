import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import isSubtypeOf from '../isSubtypeOf';
import sequenceFactory from '../sequenceFactory';
import Value from '../Value';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';

export default class IteratorBackedSequence implements ISequence {
	public value: IIterator<Value>;

	private _cacheAllValues: boolean;
	private _cachedValues: Value[];
	private _currentPosition: number;
	private _length: number;

	constructor(
		private readonly _sequenceFactory: typeof sequenceFactory,
		valueIterator: IIterator<Value>,
		predictedLength: number = null
	) {
		this.value = {
			next: (hint: IterationHint) => {
				if (this._length !== null && this._currentPosition >= this._length) {
					return DONE_TOKEN;
				}
				if (this._cachedValues[this._currentPosition] !== undefined) {
					return ready(this._cachedValues[this._currentPosition++]);
				}
				const value = valueIterator.next(hint);
				if (value.done) {
					const length = this._currentPosition;
					this._length = length;
					return value;
				}
				if (this._cacheAllValues || this._currentPosition < 2) {
					this._cachedValues[this._currentPosition] = value.value;
				}
				this._currentPosition++;
				return value;
			},
		};

		this._cacheAllValues = false;
		this._cachedValues = [];
		this._currentPosition = 0;
		this._length = predictedLength;
	}

	public expandSequence(): ISequence {
		return this._sequenceFactory.create(this.getAllValues());
	}

	public filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		let i = -1;
		const iterator = this.value;

		return this._sequenceFactory.create({
			next: (hint: IterationHint) => {
				i++;
				let value = iterator.next(hint);
				while (!value.done) {
					if (callback(value.value, i, this)) {
						return value;
					}

					i++;
					value = iterator.next(hint);
				}
				return value;
			},
		});
	}

	public first(): Value | null {
		if (this._cachedValues[0] !== undefined) {
			return this._cachedValues[0];
		}

		const iterator = this.value;
		// No first cache value, the current position must have been 0
		const firstValue = iterator.next(IterationHint.NONE);

		this.reset();

		if (firstValue.done) {
			return null;
		}
		return firstValue.value;
	}

	public getAllValues(): Value[] {
		if (
			this._currentPosition > this._cachedValues.length &&
			this._length !== this._cachedValues.length
		) {
			throw new Error('Implementation error: Sequence Iterator has progressed.');
		}

		const iterator = this.value;
		this._cacheAllValues = true;

		let val = iterator.next(IterationHint.NONE);
		while (!val.done) {
			val = iterator.next(IterationHint.NONE);
		}

		return this._cachedValues;
	}

	public getEffectiveBooleanValue(): boolean {
		const iterator = this.value;
		const oldPosition = this._currentPosition;

		this.reset();
		const it = iterator.next(IterationHint.NONE);
		if (it.done) {
			this.reset(oldPosition);
			return false;
		}
		const firstValue = it.value;

		if (isSubtypeOf(firstValue.type, 'node()')) {
			this.reset(oldPosition);
			return true;
		}

		const secondValue = iterator.next(IterationHint.NONE);
		if (!secondValue.done) {
			throw errFORG0006();
		}

		this.reset(oldPosition);
		return getEffectiveBooleanValue(firstValue);
	}

	public getLength(onlyIfCheap: boolean = false): number {
		if (this._length !== null) {
			return this._length;
		}

		if (onlyIfCheap) {
			return -1;
		}

		const oldPosition = this._currentPosition;

		const length = this.getAllValues().length;

		this.reset(oldPosition);
		return length;
	}

	public isEmpty(): boolean {
		if (this._length === 0) {
			return true;
		}
		const firstValue = this.first();
		return firstValue === null;
	}

	public isSingleton(): boolean {
		if (this._length !== null) {
			return this._length === 1;
		}

		const iterator = this.value;
		const oldPosition = this._currentPosition;

		// Check there is at least one value
		this.reset();
		const it = iterator.next(IterationHint.NONE);
		if (it.done) {
			this.reset(oldPosition);
			return false;
		}

		const secondValue = iterator.next(IterationHint.NONE);
		this.reset(oldPosition);
		return secondValue.done;
	}

	public map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		let i = 0;
		const iterator = this.value;
		return this._sequenceFactory.create(
			{
				next: (hint: IterationHint) => {
					const value = iterator.next(hint);
					if (value.done) {
						return DONE_TOKEN;
					}

					return ready(callback(value.value, i++, this));
				},
			},
			this._length
		);
	}

	public mapAll(callback: (allValues: Value[]) => ISequence, hint: IterationHint): ISequence {
		const iterator = this.value;
		let mappedResultsIterator: IIterator<Value>;
		const allResults: Value[] = [];
		let isFirst = true;
		(function processNextResult() {
			for (
				let value = iterator.next(isFirst ? IterationHint.NONE : hint);
				!value.done;
				value = iterator.next(hint)
			) {
				isFirst = false;
				allResults.push(value.value);
			}
			mappedResultsIterator = callback(allResults).value;
		})();
		return this._sequenceFactory.create({
			next: (_hint: IterationHint) => {
				return mappedResultsIterator.next(IterationHint.NONE);
			},
		});
	}

	public switchCases(cases: SwitchCasesCases): ISequence {
		let resultIterator: IIterator<Value> = null;

		const setResultIterator = (resultSequence: ISequence) => {
			resultIterator = resultSequence.value;
			// Try to mirror through length;
			const resultSequenceLength = resultSequence.getLength(true);
			if (resultSequenceLength !== -1) {
				this._length = resultSequenceLength;
			}
		};

		return this._sequenceFactory.create({
			next: (hint: IterationHint) => {
				if (resultIterator) {
					return resultIterator.next(hint);
				}

				const isEmpty = this.isEmpty();
				if (isEmpty) {
					setResultIterator(cases.empty ? cases.empty(this) : cases.default(this));
					return resultIterator.next(hint);
				}

				const isSingleton = this.isSingleton();
				if (isSingleton) {
					setResultIterator(
						cases.singleton ? cases.singleton(this) : cases.default(this)
					);
					return resultIterator.next(hint);
				}

				setResultIterator(cases.multiple ? cases.multiple(this) : cases.default(this));
				return resultIterator.next(hint);
			},
		});
	}

	private reset(to = 0) {
		this._currentPosition = to;
	}
}
