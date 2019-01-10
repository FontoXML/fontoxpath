import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import Value from '../Value';
import ExecutionParameters from '../../ExecutionParameters';

export default class EmptySequence implements ISequence {
	value: AsyncIterator<Value>;

	constructor() {
		this.value = {
			next: () => DONE_TOKEN
		};
	}

	atomize(_executionParameters: ExecutionParameters): ISequence {
		return this;
	}

	expandSequence(): ISequence {
		return this;
	}

	filter(_callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		return this;
	}

	first(): Value | null {
		return null;
	}

	getAllValues(): Value[] {
		return [];
	}

	getEffectiveBooleanValue(): boolean {
		return false;
	}

	isEmpty(): boolean {
		return true;
	}

	isSingleton(): boolean {
		return false;
	}

	map(_callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		return this;
	}

	mapAll(callback: (allValues: Value[]) => ISequence): ISequence {
		return callback([]);
	}

	switchCases(cases: SwitchCasesCases): ISequence {
		if (cases.empty) {
			return cases.empty(this);
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
		return ready(0);
	}
}
