import Item from './Item';
import NodeValue from './NodeValue';

/**
 * @constructor
 * @extends {Item<function() : Generator<Item>>}
 * @param  {Array<Item> | function() : Generator<Item>=}  initialValues
 * @param  {?number=}  predictedLength
 */
function Sequence (initialValues, predictedLength = null) {
	if (Array.isArray(initialValues)) {
		predictedLength = initialValues.length;
		const _initialValues = initialValues;
		initialValues = () => {
			let i = -1;
			return {
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => {
					i++;
					if (i >= predictedLength) {
						return { done: true };
					}

					return {
						done: false,
						value: _initialValues[i]
					};
				}
			};
		};
	}
	else {
		const _initialValues = initialValues;
		initialValues = () => {
			if (this._iteratorHasProgressed) {
				throw new Error('Double iteration');
			}
			this._valueIterator = this._valueIterator || _initialValues();
			let i = -1;
			return {
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => {
					i++;
					if (this._length !== null && i >= this._length) {
						return { done: true };
					}
					if (this._cachedValues[i]) {
						return {
							done: false,
							value: this._cachedValues[i]
						};
					}

					if (i === 0) {
						const first = this._valueIterator.next();
						if (first.done) {
							this._length = 0;
							return first;
						}
						this._cachedValues[0] = first.value;
						return first;
					}
					if (i === 1) {
						const second = this._valueIterator.next();
						if (second.done) {
							this._length = 1;
							return second;
						}
						this._cachedValues[1] = second.value;
						return second;
					}

					this._iteratorHasProgressed = true;
					const value = this._valueIterator.next();
					if (value.done) {
						this._length = i;
					}
					return value;
				}
			};
		};
	}
    Item.call(this, initialValues || []);

	this._length = predictedLength;

	this._iteratorHasProgressed = false;

	this._cachedValues = [];
}

Sequence.prototype = Object.create(Item.prototype);

Sequence.prototype.first = function () {
	const iterator = this.value()[Symbol.iterator]();
	const value = iterator.next();
	return value.done ? null : value.value;
};

Sequence.prototype.map = function (callback) {
	const iterator = this.value()[Symbol.iterator]();
	return new Sequence(
		() => ({
			[Symbol.iterator]: function () {
				return this;
			},
			next: () => {
				const value = iterator.next();
				if (value.done) {
					return value;
				}
				return {
					value: callback(value.value),
					done: false
				};
			}
		}),
		this._length
	);
};

Sequence.prototype.filter = function (callback) {
	return new Sequence(
		() => {
			let i = -1;
			const iterator = this.value()[Symbol.iterator]();

			return {
				[Symbol.iterator]: function () {
					return this;
				},
				next: () => {
					i++;
					let value = iterator.next();
					while (!value.done && !callback(value.value, i, this)) {
						i++;
						value = iterator.next();
					}
					return value;
				}
			};
		});
};

/**
 * @param  {!../DynamicContext} dynamicContext
 * @return {!Sequence}
 */
Sequence.prototype.atomize = function (dynamicContext) {
    return this.map(value => value.atomize(dynamicContext));
};

Sequence.prototype.isEmpty = function () {
	const iterator = this.value()[Symbol.iterator]();
	const value = iterator.next();
	return value.done;
};

Sequence.prototype.isSingleton = function () {
	const iterator = this.value()[Symbol.iterator]();
	let value = iterator.next();
	if (value.done) {
		return false;
	}
	value = iterator.next();
	return value.done;
};

Sequence.prototype.getLength = function () {
	if (this._length !== null) {
		return this._length;
	}
	let length = 0;
	const iterator = this.value();
	let item = iterator.next();
	while (!item.done) {
		this._cachedValues[length] = item.value;
		length++;
		item = iterator.next();
	}
	return length;
};


Sequence.prototype.instanceOfType = function (type) {
	let isEmpty = true;
	for (const valueItem of this.value()) {
		isEmpty = false;
		if (!valueItem.instanceOfType(type)) {
			return false;
		}
	}
	return !isEmpty;
};

Sequence.prototype.getEffectiveBooleanValue = function () {
	const iterator = this.value();
	const firstValue = iterator.next();
	if (firstValue.done) {
		return false;
	}
	if (firstValue.value instanceof NodeValue) {
		return true;
	}
	const secondValue = iterator.next();
	if (!secondValue.done) {
		throw new Error('FORG0006: A wrong argument type was specified in a function call.');
	}
	return firstValue.value.getEffectiveBooleanValue();
};

/**
 * @extends Sequence
 */
function EmptySequence () {
	Item.call(this, () => ({
		next: () => ({ done: true })
	}));
}
EmptySequence.prototype.getEffectiveBooleanValue = () => false;
EmptySequence.prototype.instanceOfType = () => false;
EmptySequence.prototype.first = () => null;
EmptySequence.prototype.isEmpty = () => true;
EmptySequence.prototype.getLength = () => 0;
EmptySequence.prototype.isSingleton = () => false;
EmptySequence.prototype.atomize = EmptySequence.prototype.filter = EmptySequence.prototype.map = () => emptySequence;
const emptySequence = new EmptySequence();

/**
 * @extends Sequence
 */
function SingletonSequence (onlyValue) {
	Item.call(this, () => {
		let hasPassed = false;
		return {
			[Symbol.iterator]: function () { return this; },
			next: () => {
				if (hasPassed) {
					return { done: true };
				}
				hasPassed = true;
				return { done: false, value: onlyValue };
			}
		};
	});
	this._onlyValue = onlyValue;
}
SingletonSequence.prototype.getEffectiveBooleanValue = function () {
	return this._onlyValue.getEffectiveBooleanValue();
};
SingletonSequence.prototype.instanceOfType = function (type) {
	return this._onlyValue.instanceOfType(type);
};
SingletonSequence.prototype.first = function () {
	return this._onlyValue;
};
SingletonSequence.prototype.isEmpty = () => false;
SingletonSequence.prototype.getLength = () => 1;
SingletonSequence.prototype.isSingleton = () => true;
SingletonSequence.prototype.atomize = function (dynamicContext) {
	return new SingletonSequence(this._onlyValue.atomize(dynamicContext));
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

/**
 * @param   {!Item}  value
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


export default Sequence;
