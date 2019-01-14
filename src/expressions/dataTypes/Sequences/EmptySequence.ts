import ExecutionParameters from '../../ExecutionParameters';
import { AsyncIterator, AsyncResult, DONE_TOKEN, ready } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import Value from '../Value';

export default class EmptySequence implements ISequence {
	public value: AsyncIterator<Value>;

	constructor() {
		this.value = {
			next: () => DONE_TOKEN
		};
	}

	public atomize(_executionParameters: ExecutionParameters): ISequence {
		return this;
	}

	public expandSequence(): ISequence {
		return this;
	}

	public filter(_callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		return this;
	}

	public first(): Value | null {
		return null;
	}

	public getAllValues(): Value[] {
		return [];
	}

	public getEffectiveBooleanValue(): boolean {
		return false;
	}

	public isEmpty(): boolean {
		return true;
	}

	public isSingleton(): boolean {
		return false;
	}

	public map(_callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		return this;
	}

	public mapAll(callback: (allValues: Value[]) => ISequence): ISequence {
		return callback([]);
	}

	public switchCases(cases: SwitchCasesCases): ISequence {
		if (cases.empty) {
			return cases.empty(this);
		}
		return cases.default(this);
	}

	public tryGetAllValues(): AsyncResult<Value[]> {
		return ready(this.getAllValues());
	}

	public tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		return ready(this.getEffectiveBooleanValue());
	}

	public tryGetFirst(): AsyncResult<Value> {
		return ready(this.first());
	}

	public tryGetLength(): AsyncResult<number> {
		return ready(0);
	}
}
