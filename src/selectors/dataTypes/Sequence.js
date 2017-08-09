import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import atomize from './atomize';
import isSubtypeOf from './isSubtypeOf';
import { trueBoolean, falseBoolean } from './createAtomicValue';
/**
 * @const
 */
const DONE_VALUE = { done: true, ready: true, value: undefined };
let id = 0;
/**
 * @constructor
 * @template T
 * @extends {./Value}
 * @param   {!Array<T> | !Iterator<T>}  valueIteratorOrArray
 * @param   {?number=}                  predictedLength
 */
function Sequence (valueIteratorOrArray, predictedLength = null) {
	if (Array.isArray(valueIteratorOrArray)) {
		return new ArrayBackedSequence(valueIteratorOrArray);
	}
	this.id = id++;
	this._currentPosition = 0;
	this.value = () => {
		const valueIterator = /** @type {!Iterator} */(valueIteratorOrArray);
		let i = this._currentPosition;
		return {
			[Symbol.iterator]: function () {
				return this;
			},
			next: () => {
				if (this._length !== null && i >= this._length) {
					return DONE_VALUE;
				}

				if (this._cachedValues[i] !== undefined) {
					return { done: false, ready: true, value: this._cachedValues[i++] };
				}

				const value = valueIterator.next();
				if (!value.ready) {
					return value;
				}
				if (value.done) {
					this._length = Math.min(i, 2) + this._currentPosition;
					return value;
				}
				if (i < 2) {
					this._cachedValues[i] = value.value;
				}
				else {
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
}

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

Sequence.prototype.tryGetEffectiveBooleanValue = function () {
	const iterator = this.value();
	const firstValue = iterator.next();
	if (!firstValue.ready) {
		return { ready: false, promise: firstValue.promise };
	}
	if (firstValue.done) {
		return { ready: true, value: false };
	}
	if (isSubtypeOf(firstValue.value.type, 'node()')) {
		return { ready: true, value: true };
	}
	const secondValue = iterator.next();
	if (!secondValue.ready) {
		return { ready: false, promise: secondValue.promise };
	}

	if (!secondValue.done) {
		throw new Error('FORG0006: A wrong argument type was specified in a function call.');
	}
	return { ready: true, value: getEffectiveBooleanValue(firstValue.value) };
};

Sequence.prototype.tryGetLength = function () {
	if (this._length !== null) {
		return { ready: true, value: this._length };
	}
	const iterator = this.value();
	let val = iterator.next();
	while (val.ready && !val.done) {
		val = iterator.next();
	}
	if (val.done) {
		return { ready: true, value: this._length };
	}
	return { ready: false, promise: val.promise };;
};

Sequence.prototype.tryGetFirst = function () {
	const iterator = this.value();
	const firstValue = iterator.next();
	if (!firstValue.ready) {
		return { ready: false, promise: firstValue.promise };
	}
	if (firstValue.done) {
		return { ready: true, value: null };
	}
	return { ready: true, value: firstValue.value };
};

Sequence.prototype.first = function () {
	if (this._cachedValues[0] !== undefined) {
		return this._cachedValues[0];
	}
	const value = this.value().next();
	return value.done ? null : value.value;
};

Sequence.prototype.map = function (callback) {
	let i = -1;
	/**
	 * @type {!Iterator<!./Value>}
	 */
	const iterator = this.value();
	return new Sequence(/** @type {!Iterator<!./Value>} */ ({
		next: () => {
			i++;
			const value = iterator.next();
			if (value.done) {
				return value;
			}
			if (!value.ready) {
				return value;
			}
			return {
				done: false,
				ready: true,
				value: callback(value.value, i, this)
			};
		}
	}), this._length);
};

Sequence.prototype.filter = function (callback) {
	let i = -1;
	/**
	 * @type {!Iterator<!./Value>}
	 */
	const iterator = this.value();

	return new Sequence(/** @type {!Iterator<!./Value>} */ ({
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
	}));
};

Sequence.prototype.mapAll = function (cb) {
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
		mappedResultsIterator = cb(allResults).value();
		isReady = true;
	})();
	return new Sequence({
		next: () => {
			if (!isReady) {
				return { ready: false, promise: readyPromise, done: false };
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

Sequence.prototype.getLength = function (keepItems = true) {
	if (this._length !== null) {
		return this._length;
	}
	let length = 0;

	const iterator = this.value();
	let item = iterator.next();
	while (!item.done) {
		if (keepItems) {
			this._cachedValues[length] = item.value;
		}
		length++;
		item = iterator.next();
	}
	this._length = length;
	return length;
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
 * @param  {{empty: function():}}
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
					if (value.done) {
						resultIterator = cases.empty(this).value();
					}
					else {
						resultIterator = cases.default(this).value();
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

					switch (scanIteration) {
						case 0: {
							resultIterator = (cases.empty || cases.default)(this).value();
							break;
						}
						case 1: {
							resultIterator = (cases.singleton || cases.default)(this).value();
							break;
						}
						default: {
							resultIterator = (cases.multiple || cases.default)(this).value();
							break;
						}
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
			next: () => DONE_VALUE
		}
	);
}
EmptySequence.prototype.getEffectiveBooleanValue = () => false;
EmptySequence.prototype.first = () => null;
EmptySequence.prototype.isEmpty = () => true;
EmptySequence.prototype.getAllValues = () => [];
EmptySequence.prototype.getLength = () => 0;
EmptySequence.prototype.isSingleton = () => false;
EmptySequence.prototype.mapAll = cb => cb([]);
EmptySequence.prototype.tryGetFirst = () => ({ ready: true, value: null });
EmptySequence.prototype.tryGetLength = () => ({ ready: true, value: 0 });
EmptySequence.prototype.tryGetEffectiveBooleanValue = function () {
	return { ready: true, value: this.getEffectiveBooleanValue() };
};
EmptySequence.prototype.expandSequence = function () {
	return this;
};
EmptySequence.prototype.switchCases = function (cases) {
	return (cases.empty || cases.default)(this);
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
					return DONE_VALUE;
				}
				hasPassed = true;
				return { done: false, ready: true, value: onlyValue };
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
	return { ready: true, value: this.getEffectiveBooleanValue() };
};
SingletonSequence.prototype.first = function () {
	return this._onlyValue;
};
SingletonSequence.prototype.getAllValues = function () {
	return [this._onlyValue];
};
SingletonSequence.prototype.isEmpty = () => false;
SingletonSequence.prototype.tryGetFirst = function () {
	return { ready: true, value: this._onlyValue };
};
SingletonSequence.prototype.tryGetLength = function () {
	return { ready: true, value: 1 };
};
SingletonSequence.prototype.getLength = () => 1;
SingletonSequence.prototype.isSingleton = () => true;
SingletonSequence.prototype.atomize = function (dynamicContext) {
	return new SingletonSequence(atomize(this._onlyValue, dynamicContext));
};
SingletonSequence.prototype.filter = function (cb) {
	if (cb(this._onlyValue, 0, this)) {
		return this;
	}
	return emptySequence;
};
SingletonSequence.prototype.map = function (cb) {
	return new SingletonSequence(cb(this._onlyValue, 0, this));
};
SingletonSequence.prototype.mapAll = function (cb) {
	return cb([this._onlyValue], 0, this);
};
SingletonSequence.prototype.expandSequence = function () {
	return this;
};
SingletonSequence.prototype.switchCases = function (cases) {
	return (cases.singleton || cases.default)(this);
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
					return DONE_VALUE;
				}
				return { done: false, ready: true, value: values[i] };
			}
		};
	};

	this._values = values;
}
ArrayBackedSequence.prototype.isEmpty = () => false;
ArrayBackedSequence.prototype.tryGetFirst = function () {
	return { ready: true, value: this._values[0] };
};
ArrayBackedSequence.prototype.tryGetLength = function () {
	return { ready: true, value: this._values.length };
};
ArrayBackedSequence.prototype.tryGetEffectiveBooleanValue = function () {
	return { ready: true, value: this.getEffectiveBooleanValue() };
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
ArrayBackedSequence.prototype.filter = function (cb) {
	let i = -1;
	return new Sequence(/** @type {!Iterator<!./Value>} */ ({
		next: () => {
			i++;
			while (i < this._values.length && !cb(this._values[i], i, this)) {
				i++;
			}

			if (i >= this._values.length) {
				return DONE_VALUE;
			}

			return { done: false, ready: true, value: this._values[i] };
		}
	}));
};
ArrayBackedSequence.prototype.map = function (cb) {
	let i = -1;
	return new Sequence(/** @type {!Iterator<!./Value>} */ ({
		next: () => {
			i++;
			if (i >= this._values.length) {
				return DONE_VALUE;
			}
			return { done: false, ready: true, value: cb(this._values[i], i, this) };
		}
	}));
};
ArrayBackedSequence.prototype.mapAll = function (cb) {
	return cb(this._values);
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
	return (cases.multiple || cases.default)(this);
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
