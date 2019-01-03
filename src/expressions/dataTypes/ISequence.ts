import Value from './Value';
import { AsyncIterator, AsyncResult } from '../util/iterators';
import ExecutionParameters from '../ExecutionParameters';

export class SwitchCasesCases {
	empty: (sequence: ISequence) => ISequence;
	singleton?: (sequence: ISequence) => ISequence;
	multiple?: (sequence: ISequence) => ISequence;
	default?: (sequence: ISequence) => ISequence;
}

export default interface ISequence {
	value: AsyncIterator<Value>;

	atomize(executionParameters: ExecutionParameters): ISequence;
	expandSequence(): ISequence;
	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence;
	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence;
	mapAll(callback: (allValues: Array<Value>) => ISequence): ISequence;
	switchCases(cases: SwitchCasesCases): ISequence;

	first(): Value | null;
	getAllValues(): Array<Value>;
	getEffectiveBooleanValue(): boolean;

	isEmpty(): boolean;
	isSingleton(): boolean;

	tryGetAllValues(): AsyncResult<Array<Value>>;
	tryGetEffectiveBooleanValue(): AsyncResult<boolean>;
	tryGetFirst(): AsyncResult<Value | null>;
	tryGetLength(onlyIfCheap: boolean): AsyncResult<number>;
}
