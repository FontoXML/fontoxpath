import Value from './Value';
import { AsyncIterator, AsyncResult } from '../util/iterators';
import ExecutionParameters from '../ExecutionParameters';

type SwitchCasesCaseEmpty = {
	singleton?: undefined;
	multiple?: undefined;
	empty: (sequence: ISequence) => ISequence;
	default: (sequence: ISequence) => ISequence;
};
type SwitchCasesCaseSingleton = {
	empty?: undefined,
	multiple?: undefined;
	singleton: (sequence: ISequence) => ISequence;
	default: (sequence: ISequence) => ISequence;
};

type SwitchCasesCaseMultiple = {
	empty?: undefined,
	singleton?: undefined;
	multiple: (sequence: ISequence) => ISequence;
	default: (sequence: ISequence) => ISequence;
};

type SwitchCasesCaseAll = {
	default?: undefined;
	empty: (sequence: ISequence) => ISequence;
	singleton: (sequence: ISequence) => ISequence;
	multiple: (sequence: ISequence) => ISequence;
};

export type SwitchCasesCases = SwitchCasesCaseEmpty | SwitchCasesCaseMultiple | SwitchCasesCaseSingleton | SwitchCasesCaseAll;

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
	tryGetLength(onlyIfCheap?: boolean): AsyncResult<number>;
}
