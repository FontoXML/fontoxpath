import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import atomize from './atomize';
import isSubtypeOf from './isSubtypeOf';
import { trueBoolean, falseBoolean } from './createAtomicValue';

import { DONE_TOKEN, ready, notReady } from '../util/iterators';

import Value from './Value';
import { AsyncIterator, AsyncResult } from  '../util/iterators';
import ExecutionParameters from '../ExecutionParameters';

/**
 * @typedef {(undefined|function(!Sequence):!Sequence)}
 */
let switchCasesCase;

class Sequence {
	constructor (valueIteratorOrArray, predictedLength = null) {
		if (Array.isArray(valueIteratorOrArray)) {
			return new ArrayBackedSequence(valueIteratorOrArray);
		}
		this._currentPosition = 0;
		/**
		 * Defines whether intermediate values must be saved. This is needed for counting the length of a sequence, with the intent to iterate over it at a later stage.
		 * An XPath example would be (1,2,3)[last()], which will execute the last() function 3 times, and 'normally' iterating over the sequence once.
		 * The first call to last() would consume the sequence, making the normal iteration have no values at the 3rd index.
		 */
		this._saveValues = false;
		/**
		 * @type {!function():!AsyncIterator}
		 */
		this.value = () => {
			const valueIterator = /** @type {!AsyncIterator<!Value>} */(valueIteratorOrArray);
			let i = this._currentPosition;
			return {
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => {
					if (this._length !== null && i >= this._length) {
						return DONE_TOKEN;
					}

					if (this._cachedValues[i] !== undefined) {
						return ready(this._cachedValues[i++]);
					}

					const value = valueIterator.next();
					if (!value.ready) {
						return value;
					}
					if (value.done) {
						const length = Math.min(i, 2) + this._currentPosition;
						this._length = length;
						return value;
					}
					if (this._saveValues || i < 2) {
						this._cachedValues[i] = value.value;
					}
					if (i >= 2) {
						this._currentPosition++;
						this._iteratorHasProgressed = true;
					}
					i++;
					return value;
				}
			};
		};

		this._length = predictedLength;

		this._iteratorHasProgressed = false;

		this._cachedValues = [];
		return this;
	}

	/**
	 * @return {AsyncResult<!Array<!Value>>}
	 */
	tryGetAllValues () {
		const iterator = this.value();
		this._saveValues = true;
		for (let val = iterator.next(); !val.done; val = iterator.next()) {
			if (!val.ready) {
				return notReady(val.promise);
			}
		}
		return ready(this._cachedValues);
	}

	/**
	 * @return {!Array<!Value>}
	 */
	getAllValues () {
		if (this._iteratorHasProgressed && this._length !== this._cachedValues.length) {
			throw new Error('Implementation error: Sequence Iterator has progressed.');

		}
		const iterator = this.value();
		const values = [];
		for (let val = iterator.next(); !val.done; val = iterator.next()) {
			if (!val.ready) {
				throw new Error('infinite loop prevented');
			}
			values.push(val.value);
		}
		return values;
	}

	/**
	 * @return  {AsyncResult<boolean>}
	 */
	tryGetEffectiveBooleanValue () {
		const iterator = this.value();
		const firstValue = iterator.next();
		if (!firstValue.ready) {
			return firstValue;
		}
		if (firstValue.done) {
			return ready(false);
		}
		if (isSubtypeOf(firstValue.value.type, 'node()')) {
			return ready(true);
		}
		const secondValue = iterator.next();
		if (!secondValue.ready) {
			return secondValue;
		}

		if (!secondValue.done) {
			throw new Error('FORG0006: A wrong argument type was specified in a function call.');
		}
		return ready(getEffectiveBooleanValue(firstValue.value));
	}

	/**
	 * @return  {AsyncResult<number>}
	 */
	tryGetLength (onlyIfCheap = false) {
		if (this._length !== null) {
			return ready(this._length);
		}
		if (onlyIfCheap) {
			return ready(-1);
		}
		const iterator = this.value();
		let val = iterator.next();
		this._saveValues = true;
		while (val.ready && !val.done) {
			val = iterator.next();
		}
		if (val.done) {
			return ready(this._length);
		}
		return notReady(val.promise);
	}

	/**
	 * @return  {!AsyncResult<?Value>}
	 */
	tryGetFirst () {
		const iterator = this.value();
		const firstValue = iterator.next();
		if (!firstValue.ready) {
			return firstValue;
		}
		if (firstValue.done) {
			return ready(null);
		}
		return firstValue;
	}

	/**
	 * @return  {?Value}
	 */
	first () {
		if (this._cachedValues[0] !== undefined) {
			return this._cachedValues[0];
		}
		const value = this.value().next();
		return value.done ? null : value.value;
	}

	/**
	 * @param   {function(!Value, number, !Sequence):!Value} callback
	 * @return  {!Sequence}
	 */
	map (callback) {
		let i = -1;
		const iterator = this.value();
		return new Sequence({
			next: () => {
				i++;
				const value = iterator.next();
				if (value.done) {
					return value;
				}
				if (!value.ready) {
					return value;
				}
				return ready(callback(value.value, i, this));
			}
		}, this._length);
	}

	/**
	 * @param   {function(!Value, number, !Sequence):boolean} callback
	 * @return  {!Sequence}
	 */
	filter (callback) {
		let i = -1;
		const iterator = this.value();

		return new Sequence({
			next: () => {
				i++;
				let value = iterator.next();
				while (!value.done) {
					if (!value.ready) {
						return value;
					}
					if (callback(value.value, i, this)) {
						return value;
					}

					i++;
					value = iterator.next();
				}
				return value;
			}
		});
	}

	/**
	 * @param   {function(!Array<!Value>):!Sequence} callback
	 * @return  {!Sequence}
	 */
	mapAll (callback) {
		const iterator = this.value();
		let mappedResultsIterator;
		const allResults = [];
		let isReady = false;
		let readyPromise = null;
		(function processNextResult () {
			for (let value = iterator.next(); !value.done; value = iterator.next()) {
				if (!value.ready) {
					readyPromise = value.promise.then(processNextResult);
					return;
				}
				allResults.push(value.value);
			}
			mappedResultsIterator = callback(allResults).value();
			isReady = true;
		})();
		return new Sequence({
			next: () => {
				if (!isReady) {
					return notReady(readyPromise);
				}
				return mappedResultsIterator.next();
			}
		});
	}

	/**
	 * @param  {!ExecutionParameters}  executionParameters
	 * @return {!Sequence}
	 */
	atomize (executionParameters) {
		return this.map(value => atomize(value, executionParameters));
	}

	/**
	 * @return {boolean}
	 */
	isEmpty () {
		if (this._length === 0) {
			return true;
		}
		const iterator = this.value();
		const value = iterator.next();
		return value.done;
	}

	/**
	 * @return {boolean}
	 */
	isSingleton () {
		if (this._length === 0) {
			return false;
		}

		if (this._length === 1) {
			return true;
		}

		const iterator = this.value();

		let value = iterator.next();
		if (!value.ready) {
			throw new Error('What to do here?');
		}
		if (value.done) {
			return false;
		}
		value = iterator.next();
		return value.done;
	}

	/**
	 * @return {boolean}
	 */
	getEffectiveBooleanValue () {
		const iterator = this.value();
		const firstValue = iterator.next();
		if (firstValue.done) {
			return false;
		}
		if (!firstValue.ready) {
			throw new Error('What to do here?');
		}
		if (isSubtypeOf(firstValue.value.type, 'node()')) {
			return true;
		}
		const secondValue = iterator.next();
		if (!secondValue.done) {
			throw new Error('FORG0006: A wrong argument type was specified in a function call.');
		}
		return getEffectiveBooleanValue(firstValue.value);
	}

	/**
	 * @return {!Sequence}
	 */
	expandSequence () {
		return new ArrayBackedSequence(this.getAllValues());
	}

	/**
	 * @param  {(!{empty: switchCasesCase, singleton: switchCasesCase, multiple: switchCasesCase, default: switchCasesCase})} cases
	 * @return {!Sequence}
	 */
	switchCases (cases) {
		const scanIterator = this.value();
		let scanIteration = 0;
		let resultIterator = null;
		return new Sequence({
			next: () => {
				if (!resultIterator) {
					// If we do not handle singleton different from multiple, we can shortcut by only consuming a single item
					if (cases.empty && !cases.multiple && !cases.singleton) {
						const value = scanIterator.next();
						if (!value.ready) {
							return value;
						}
						let resultSequence;
						if (value.done) {
							resultSequence = cases.empty(this);
						}
						else {
							resultSequence = cases.default(this);
						}
						resultIterator = resultSequence.value();
						// Try to mirror through length;
						const resultSequenceLength = resultSequence.tryGetLength(true);
						if (resultSequenceLength.ready && resultSequenceLength.value !== -1) {
							this._length = resultSequenceLength.value;
						}
					} else {
						// We need to reach two iterations
						while (scanIteration < 2) {
							const value = scanIterator.next();
							if (!value.ready) {
								return value;
							}
							if (value.done) {
								break;
							}
							scanIteration++;
						}
						let resultSequence;
						switch (scanIteration) {
							case 0:
								resultSequence = (cases.empty || cases.default)(this);
								break;
							case 1:
								resultSequence = (cases.singleton || cases.default)(this);
								break;
							default:
								resultSequence = (cases.multiple || cases.default)(this);
								break;
						}
						resultIterator = resultSequence.value();
						// Try to mirror through length;
						const resultSequenceLength = resultSequence.tryGetLength(true);
						if (resultSequenceLength.ready && resultSequenceLength.value !== -1) {
							this._length = resultSequenceLength.value;
						}
					}
				}
				return resultIterator.next();
			}
		});
	}
}

let emptySequence;
/**
 * @extends Sequence
 */
class EmptySequence {
	constructor () {
		this.value = () => (
			{
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => DONE_TOKEN
			}
		);
	}
	getEffectiveBooleanValue () {
		return false;
	};
	first () {
		return null;
	}
	isEmpty () {
		return true;
	}
	getAllValues () {
		return [];
	}
	getLength () {return 0;}
	isSingleton () {return false;}
	mapAll (callback) { return callback([]); };
	tryGetFirst () {return ready(null);}
	tryGetLength (_onlyIfCheap) { return ready(0); }
	tryGetAllValues () {
		return ready([]);
	}
	tryGetEffectiveBooleanValue () {
		return ready(this.getEffectiveBooleanValue());
	}
	expandSequence () {
		return this;
	}
	switchCases (cases) {
		if (cases.empty) {
			return /** @type {!Sequence} */ (cases.empty(this));
		}
		return /** @type {!Sequence} */ (cases.default(this));
	}
	atomize () {
		return emptySequence;
}
	filter () {
		return emptySequence;
}
	map () {
		return emptySequence;
	}
}

emptySequence = new EmptySequence();

/**
 * @extends Sequence
 */
class SingletonSequence {
	constructor (onlyValue) {
		this.value = () => {
			let hasPassed = false;
			return {
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => {
					if (hasPassed) {
						return DONE_TOKEN;
					}
					hasPassed = true;
					return ready(onlyValue);
				}
			};
		};
		this._onlyValue = onlyValue;
		this._effectiveBooleanValue = null;
	}
	getEffectiveBooleanValue () {
		if (this._effectiveBooleanValue === null) {
			this._effectiveBooleanValue = getEffectiveBooleanValue(this._onlyValue);
		}
		return this._effectiveBooleanValue;
	}
	tryGetEffectiveBooleanValue () {
		return ready(this.getEffectiveBooleanValue());
	}
	tryGetAllValues () {
		return ready([this._onlyValue]);
	}
	first () {
		return this._onlyValue;
	}
	getAllValues () {
		return [this._onlyValue];
	}
	isEmpty () {
		return false;
	}
	tryGetFirst () {
		return ready(this._onlyValue);
	}
	tryGetLength (_onlyIfCheap) {
		return ready(1);
	}
	getLength () {
		return 1;
	}
	isSingleton () {
		return true;
	}
	atomize (executionParameters) {
		return new SingletonSequence(atomize(this._onlyValue, executionParameters));
	}
	filter (callback) {
		if (callback(this._onlyValue, 0, this)) {
			return this;
		}
		return emptySequence;
	}
	map (callback) {
		return new SingletonSequence(callback(this._onlyValue, 0, this));
	}
	mapAll (callback) {
		return callback([this._onlyValue]);
	}
	expandSequence () {
		return this;
	}
	switchCases (cases) {
		if (cases.singleton) {
			return /** @type {!Sequence} */ (cases.singleton(this));
		}
		return /** @type {!Sequence} */ (cases.default(this));
	}
}

/**
 * @extends Sequence
 */
class ArrayBackedSequence {
	/**
	 * @return {!Sequence}
	 */
	constructor (values) {
		if (!values.length) {
			return /** @type {?} */(emptySequence);
		}
		if (values.length === 1) {
			return /** @type {?} */(new SingletonSequence(values[0]));
		}
		this.value = () => {
			let i = -1;
			return {
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => {
					i++;
					if (i >= values.length) {
						return DONE_TOKEN;
					}
					return ready(values[i]);
				}
			};
		};

		this._values = values;
		return /** @type {?} */(this);
	}
	isEmpty () {
		return false;
	}
	tryGetFirst () {
		return ready(this._values[0]);
	}
	tryGetLength (_onlyIfCheap) {
		return ready(this._values.length);
	}
	tryGetEffectiveBooleanValue () {
		return ready(this.getEffectiveBooleanValue());
	}
	tryGetAllValues () {
		return ready(this._values);
	}
	isSingleton () {
		return false;
	}
	first () {
		return this._values[0];
	}
	getAllValues () {
		return this._values;
	}
	getEffectiveBooleanValue () {
		if (isSubtypeOf(this._values[0].type, 'node()')) {
			return true;
		}
		// We always have a length > 1, or we'd be a singletonSequence
		throw new Error('FORG0006: A wrong argument type was specified in a function call.');
	}
	filter (callback) {
		let i = -1;
		return new Sequence({
			next: () => {
				i++;
				while (i < this._values.length && !callback(this._values[i], i, this)) {
					i++;
				}

				if (i >= this._values.length) {
					return DONE_TOKEN;
				}

				return ready(this._values[i]);
			}
		});
	}
	map (callback) {
		let i = -1;
		return new Sequence({
			next: () => {
				i++;
				if (i >= this._values.length) {
					return DONE_TOKEN;
				}
				return ready(callback(this._values[i], i, this));
			}
		}, this._values.length);
	}
	mapAll (callback) {
		return callback(this._values);
	}
	getLength () {
		return this._values.length;
	}
	atomize (executionParameters) {
		return this.map(value => atomize(value, executionParameters));
	}
	expandSequence () {
		return this;
	}
	switchCases (cases) {
		if (cases.multiple) {
			return /** @type {!Sequence} */ (cases.multiple(this));
		}
		return /** @type {!Sequence} */ (cases.default(this));
	}
}
/**
 * @param   {!Value}  value
 * @return  {!Sequence}
 */
Sequence.singleton = function (value) {
    return new SingletonSequence(value);
};

/**
 * @return  {!Sequence}
 */
Sequence.empty = function () {
	return emptySequence;
};

const singletonTrueSequence = new SingletonSequence(trueBoolean);
const singletonFalseSequence = new SingletonSequence(falseBoolean);

/**
 * @return {!Sequence}
 */
Sequence.singletonTrueSequence = function () {
	return singletonTrueSequence;
};

/**
 * @return {!Sequence}
 */
Sequence.singletonFalseSequence = function () {
	return singletonFalseSequence;
};


export default Sequence;
