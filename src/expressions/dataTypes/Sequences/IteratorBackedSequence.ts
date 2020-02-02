import ExecutionParameters from '../../ExecutionParameters';
import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import {
	DONE_TOKEN,
	IAsyncIterator,
	IAsyncResult,
	IterationHint,
	notReady,
	ready
} from '../../util/iterators';
import atomize from '../atomize';
import ISequence, { SwitchCasesCases } from '../ISequence';
import isSubtypeOf from '../isSubtypeOf';
import sequenceFactory from '../sequenceFactory';
import Value from '../Value';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';

export default class IteratorBackedSequence implements ISequence {
	public value: IAsyncIterator<Value>;

	private _cacheAllValues: boolean;
	private _cachedValues: Value[];
	private _currentPosition: number;
	private _length: number;

	constructor(
		private readonly _sequenceFactory: typeof sequenceFactory,
		valueIterator: IAsyncIterator<Value>,
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

		this._cacheAllValues = false;
		this._cachedValues = [];
		this._currentPosition = 0;
		this._length = predictedLength;
	}

	public atomize(executionParameters: ExecutionParameters): ISequence {
		return atomize(this, executionParameters);
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
					if (!value.ready) {
						return value;
					}
					if (callback(value.value, i, this)) {
						return value;
					}

					i++;
					value = iterator.next(hint);
				}
				return value;
			}
		});
	}

	public first(): Value | null {
		const first = this.tryGetFirst();
		if (!first.ready) {
			throw new Error('First value is async.');
		}
		return first.value;
	}

	public getAllValues(): Value[] {
		const values = this.tryGetAllValues();
		if (!values.ready) {
			throw new Error('Sequence contains async values.');
		}
		return values.value;
	}

	public getEffectiveBooleanValue(): boolean {
		const effectiveBooleanValue = this.tryGetEffectiveBooleanValue();
		if (!effectiveBooleanValue.ready) {
			throw new Error('Sequence contains async values.');
		}
		return effectiveBooleanValue.value;
	}

	public isEmpty(): boolean {
		const isEmpty = this.tryIsEmpty();
		if (!isEmpty.ready) {
			throw new Error('First value is async.');
		}
		return isEmpty.value;
	}

	public isSingleton(): boolean {
		const isSingleton = this.tryIsSingleton();
		if (!isSingleton.ready) {
			throw new Error('Sequence has async values.');
		}
		return isSingleton.value;
	}

	public map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		let i = 0;
		const iterator = this.value;
		return this._sequenceFactory.create(
			{
				next: (hint: IterationHint) => {
					const value = iterator.next(hint);
					if (value.done || !value.ready) {
						return value;
					}
					return ready(callback(value.value, i++, this));
				}
			},
			this._length
		);
	}

	public mapAll(callback: (allValues: Value[]) => ISequence, hint: IterationHint): ISequence {
		const iterator = this.value;
		let mappedResultsIterator: IAsyncIterator<Value>;
		const allResults: Value[] = [];
		let isReady = false;
		let readyPromise = null;
		let isFirst = true;
		(function processNextResult() {
			for (
				let value = iterator.next(isFirst ? IterationHint.NONE : hint);
				!value.done;
				value = iterator.next(hint)
			) {
				if (!value.ready) {
					readyPromise = value.promise.then(processNextResult);
					return;
				}
				isFirst = false;
				allResults.push(value.value);
			}
			mappedResultsIterator = callback(allResults).value;
			isReady = true;
		})();
		return this._sequenceFactory.create({
			next: (_hint: IterationHint) => {
				if (!isReady) {
					return notReady(readyPromise);
				}
				return mappedResultsIterator.next(IterationHint.NONE);
			}
		});
	}

	public switchCases(cases: SwitchCasesCases): ISequence {
		let resultIterator: IAsyncIterator<Value> = null;

		const setResultIterator = (resultSequence: ISequence) => {
			resultIterator = resultSequence.value;
			// Try to mirror through length;
			const resultSequenceLength = resultSequence.tryGetLength(true);
			if (resultSequenceLength.ready && resultSequenceLength.value !== -1) {
				this._length = resultSequenceLength.value;
			}
		};

		return this._sequenceFactory.create({
			next: (hint: IterationHint) => {
				if (resultIterator) {
					return resultIterator.next(hint);
				}

				const isEmpty = this.tryIsEmpty();
				if (!isEmpty.ready) {
					return notReady(isEmpty.promise);
				}
				if (isEmpty.value) {
					setResultIterator(cases.empty ? cases.empty(this) : cases.default(this));
					return resultIterator.next(hint);
				}

				const isSingleton = this.tryIsSingleton();
				if (!isSingleton.ready) {
					return notReady(isSingleton.promise);
				}
				if (isSingleton.value) {
					setResultIterator(
						cases.singleton ? cases.singleton(this) : cases.default(this)
					);
					return resultIterator.next(hint);
				}

				setResultIterator(cases.multiple ? cases.multiple(this) : cases.default(this));
				return resultIterator.next(hint);
			}
		});
	}

	public tryGetAllValues(): IAsyncResult<Value[]> {
		if (
			this._currentPosition > this._cachedValues.length &&
			this._length !== this._cachedValues.length
		) {
			throw new Error('Implementation error: Sequence Iterator has progressed.');
		}

		const iterator = this.value;
		this._cacheAllValues = true;
		for (
			let val = iterator.next(IterationHint.NONE);
			!val.done;
			val = iterator.next(IterationHint.NONE)
		) {
			if (!val.ready) {
				return notReady(val.promise);
			}
		}

		return ready(this._cachedValues);
	}

	public tryGetEffectiveBooleanValue(): IAsyncResult<boolean> {
		const iterator = this.value;
		const oldPosition = this._currentPosition;

		this.reset();
		const it = iterator.next(IterationHint.NONE);
		if (!it.ready) {
			return notReady(it.promise);
		}
		if (it.done) {
			this.reset(oldPosition);
			return ready(false);
		}
		const firstValue = it.value;

		if (isSubtypeOf(firstValue.type, 'node()')) {
			this.reset(oldPosition);
			return ready(true);
		}

		const secondValue = iterator.next(IterationHint.NONE);
		if (!secondValue.ready) {
			return notReady(secondValue.promise);
		}
		if (!secondValue.done) {
			throw errFORG0006();
		}

		this.reset(oldPosition);
		return ready(getEffectiveBooleanValue(firstValue));
	}

	public tryGetFirst(): IAsyncResult<Value> {
		if (this._cachedValues[0] !== undefined) {
			return ready(this._cachedValues[0]);
		}

		const iterator = this.value;
		// No first cache value, the current position must have been 0
		const firstValue = iterator.next(IterationHint.NONE);
		if (!firstValue.ready) {
			return firstValue;
		}

		this.reset();

		if (firstValue.done) {
			return ready(null);
		}
		return firstValue;
	}

	public tryGetLength(onlyIfCheap = false): IAsyncResult<number> {
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

	private tryIsEmpty(): IAsyncResult<boolean> {
		if (this._length === 0) {
			return ready(true);
		}
		const firstValue = this.tryGetFirst();
		if (!firstValue.ready) {
			return notReady(firstValue.promise);
		}
		return ready(firstValue.value === null);
	}

	private tryIsSingleton(): IAsyncResult<boolean> {
		if (this._length !== null) {
			return ready(this._length === 1);
		}

		const iterator = this.value;
		const oldPosition = this._currentPosition;

		// Check there is at least one value
		this.reset();
		const it = iterator.next(IterationHint.NONE);
		if (!it.ready) {
			return notReady(it.promise);
		}
		if (it.done) {
			this.reset(oldPosition);
			return ready(false);
		}

		const secondValue = iterator.next(IterationHint.NONE);
		if (!secondValue.ready) {
			return notReady(secondValue.promise);
		}
		this.reset(oldPosition);
		return ready(secondValue.done);
	}
}
