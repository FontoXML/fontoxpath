import { FunctionProperties } from './functions/functionRegistry';

export default interface IContext {
	lookupFunction(
		namespaceURI: string,
		localName: string,
		arity: number
	): FunctionProperties | null;
	lookupVariable(namespaceURI: string | null, localName: string): string | null;
	resolveNamespace(prefix: string): string | null;
}
