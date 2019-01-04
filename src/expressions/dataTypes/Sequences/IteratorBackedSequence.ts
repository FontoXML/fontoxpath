import { DONE_TOKEN, ready, notReady, AsyncIterator, AsyncResult } from '../../util/iterators';
import Value from '../Value';
import ISequence, { SwitchCasesCases } from '../ISequence';
import isSubtypeOf from '../isSubtypeOf';
import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import SequenceFactory from '../SequenceFactory';
import ExecutionParameters from '../../ExecutionParameters';
import atomize from '../atomize';

export default class IteratorBackedSequence implements ISequence {
	value: AsyncIterator<Value>;

	private _cacheAllValues: boolean;
	private _cachedValues: Array<Value>;
	private _currentPosition: number;
	private _length: number;

	constructor(
		private readonly _sequenceFactory: typeof SequenceFactory,
		valueIterator: AsyncIterator<Value>,
		predictedLength: number = null) {
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

		this._cachedValues = [];
		this._currentPosition = 0;
		this._length = predictedLength;
	}

	atomize(executionParameters: ExecutionParameters): ISequence {
		return this.map(value => atomize(value, executionParameters));
	}

	expandSequence(): ISequence {
		const values = this.tryGetAllValues();
		if (!values.ready) {
			throw new Error('Can not expand sequence which contains async entries.');
		}
		return this._sequenceFactory.create(values.value);
	}

	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		let i = -1;
		const iterator = this.value;

		return this._sequenceFactory.create({
			next: () => {
				i++;
				let value = iterator.next();
				while (!value.done) {
					if (!value.ready) {
						return value;
					}
					if (callback(/** @type {!Value} */(value.value), i, this)) {
						return value;
					}

					i++;
					value = iterator.next();
				}
				return value;
			}
		});
	}

	first(): Value | null {
		const first = this.tryGetFirst();
		if (!first.ready) {
			throw new Error('First value is async.');
		}
		return first.value;
	}

	getAllValues(): Array<Value> {
		const values = this.tryGetAllValues();
		if (!values.ready) {
			throw new Error('Sequence contains async values.');
		}
		return values.value;
	}

	getEffectiveBooleanValue(): boolean {
		const effectiveBooleanValue = this.tryGetEffectiveBooleanValue();
		if (!effectiveBooleanValue.ready) {
			throw new Error('Sequence contains async values.');
		}
		return effectiveBooleanValue.value;
	}

	isEmpty(): boolean {
		const isEmpty = this.tryIsEmpty();
		if (!isEmpty.ready) {
			throw new Error('First value is async.');
		}
		return isEmpty.value;
	}

	isSingleton(): boolean {
		const isSingleton = this.tryIsSingleton();
		if (!isSingleton.ready) {
			throw new Error('Sequence has async values.');
		}
		return isSingleton.value;
	}

	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		let i = 0;
		const iterator = this.value;
		return this._sequenceFactory.create({
			next: () => {
				const value = iterator.next();
				if (value.done || !value.ready) {
					return value;
				}
				return ready(callback(value.value, i++, this));
			}
		});
	}

	mapAll(callback: (allValues: Array<Value>) => ISequence): ISequence {
		const iterator = this.value;
		let mappedResultsIterator;
		const allResults = [];
		let isReady = false;
		let readyPromise = null;
		(function processNextResult() {
			for (let value = iterator.next(); !value.done; value = iterator.next()) {
				if (!value.ready) {
					readyPromise = value.promise.then(processNextResult);
					return;
				}
				allResults.push(value.value);
			}
			mappedResultsIterator = callback(allResults).value;
			isReady = true;
		})();
		return this._sequenceFactory.create({
			next: () => {
				if (!isReady) {
					return notReady(readyPromise);
				}
				return mappedResultsIterator.next();
			}
		});
	}

	switchCases(cases: SwitchCasesCases): ISequence {
		let resultIterator = null;
		return this._sequenceFactory.create({
			next: () => {
				if (resultIterator) {
					return resultIterator.next();
				}
				if (cases.empty) {
					const isEmpty = this.tryIsEmpty();
					if (!isEmpty.ready) {
						return notReady(isEmpty.promise);
					}
					if (isEmpty.value) {
						resultIterator = cases.empty(this).value;
						return resultIterator.next();
					}
				}
				if (cases.singleton) {
					const isSingleton = this.tryIsSingleton();
					if (!isSingleton.ready) {
						return notReady(isSingleton.promise);
					}
					if (isSingleton.value) {
						resultIterator = cases.singleton(this).value;
						return resultIterator.next();
					}
				}
				if (cases.default) {
					resultIterator = cases.default(this).value;
					return resultIterator.next();
				}
				resultIterator = cases.multiple(this).value;
				return resultIterator.next();
			}
		});
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
			if (it.done) {
				this.reset(oldPosition);
				return ready(false);
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
		return ready(getEffectiveBooleanValue(firstValue));
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

		// No first cache value, the current position must have been 0
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

	private tryIsEmpty(): AsyncResult<boolean> {
		if (this._length === 0) {
			return ready(true);
		}
		const firstValue = this.tryGetFirst();
		if (!firstValue.ready) {
			return notReady(firstValue.promise);
		}
		return ready(firstValue.value === null);
	}

	private tryIsSingleton(): AsyncResult<boolean> {
		if (this._length !== null) {
			return ready(this._length === 1);
		}

		const iterator = this.value;
		const oldPosition = this._currentPosition;

		// Check there is at least one value
		if (this._cachedValues[0] === undefined) {
			const it = iterator.next();
			if (!it.ready) {
				return notReady(it.promise);
			}
			if (it.done) {
				this.reset(oldPosition);
				return ready(false);
			}
		}

		if (this._cachedValues[1] !== undefined) {
			this.reset(oldPosition);
			return ready(false);
		}
		const secondValue = iterator.next();
		if (!secondValue.ready) {
			return notReady(secondValue.promise);
		}
		this.reset(oldPosition);
		return ready(secondValue.done);
	}

	private reset(to = 0) {
		this._currentPosition = to;
	}
}
