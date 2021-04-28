import { ValueType } from './Value';

type AtomicValue = {
	type: ValueType;
	value: any;
};

export default AtomicValue;
