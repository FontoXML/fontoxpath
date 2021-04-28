import { ValueType } from './Value';

type TypeDeclaration = {
	occurrence: '?' | '+' | '*' | '';
	type: ValueType;
};

export default TypeDeclaration;
