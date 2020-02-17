import { DONE_TOKEN, IAsyncIterator, IAsyncResult, ready } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import sequenceFactory from '../sequenceFactory';
import Value from '../Value';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';

export default class SingletonSequence implements ISequence {
	public value: IAsyncIterator<Value>;

	private _effectiveBooleanValue: boolean;

	constructor(
		private readonly _sequenceFactory: typeof sequenceFactory,
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

	public expandSequence(): ISequence {
		return this;
	}

	public filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		return callback(this._onlyValue, 0, this) ? this : this._sequenceFactory.create();
	}

	public first(): Value | null {
		return this._onlyValue;
	}

	public getAllValues(): Value[] {
		return [this._onlyValue];
	}

	public getEffectiveBooleanValue(): boolean {
		if (this._effectiveBooleanValue === null) {
			this._effectiveBooleanValue = getEffectiveBooleanValue(this._onlyValue);
		}
		return this._effectiveBooleanValue;
	}

	public isEmpty(): boolean {
		return false;
	}

	public isSingleton(): boolean {
		return true;
	}

	public map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		return this._sequenceFactory.create(callback(this._onlyValue, 0, this));
	}

	public mapAll(callback: (allValues: Value[]) => ISequence): ISequence {
		return callback([this._onlyValue]);
	}

	public switchCases(cases: SwitchCasesCases): ISequence {
		if (cases.singleton) {
			return cases.singleton(this);
		}
		return cases.default(this);
	}

	public tryGetAllValues(): IAsyncResult<Value[]> {
		return ready(this.getAllValues());
	}

	public tryGetEffectiveBooleanValue(): IAsyncResult<boolean> {
		return ready(this.getEffectiveBooleanValue());
	}

	public tryGetFirst(): IAsyncResult<Value> {
		return ready(this.first());
	}

	public tryGetLength(): IAsyncResult<number> {
		return ready(1);
	}
}
