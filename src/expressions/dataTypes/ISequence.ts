import Value from './Value';
import { AsyncIterator, AsyncResult } from '../util/iterators';
import ExecutionParameters from '../ExecutionParameters';

// https://github.com/Microsoft/TypeScript/issues/14094
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type SwitchCasesCases = XOR<XOR<XOR<
	{
		empty: (sequence: ISequence) => ISequence;
		default: (sequence: ISequence) => ISequence;
	},
	{
		singleton: (sequence: ISequence) => ISequence;
		default: (sequence: ISequence) => ISequence;
	}>,
	{
		multiple: (sequence: ISequence) => ISequence;
		default: (sequence: ISequence) => ISequence;
	}>,
	{
		empty: (sequence: ISequence) => ISequence;
		singleton: (sequence: ISequence) => ISequence;
		multiple: (sequence: ISequence) => ISequence;
	}>;

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
