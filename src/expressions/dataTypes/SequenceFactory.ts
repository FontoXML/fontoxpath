import { trueBoolean, falseBoolean } from './createAtomicValue';
import Value from './Value';
import { AsyncIterator } from '../util/iterators';
import EmptySequence from './Sequences/EmptySequence';
import ISequence from './ISequence';
import SingletonSequence from './Sequences/SingletonSequence';
import ArrayBackedSequence from './Sequences/ArrayBackedSequence';
import IteratorBackedSequence from './Sequences/IteratorBackedSequence';

const emptySequence = new EmptySequence();

function create(value: Value | Value[] | AsyncIterator<Value> = null, predictedLength: number = null): ISequence {
	if (value === null) {
		return emptySequence;
	}
	if (Array.isArray(value)) {
		switch (value.length) {
			case 0:
				return emptySequence;
			case 1:
				return new SingletonSequence(sequenceFactory, value[0]);
			default:
				return new ArrayBackedSequence(sequenceFactory, value);
		}
	}

	if ((<AsyncIterator<Value>>value).next) {
		return new IteratorBackedSequence(sequenceFactory, <AsyncIterator<Value>>value, predictedLength);
	}
	return new SingletonSequence(sequenceFactory, (<Value>value));
}

const sequenceFactory = {
	create: create,

	singleton: (value: Value): ISequence => {
		return new SingletonSequence(sequenceFactory, value);
	},

	empty: () => {
		return create();
	},

	singletonTrueSequence: () => {
		return create(trueBoolean);
	},

	singletonFalseSequence: () => {
		return create(falseBoolean);
	}
};

export default sequenceFactory;