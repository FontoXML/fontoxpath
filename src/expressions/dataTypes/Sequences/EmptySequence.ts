import { DONE_TOKEN, IIterator } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import Value from '../Value';

export default class EmptySequence implements ISequence {
	public value: IIterator<Value>;

	constructor() {
		this.value = {
			next: () => DONE_TOKEN,
		};
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

	public getLength(): number {
		return 0;
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
}
