define([
	'./Value',
	'./NodeValue'
], function (
	Value,
	NodeValue
) {
	'use strict';

	function Sequence (initialValues) {
		Value.call(this, initialValues || []);
	}

	Sequence.prototype = Object.create(Value.prototype);

	Sequence.singleton = function (value) {
		return new Sequence([value]);
	};

	Sequence.empty = function () {
		return new Sequence([]);
	};

	Sequence.prototype.atomize = function () {
		return new Sequence(this.value.map(function (value) {
			return value.atomize();
		}));
	};

	Sequence.prototype.isEmpty = function () {
		return this.value.length === 0;
	};

	Sequence.prototype.isSingleton = function () {
		return this.value.length === 1;
	};

	Sequence.prototype.getEffectiveBooleanValue = function () {
		if (this.isEmpty()) {
			return false;
		}

		if (this.value[0] instanceof NodeValue) {
			return true;
		}

		if (this.isSingleton()) {
			return this.value[0].getEffectiveBooleanValue();
		}

		throw new Error('FORG0006: A wrong argument type was specified in a function call.');
	};

	Sequence.prototype.merge = function (otherSequence) {
		this.value = this.value.concat(otherSequence.value);
		return this;
	};

	return Sequence;
});
