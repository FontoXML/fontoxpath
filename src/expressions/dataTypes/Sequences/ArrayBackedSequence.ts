import isSubtypeOf from "../isSubtypeOf";
import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from "../../util/iterators";
import Value from "../Value";
import ISequence from "../ISequence";
import { errFORG0006 } from "../../functions/FunctionOperationErrors";

export default class ArrayBackedSequence implements ISequence {
	value: AsyncIterator<Value>;

	constructor(private readonly _values: Array<Value>) {
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

	expandSequence(): ISequence {
		return this;
	}

	tryGetAllValues(): AsyncResult<Array<Value>> {
		return ready(this._values);
	}

	tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		if (isSubtypeOf(this._values[0].type, "node()")) {
			return ready(true);
		}
		// We always have a length > 1, or we'd be a singletonSequence
		throw errFORG0006();
	}

	tryGetFirst(): AsyncResult<Value> {
		return ready(this._values[0]);
	}

	tryGetLength(): AsyncResult<number> {
		return ready(this._values.length);
	}
}
