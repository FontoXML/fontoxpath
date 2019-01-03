import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from '../../util/iterators';
import ISequence from '../ISequence';
import Value from '../Value';

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

	first(): Value | null {
		return null;
	}

	getAllValues(): Array<Value> {
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
		return ready(0);
	}
}
