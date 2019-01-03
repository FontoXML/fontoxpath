import isSubtypeOf from '../isSubtypeOf';
import { DONE_TOKEN, ready, AsyncIterator, AsyncResult } from '../../util/iterators';
import Value from '../Value';
import ISequence from '../ISequence';
import { errFORG0006 } from '../../functions/FunctionOperationErrors';

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

	first(): Value | null {
		return this._values[0];
	}

	getAllValues(): Array<Value> {
		return this._values;
	}

	getEffectiveBooleanValue(): boolean {
		if (isSubtypeOf(this._values[0].type, 'node()')) {
			return true;
		}
		// We always have a length > 1, or we'd be a singletonSequence
		throw errFORG0006();
	}

	isEmpty(): boolean {
		return false;
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
		return ready(this._values.length);
	}
}
