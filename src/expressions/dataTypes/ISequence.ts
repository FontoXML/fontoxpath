import { IIterator, IterationHint } from '../util/iterators';
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

/**
 * A sequence is the central dataType in (Fonto)XPath: an ordered set of 'things'.
 *
 * @see sequenceFactory to create Sequences.
 */
export default interface ISequence {
	value: IIterator<Value>;

	expandSequence(): ISequence;

	/**
	 * Filter this sequence to a smaller one. this method takes care of async code and values that are not ready.
	 */
	filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence;

	/**
	 * Synchronously get the first value of this sequence. Prefer to use the tryGet* functions.
	 */
	first(): Value | null;

	/**
	 * Synchronously get all values of this sequence. Prefer to use the tryGet* functions
	 */
	getAllValues(): Value[];

	/**
	 * Synchronously get the effective boolean value of this sequence. Prefer to use the tryGet* functions
	 */
	getEffectiveBooleanValue(): boolean;

	/**
	 * Try to get the length of this sequence.
	 *
	 * @param onlyIfCheap In some cases, the length of a sequence is known. This can be used for optimization purposes.
	 */
	getLength(onlyIfCheap?: boolean): number;

	/**
	 * Synchronously get whether this sequence is empty. Prefer to use the tryGet* functions
	 */
	isEmpty(): boolean;

	/**
	 * Synchronously get whether this sequence is a singleton sequence. Prefer to use the tryGet* functions
	 */
	isSingleton(): boolean;

	/**
	 * Wait for a single item to be available and called for and map it.
	 */
	map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence;

	/**
	 * Map all items of this sequences to a new sequence. This functions waits for all items to be available before calling the callback.
	 *
	 * This can be used when ALL items are needed of this sequence before we can 'continue' with it.
	 *
	 * @param callback Called with all values in this Sequence, as a single array
	 * @param hint     Optional hint for optimization purposes
	 *
	 * @return A sequence that will yield all items of the sequence returned in the callback.
	 */
	mapAll(callback: (allValues: Value[]) => ISequence, hint?: IterationHint): ISequence;

	/**
	 * Determine the 'kind' of sequence this is: empty, singleton, or 'multiple' and call the related callback
	 *
	 * @return A sequence that will yield all items of the sequence returned in the called callback.
	 */
	switchCases(cases: SwitchCasesCases): ISequence;
}
