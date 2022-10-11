import { XPDY0002 } from '../expressions/XPathErrors';

// Make sure Closure Compiler does not change property names.
declare interface IRuntimeLib {
	XPDY0002: typeof XPDY0002;
}

const runtimeLib: IRuntimeLib = {
	XPDY0002,
};

export default runtimeLib;
