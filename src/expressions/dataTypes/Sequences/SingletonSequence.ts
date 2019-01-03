import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from '../../util/iterators';
import ISequence from '../ISequence';
import getEffectiveBooleanValue from './getEffectiveBooleanValue';
import Value from '../Value';

export default class SingletonSequence implements ISequence {
	value: AsyncIterator<Value>;

	private _effectiveBooleanValue: boolean;

	constructor(private readonly _onlyValue: Value) {
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

	expandSequence(): ISequence {
		return this;
	}

	first(): Value | null {
		return this._onlyValue;
	}

	getAllValues(): Array<Value> {
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
		return ready(1);
	}
}
