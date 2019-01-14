import { AsyncIterator } from '../util/iterators';
import { falseBoolean, trueBoolean } from './createAtomicValue';
import ISequence from './ISequence';
import ArrayBackedSequence from './Sequences/ArrayBackedSequence';
import EmptySequence from './Sequences/EmptySequence';
import IteratorBackedSequence from './Sequences/IteratorBackedSequence';
import SingletonSequence from './Sequences/SingletonSequence';
import Value from './Value';

const emptySequence = new EmptySequence();

function create(
	value: Value | Value[] | AsyncIterator<Value> = null,
	predictedLength: number = null
): ISequence {
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

	if ((value as AsyncIterator<Value>).next) {
		return new IteratorBackedSequence(
			sequenceFactory,
			value as AsyncIterator<Value>,
			predictedLength
		);
	}
	return new SingletonSequence(sequenceFactory, value as Value);
}

const sequenceFactory = {
	create,

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
