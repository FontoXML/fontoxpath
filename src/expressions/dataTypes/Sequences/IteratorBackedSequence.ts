import { DONE_TOKEN, ready, notReady, AsyncIterator, AsyncResult } from '../../util/iterators';
import Value from '../Value';
import ISequence from '../ISequence';
import isSubtypeOf from '../isSubtypeOf';
import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import SequenceFactory from '../SequenceFactory';

export default class IteratorBackedSequence implements ISequence {
	value: AsyncIterator<Value>;

	private _cacheAllValues: boolean;
	private _cachedValues: Array<Value>;
	private _currentPosition: number;
	private _length: number;

	constructor(valueIterator: AsyncIterator<Value>, predictedLength: number = null) {
		this.value = {
			next: () => {
				if (this._length !== null && this._currentPosition >= this._length) {
					return DONE_TOKEN;
				}
				if (this._cachedValues[this._currentPosition] !== undefined) {
					return ready(this._cachedValues[this._currentPosition++]);
				}
				const value = valueIterator.next();
				if (!value.ready) {
					return value;
				}
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
			}
		};

		this._length = predictedLength;
	}

	expandSequence(): ISequence {
		const values = this.tryGetAllValues();
		if (!values.ready) {
			throw new Error('Can not expand sequence which contains async entries.');
		}
		return SequenceFactory.create(values.value);
	}

	first(): Value | null {
		const first = this.tryGetFirst();
		if (!first.ready) {
			throw new Error('First entry is async.');
		}
		return first.value;
	}

	isEmpty(): boolean {
		if (this._length === 0) {
			return true;
		}
		return this.first() === null;
	}

	tryGetAllValues(): AsyncResult<Array<Value>> {
		if (this._currentPosition >= 2 && this._length !== this._cachedValues.length) {
			throw new Error('Implementation error: Sequence Iterator has progressed.');
		}

		const iterator = this.value;
		this._cacheAllValues = true;
		for (let val = iterator.next(); !val.done; val = iterator.next()) {
			if (!val.ready) {
				return notReady(val.promise);
			}
		}

		return ready(this._cachedValues);
	}

	tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		const iterator = this.value;
		const oldPosition = this._currentPosition;

		let firstValue: Value;
		if (this._cachedValues[0] !== undefined) {
			firstValue = this._cachedValues[0];
		} else {
			const it = iterator.next();
			if (!it.ready) {
				return notReady(it.promise);
			}
			firstValue = it.value;
		}

		if (isSubtypeOf(firstValue.value.type, 'node()')) {
			this.reset(oldPosition);
			return ready(true);
		}

		if (this._cachedValues[1] !== undefined) {
			throw errFORG0006();
		}
		const secondValue = iterator.next();
		if (!secondValue.ready) {
			return notReady(secondValue.promise);
		}
		if (!secondValue.done) {
			throw errFORG0006();
		}

		this.reset(oldPosition);
		return ready(getEffectiveBooleanValue(firstValue.value));
	}

	tryGetFirst(): AsyncResult<Value> {
		if (this._cachedValues[0] !== undefined) {
			return ready(this._cachedValues[0]);
		}

		const iterator = this.value;
		const firstValue = iterator.next();
		if (!firstValue.ready) {
			return firstValue;
		}

		// No first cache entry, the current position must have been 0
		this.reset();

		if (firstValue.done) {
			return ready(null);
		}
		return firstValue;
	}

	tryGetLength(onlyIfCheap = false): AsyncResult<number> {
		if (this._length !== null) {
			return ready(this._length);
		}
		if (onlyIfCheap) {
			return ready(-1);
		}

		const oldPosition = this._currentPosition;
		const values = this.tryGetAllValues();
		if (!values.ready) {
			return notReady(values.promise);
		}

		this.reset(oldPosition);
		return ready(this._length);
	}

	private reset(to = 0) {
		this._currentPosition = to;
	}
}
