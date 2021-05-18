import { ValueValue } from '../expressions/dataTypes/Value';

export type BinaryEvaluationFunction = (left: ValueValue, right: ValueValue) => ValueValue;
