import isSubtypeOf from '../isSubtypeOf';
import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from '../../util/iterators';
import Value from '../Value';
import ISequence, { SwitchCasesCases } from '../ISequence';
import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import SequenceFactory from '../SequenceFactory';
import ExecutionParameters from '../../ExecutionParameters';
import atomize from '../atomize';

export default class ArrayBackedSequence implements ISequence {
	value: AsyncIterator<Value>;

	constructor(
		private readonly _sequenceFactory: typeof SequenceFactory,
		private readonly _values: Array<Value>) {
		let i = -1;
		this.value = {
			next: () => {
				i++;
				if (i >= _values.length) {
					return DONE_TOKEN;
				}
				return ready(_values[i]);
			}
		};
	}

	atomize(executionParameters: ExecutionParameters): ISequence {
		return this.map(value => atomize(value, executionParameters));
	}

	expandSequence(): ISequence {
		return this;
	}

	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		let i = -1;
		return this._sequenceFactory.create({
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

	first(): Value | null {
		return this._values[0];
	}

	getAllValues(): Array<Value> {
		return this._values;
	}

	getEffectiveBooleanValue(): boolean {
		if (isSubtypeOf(this._values[0].type, 'node()')) {
			return true;
		}
		// We always have a length > 1, or we'd be a singletonSequence
		throw errFORG0006();
	}

	isEmpty(): boolean {
		return false;
	}

	isSingleton(): boolean {
		return false;
	}

	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		let i = -1;
		return this._sequenceFactory.create({
			next: () => {
				return ++i >= this._values.length ?
					DONE_TOKEN :
					ready(callback(this._values[i], i, this));
			}
		}, this._values.length);
	}

	mapAll(callback: (allValues: Array<Value>) => ISequence): ISequence {
		return callback(this._values);
	}

	switchCases(cases: SwitchCasesCases): ISequence {
		if (cases.multiple) {
			return (cases.multiple(this));
		}
		return (cases.default(this));
	}

	tryGetAllValues(): AsyncResult<Array<Value>> {
		return ready(this.getAllValues());
	}

	tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		return ready(this.getEffectiveBooleanValue());
	}

	tryGetFirst(): AsyncResult<Value> {
		return ready(this.first());
	}

	tryGetLength(): AsyncResult<number> {
		return ready(this._values.length);
	}
}