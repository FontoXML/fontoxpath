export const errFOAY0001 = () => new Error('FOAY0001: Array index out of bounds');

export const errFORG0006 = (
	message: string = 'A wrong argument type was specified in a function call.',
) => new Error(`FORG0006: ${message}`);
