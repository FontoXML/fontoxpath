import { ValueValue } from '../expressions/dataTypes/Value';

/**
 * Lambda helper function to the binary operator
 */
export type BinaryEvaluationFunction = (left: ValueValue, right: ValueValue) => ValueValue;
