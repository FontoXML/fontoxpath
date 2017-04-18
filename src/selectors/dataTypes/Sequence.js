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
		const _initialValues = initialValues;
		initialValues = function* () {
			for (let i = 0, l = _initialValues.length; i < l; ++i) {
				yield _initialValues[i];
			}
		};
	}
	else {
		const _initialValues = initialValues;
		initialValues = () => {
			if (this._iteratorHasProgressed) {
				throw new Error('Double iteration');
			}
			this._valueIterator = this._valueIterator || _initialValues();
			let hasPassedFirst = false;
			let hasPassedSecond = false;
			return {
				[Symbol.iterator]: function () { return this; },
				next: () => {
					if (!hasPassedFirst) {
						hasPassedFirst = true;
						if (!this._first) {
							const first = this._valueIterator.next();
							if (first.done) {
								this._first = null;
								return { done: true };
							}
							this._first = first.value;
						}

						return {
							done: false,
							value: this._first
						};
					}

					if (!hasPassedSecond) {
						hasPassedSecond = true;
						if (!this._second) {
							const second = this._valueIterator.next();
							if (second.done) {
								this._second = null;
								return { done: true };
							}
							this._second = second.value;
						}
						return {
							done: false,
							value: this._second
						};
					}

					this._iteratorHasProgressed = true;
					return this._valueIterator.next();
				}
			};
		};
	}
    Item.call(this, initialValues || []);

	this._isEmpty = null;
	this._isSingleton = null;
	this._length = predictedLength;

			this._first = undefined;
	this._second = undefined;
	this._valueIterator = null;
	this._iteratorHasProgressed = false;
}

Sequence.prototype = Object.create(Item.prototype);

/**
 * @param   {!Item}  value
 * @return  {!Sequence}
 */
Sequence.singleton = function (value) {
    return new Sequence([value], 1);
};

/**
 * @return  {!Sequence}
 */
Sequence.empty = function () {
	return new Sequence([], 0);
};

Sequence.prototype.first = function () {
	if (this._first !== undefined) {
		return this._first;
	}
	const iterator = this.value()[Symbol.iterator]();
	const value = iterator.next();
	this._first = value.done ? null : value.value;
	return this._first;
};

Sequence.prototype.map = function (callback) {
	const iterator = this.value()[Symbol.iterator]();
	return new Sequence(
		() => ({
			[Symbol.iterator]: function () { return this; },
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
	const iterator = this.value()[Symbol.iterator]();
	let i = 0;
	return new Sequence(
		() => ({
			[Symbol.iterator]: function () { return this; },
			next: () => {
				let value = iterator.next();
				while (!value.done) {
					if (callback(value.value, i)) {
						i++;
						return value;
					}
					value = iterator.next();
					i++;
				}
				return value;
			}
		})
	);
};

/**
 * @param  {!../DynamicContext} dynamicContext
 * @return {!Sequence}
 */
Sequence.prototype.atomize = function (dynamicContext) {
    return new Sequence(Array.from(this.value()).map(value => value.atomize(dynamicContext)));
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
	this._length = 0;
	for (const _value of this.value()) {
		this._length++;
	}
	return this._length;
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
	if (this._isEmpty === true) {
		return false;
	}

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

export default Sequence;
