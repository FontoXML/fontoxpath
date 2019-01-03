import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from "../../util/iterators";
import ISequence from "../ISequence";
import getEffectiveBooleanValue from "./getEffectiveBooleanValue";
import Value from "../Value";

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

	tryGetAllValues(): AsyncResult<Array<Value>> {
		return ready([this._onlyValue]);
	}

	tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		if (this._effectiveBooleanValue === null) {
			this._effectiveBooleanValue = getEffectiveBooleanValue(this._onlyValue);
		}
		return ready(this._effectiveBooleanValue);
	}

	tryGetFirst(): AsyncResult<Value> {
		return ready(this._onlyValue);
	}

	tryGetLength(): AsyncResult<number> {
		return ready(1);
	}
}
