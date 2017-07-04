import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import atomize from './atomize';
import isSubtypeOf from './isSubtypeOf';
import { trueBoolean, falseBoolean } from './createAtomicValue';
/**
 * @const
 */
const DONE_VALUE = { done: true, ready: true, value: undefined };

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
	this.value = () => {
		const valueIterator = /** @type {!Iterator} */(valueIteratorOrArray);
		let i = 0;
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
					this._length = i;
					return value;
				}
				if (i < 2) {
					this._cachedValues[i] = value.value;
				}
				else {
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
	for (let val = iterator.next; !val.done; val = iterator.next()) {
		if (!val.ready) {
			throw new Error('infinite loop prevented');
		}
		values.push(val.value);
	}
	return values;
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
	let mappedResults;
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
		mappedResults = cb(allResults);
		isReady = true;
	})();
	return new Sequence({
		next: () => {
			if (!isReady) {
				return { ready: false, promise: readyPromise, done: false };
			}
			if (!mappedResults.length) {
				return DONE_VALUE;
			}
			return { done: false, ready: true, value: mappedResults.shift() };
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
Sequence.prototype.mapCases = function (cases) {
	const scanIterator = this.value();
	const returnIterator = this.value();
	let scanIteration = 0;
	const firstTwoValues = [];
	return new Sequence({
		next: () => {
			// We need to reach two iterations
			while (scanIteration < 3) {
				const value = scanIterator.next();
				if (!value.ready) {
					return value;
				}
				if (value.done) {
					break;
				}
				firstTwoValues.push(value.value);
				scanIteration++;
			}
			switch (scanIteration) {
				case 0:
					return cases.empty();
				case 1:
					const value = returnIterator.next();
					if (value.done || !value.ready) {
						return value;
					}
					return { done: false, ready: true, value: cases.singleton(this.first()) };
				default: {
					const value = returnIterator.next();
					if (value.done || !value.ready) {
						return value;
					}
					return { done: false, ready: true, value: cases.multiple(value.value) };
				}
			}
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
			next: () => (DONE_VALUE)
		}
	);
}
EmptySequence.prototype.getEffectiveBooleanValue = () => false;
EmptySequence.prototype.first = () => null;
EmptySequence.prototype.isEmpty = () => true;
EmptySequence.prototype.getAllValues = () => [];
EmptySequence.prototype.getLength = () => 0;
EmptySequence.prototype.isSingleton = () => false;
EmptySequence.prototype.expandSequence = function () {
	return this;
};

EmptySequence.prototype.mapCases = ({ empty }) => new Sequence({ next: empty });

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
SingletonSequence.prototype.first = function () {
	return this._onlyValue;
};
SingletonSequence.prototype.getAllValues = function () {
	return [this._onlyValue];
};
SingletonSequence.prototype.isEmpty = () => false;
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
	return new SingletonSequence(cb([this._onlyValue], 0, this));
};
SingletonSequence.prototype.expandSequence = function () {
	return this;
};
SingletonSequence.prototype.mapCases = function ({ singleton }) {
	return new SingletonSequence(singleton(this._onlyValue));
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
ArrayBackedSequence.prototype.getLength = function () {
	return this._values.length;
};
ArrayBackedSequence.prototype.atomize = function (dynamicContext) {
	return this.map(value => atomize(value, dynamicContext));
};
ArrayBackedSequence.prototype.expandSequence = function () {
	return this;
};
ArrayBackedSequence.prototype.mapCases = function ({ multiple }) {
	return this.map(multiple);
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
