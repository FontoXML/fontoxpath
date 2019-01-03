import { trueBoolean, falseBoolean } from './createAtomicValue';
import Value from './Value';
import { AsyncIterator } from '../util/iterators';
import EmptySequence from './Sequences/EmptySequence';
import ISequence from './ISequence';
import SingletonSequence from './Sequences/SingletonSequence';
import ArrayBackedSequence from './Sequences/ArrayBackedSequence';
import IteratorBackedSequence from './Sequences/IteratorBackedSequence';

const emptySequence = new EmptySequence();

export default class SequenceFactory {
	static create(value: Value | Array<Value> | AsyncIterator<Value> = null, predictedLength = null): ISequence {
		if (value === null) {
			return emptySequence;
		}
		if (Array.isArray(value)) {
			switch (value.length) {
				case 0:
					return emptySequence;
				case 1:
					return new SingletonSequence(value[0]);
				default:
					return new ArrayBackedSequence(value);
			}
		}

		if ((<AsyncIterator<Value>>value).next) {
			return new IteratorBackedSequence(<AsyncIterator<Value>>value, predictedLength);
		}
		return new SingletonSequence((<Value>value));
	}

	static singleton(value: Value) {
		return new SingletonSequence(value);
	}

	static empty() {
		return this.create();
	}

	static singletonTrueSequence() {
		return this.create(trueBoolean);
	}

	static singletonFalseSequence() {
		return this.create(falseBoolean);
	}
}
