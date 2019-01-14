import ExecutionParameters from '../ExecutionParameters';
import { AsyncIterator, AsyncResult } from '../util/iterators';
import Value from './Value';

type SwitchCasesCaseEmpty = {
	default: (sequence: ISequence) => ISequence;
	empty: (sequence: ISequence) => ISequence;
	multiple?: undefined;
	singleton?: undefined;
};
type SwitchCasesCaseSingleton = {
	default: (sequence: ISequence) => ISequence;
	empty?: undefined;
	multiple?: undefined;
	singleton: (sequence: ISequence) => ISequence;
};

type SwitchCasesCaseMultiple = {
	default: (sequence: ISequence) => ISequence;
	empty?: undefined;
	multiple: (sequence: ISequence) => ISequence;
	singleton?: undefined;
};

type SwitchCasesCaseAll = {
	default?: undefined;
	empty: (sequence: ISequence) => ISequence;
	multiple: (sequence: ISequence) => ISequence;
	singleton: (sequence: ISequence) => ISequence;
};

export type SwitchCasesCases =
	| SwitchCasesCaseEmpty
	| SwitchCasesCaseMultiple
	| SwitchCasesCaseSingleton
	| SwitchCasesCaseAll;

export default interface ISequence {
	value: AsyncIterator<Value>;

	atomize(executionParameters: ExecutionParameters): ISequence;
	expandSequence(): ISequence;
	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence;

	first(): Value | null;
	getAllValues(): Value[];
	getEffectiveBooleanValue(): boolean;

	isEmpty(): boolean;
	isSingleton(): boolean;
	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence;
	mapAll(callback: (allValues: Value[]) => ISequence): ISequence;
	switchCases(cases: SwitchCasesCases): ISequence;

	tryGetAllValues(): AsyncResult<Value[]>;
	tryGetEffectiveBooleanValue(): AsyncResult<boolean>;
	tryGetFirst(): AsyncResult<Value | null>;
	tryGetLength(onlyIfCheap?: boolean): AsyncResult<number>;
}
