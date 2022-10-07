import { NamespaceResolver } from '../types/Options';

export type CodeGenContext = {
	resolveNamespace: NamespaceResolver;
	defaultFunctionNamespaceUri: string;
};
