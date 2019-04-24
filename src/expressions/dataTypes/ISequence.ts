import ExecutionParameters from '../ExecutionParameters';
import { IAsyncIterator, IAsyncResult, IterationHint } from '../util/iterators';
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
	value: IAsyncIterator<Value>;

	atomize(executionParameters: ExecutionParameters): ISequence;
	expandSequence(): ISequence;
	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence;

	first(): Value | null;
	getAllValues(): Value[];
	getEffectiveBooleanValue(): boolean;

	isEmpty(): boolean;
	isSingleton(): boolean;
	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence;
	mapAll(callback: (allValues: Value[]) => ISequence, hint?: IterationHint): ISequence;
	switchCases(cases: SwitchCasesCases): ISequence;

	tryGetAllValues(): IAsyncResult<Value[]>;
	tryGetEffectiveBooleanValue(): IAsyncResult<boolean>;
	tryGetFirst(): IAsyncResult<Value | null>;
	tryGetLength(onlyIfCheap?: boolean): IAsyncResult<number>;
}
