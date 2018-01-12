import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import atomize from './atomize';
import isSubtypeOf from './isSubtypeOf';
import { trueBoolean, falseBoolean } from './createAtomicValue';

import { DONE_TOKEN, ready, notReady } from '../util/iterators';

/**
 * @constructor
 * @param   {!Array | !../util/iterators.AsyncIterator<!./Value>}  valueIteratorOrArray
 * @param   {?number=}                  predictedLength
 */
function Sequence (valueIteratorOrArray, predictedLength = null) {
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
	 * @type {!function():!../util/iterators.AsyncIterator}
	 */
	this.value = () => {
		const valueIterator = /** @type {!../util/iterators.AsyncIterator<!./Value>} */(valueIteratorOrArray);
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

Sequence.prototype.tryGetAllValues = function () {
	const iterator = this.value();
	this._saveValues = true;
	for (let val = iterator.next(); !val.done; val = iterator.next()) {
		if (!val.ready) {
			return notReady(val.promise);
		}
	}
	return ready(this._cachedValues);
};

Sequence.prototype.getAllValues = function () {
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
};

/**
 * @return  {../util/iterators.AsyncResult<boolean>}
 */
Sequence.prototype.tryGetEffectiveBooleanValue = function () {
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
};

/**
 * @return  {../util/iterators.AsyncResult<number>}
 */
Sequence.prototype.tryGetLength = function (onlyIfCheap = false) {
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
};

/**
 * @return  {!../util/iterators.AsyncResult<?./Value>}
 */
Sequence.prototype.tryGetFirst = function () {
	const iterator = this.value();
	const firstValue = iterator.next();
	if (!firstValue.ready) {
		return firstValue;
	}
	if (firstValue.done) {
		return ready(null);
	}
	return firstValue;
};

/**
 * @return  {?./Value}
 */
Sequence.prototype.first = function () {
	if (this._cachedValues[0] !== undefined) {
		return this._cachedValues[0];
	}
	const value = this.value().next();
	return value.done ? null : value.value;
};

/**
 * @param   {function(!./Value, number, !Sequence):!Sequence} callback
 * @return  {!Sequence}
 */
Sequence.prototype.map = function (callback) {
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
};

/**
 * @param   {function(!./Value, number, !Sequence):boolean} callback
 * @return  {!Sequence}
 */
Sequence.prototype.filter = function (callback) {
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
};

/**
 * @param   {function(!Array<!./Value>):!Sequence} callback
 * @return  {!Sequence}
 */
Sequence.prototype.mapAll = function (callback) {
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
};

/**
 * @param  {!../DynamicContext} dynamicContext
 * @return {!Sequence}
 */
Sequence.prototype.atomize = function (dynamicContext) {
    return this.map(value => atomize(value, dynamicContext));
};

Sequence.prototype.isEmpty = function () {
	if (this._length === 0) {
		return true;
	}
	const iterator = this.value();
	const value = iterator.next();
	return value.done;
};

Sequence.prototype.isSingleton = function () {
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
};

Sequence.prototype.getEffectiveBooleanValue = function () {
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
};

Sequence.prototype.expandSequence = function () {
	return new ArrayBackedSequence(this.getAllValues());
};


/**
 * @typedef {function(!Sequence):(!Sequence|undefined)}
 */
let switchCasesCase;

/**
 * @param  {
             {empty: switchCasesCase, singleton: switchCasesCase, multiple: switchCasesCase}|
             {empty: switchCasesCase, default: switchCasesCase}|
             {singleton: switchCasesCase, default: switchCasesCase}|
             {multiple: switchCasesCase, default: switchCasesCase}
           } cases
 * @return {!Sequence}
 */
Sequence.prototype.switchCases = function (cases) {
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
};

/**
 * @constructor
 * @extends Sequence
 */
function EmptySequence () {
	this.value = () => (
		{
			[Symbol.iterator]: function () { return this; },
			next: () => DONE_TOKEN
		}
	);
}
EmptySequence.prototype.getEffectiveBooleanValue = () => false;
EmptySequence.prototype.first = () => null;
EmptySequence.prototype.isEmpty = () => true;
EmptySequence.prototype.getAllValues = () => [];
EmptySequence.prototype.getLength = () => 0;
EmptySequence.prototype.isSingleton = () => false;
EmptySequence.prototype.mapAll = callback => callback([]);
EmptySequence.prototype.tryGetFirst = () => ready(null);
EmptySequence.prototype.tryGetLength = (_onlyIfCheap) => ready(0);
EmptySequence.prototype.tryGetAllValues = () => ready([]);

EmptySequence.prototype.tryGetEffectiveBooleanValue = function () {
	return ready(this.getEffectiveBooleanValue());
};
EmptySequence.prototype.expandSequence = function () {
	return this;
};
EmptySequence.prototype.switchCases = function (cases) {
	if (cases.empty) {
		return /** @type {!Sequence} */ (cases.empty(this));
	}
		return /** @type {!Sequence} */ (cases.default(this));
};

const emptySequence = new EmptySequence();

EmptySequence.prototype.atomize = EmptySequence.prototype.filter = EmptySequence.prototype.map = () => emptySequence;

/**
 * @extends Sequence
 * @constructor
 */
function SingletonSequence (onlyValue) {
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
SingletonSequence.prototype.getEffectiveBooleanValue = function () {
	if (this._effectiveBooleanValue === null) {
		this._effectiveBooleanValue = getEffectiveBooleanValue(this._onlyValue);
	}
	return this._effectiveBooleanValue;
};
SingletonSequence.prototype.tryGetEffectiveBooleanValue = function () {
	return ready(this.getEffectiveBooleanValue());
};
SingletonSequence.prototype.tryGetAllValues = function () {
	return ready([this._onlyValue]);
};
SingletonSequence.prototype.first = function () {
	return this._onlyValue;
};
SingletonSequence.prototype.getAllValues = function () {
	return [this._onlyValue];
};
SingletonSequence.prototype.isEmpty = () => false;
SingletonSequence.prototype.tryGetFirst = function () {
	return ready(this._onlyValue);
};
SingletonSequence.prototype.tryGetLength = function (_onlyIfCheap) {
	return ready(1);
};
SingletonSequence.prototype.getLength = () => 1;
SingletonSequence.prototype.isSingleton = () => true;
SingletonSequence.prototype.atomize = function (dynamicContext) {
	return new SingletonSequence(atomize(this._onlyValue, dynamicContext));
};
SingletonSequence.prototype.filter = function (callback) {
	if (callback(this._onlyValue, 0, this)) {
		return this;
	}
	return emptySequence;
};
SingletonSequence.prototype.map = function (callback) {
	return new SingletonSequence(callback(this._onlyValue, 0, this));
};
SingletonSequence.prototype.mapAll = function (callback) {
	return callback([this._onlyValue]);
};
SingletonSequence.prototype.expandSequence = function () {
	return this;
};
SingletonSequence.prototype.switchCases = function (cases) {
	if (cases.singleton) {
		return /** @type {!Sequence} */ (cases.singleton(this));
	}
	return /** @type {!Sequence} */ (cases.default(this));
};


/**
 * @constructor
 * @extends Sequence
 */
function ArrayBackedSequence (values) {
	if (!values.length) {
		return emptySequence;
	}
	if (values.length === 1) {
		return new SingletonSequence(values[0]);
	}
	this.value = () => {
		let i = -1;
		return {
			[Symbol.iterator]: function () { return this; },
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
}
ArrayBackedSequence.prototype.isEmpty = () => false;
ArrayBackedSequence.prototype.tryGetFirst = function () {
	return ready(this._values[0]);
};
ArrayBackedSequence.prototype.tryGetLength = function (_onlyIfCheap) {
	return ready(this._values.length);
};
ArrayBackedSequence.prototype.tryGetEffectiveBooleanValue = function () {
	return ready(this.getEffectiveBooleanValue());
};

ArrayBackedSequence.prototype.tryGetAllValues = function () {
	return ready(this._values);
};
ArrayBackedSequence.prototype.isSingleton = () => false;
ArrayBackedSequence.prototype.first = function () {
	return this._values[0];
};
ArrayBackedSequence.prototype.getAllValues = function () {
	return this._values.concat();
};
ArrayBackedSequence.prototype.getEffectiveBooleanValue = function () {
	if (isSubtypeOf(this._values[0].type, 'node()')) {
		return true;
	}
	// We always have a length > 1, or we'd be a singletonSequence
	throw new Error('FORG0006: A wrong argument type was specified in a function call.');
};
ArrayBackedSequence.prototype.filter = function (callback) {
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
};
ArrayBackedSequence.prototype.map = function (callback) {
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
};
ArrayBackedSequence.prototype.mapAll = function (callback) {
	return callback(this._values);
};
ArrayBackedSequence.prototype.getLength = function () {
	return this._values.length;
};
ArrayBackedSequence.prototype.atomize = function (dynamicContext) {
	return this.map(value => atomize(value, dynamicContext));
};
ArrayBackedSequence.prototype.expandSequence = function () {
	return this;
};
ArrayBackedSequence.prototype.switchCases = function (cases) {
	if (cases.multiple) {
		return /** @type {!Sequence} */ (cases.multiple(this));
	}
		return /** @type {!Sequence} */ (cases.default(this));
};

/**
 * @param   {!./Value}  value
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
