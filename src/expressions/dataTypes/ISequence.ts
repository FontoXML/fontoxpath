import Value from "./Value";
import { AsyncIterator, AsyncResult } from "../util/iterators";

export default interface ISequence {
	value: AsyncIterator<Value>;

	expandSequence (): ISequence;
	tryGetAllValues (): AsyncResult<Array<Value>>;
	tryGetEffectiveBooleanValue(): AsyncResult<boolean>;
	tryGetFirst (): AsyncResult<Value|null>;
	tryGetLength(onlyIfCheap: boolean): AsyncResult<number>;
}
