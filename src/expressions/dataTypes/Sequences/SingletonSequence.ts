import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import Value from '../Value';
import SequenceFactory from '../SequenceFactory';
import ExecutionParameters from '../../ExecutionParameters';
import atomize from '../atomize';

export default class SingletonSequence implements ISequence {
	value: AsyncIterator<Value>;

	private _effectiveBooleanValue: boolean;

	constructor(
		private readonly _sequenceFactory: typeof SequenceFactory,
		private readonly _onlyValue: Value
	) {
		let hasPassed = false;
		this.value = {
			next: () => {
				if (hasPassed) {
					return DONE_TOKEN;
				}
				hasPassed = true;
				return ready(_onlyValue);
			}
		};
		this._effectiveBooleanValue = null;
	}

	atomize(executionParameters: ExecutionParameters): ISequence {
		return this.map(value => atomize(value, executionParameters));
	}

	expandSequence(): ISequence {
		return this;
	}

	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		return callback(this._onlyValue, 0, this) ? this : this._sequenceFactory.create();
	}

	first(): Value | null {
		return this._onlyValue;
	}

	getAllValues(): Value[] {
		return [this._onlyValue];
	}

	getEffectiveBooleanValue(): boolean {
		if (this._effectiveBooleanValue === null) {
			this._effectiveBooleanValue = getEffectiveBooleanValue(this._onlyValue);
		}
		return this._effectiveBooleanValue;
	}

	isEmpty(): boolean {
		return false;
	}

	isSingleton(): boolean {
		return true;
	}

	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		return this._sequenceFactory.create(callback(this._onlyValue, 0, this));
	}

	mapAll(callback: (allValues: Value[]) => ISequence): ISequence {
		return callback([this._onlyValue]);
	}

	switchCases(cases: SwitchCasesCases): ISequence {
		if (cases.singleton) {
			return cases.singleton(this);
		}
		return cases.default(this);
	}

	tryGetAllValues(): AsyncResult<Value[]> {
		return ready(this.getAllValues());
	}

	tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		return ready(this.getEffectiveBooleanValue());
	}

	tryGetFirst(): AsyncResult<Value> {
		return ready(this.first());
	}

	tryGetLength(): AsyncResult<number> {
		return ready(1);
	}
}
