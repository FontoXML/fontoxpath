import { falseBoolean } from "../createAtomicValue";
import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from "../../util/iterators";
import ISequence from "../ISequence";
import Value from "../Value";

export default class EmptySequence implements ISequence {
	value: AsyncIterator<Value>;

	constructor() {
		this.value = {
			next: () => DONE_TOKEN
		};
	}

	expandSequence(): ISequence {
		return this;
	}

	tryGetAllValues(): AsyncResult<Array<Value>> {
		return ready([]);
	}

	tryGetEffectiveBooleanValue(): AsyncResult<boolean> {
		return ready(falseBoolean);
	}

	tryGetFirst(): AsyncResult<Value> {
		return ready(null);
	}

	tryGetLength(): AsyncResult<number> {
		return ready(0);
	}
}
