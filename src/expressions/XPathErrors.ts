import { ValueType, valueTypeToString } from './dataTypes/Value';

export const errFORG0001 = (value: string, type: ValueType, reason?: string) =>
	new Error(
		`FORG0001: Cannot cast ${value} to ${valueTypeToString(type)}${
			reason ? `, ${reason}` : ''
		}`,
	);
export const errXPDY0002 = (message: string) => new Error(`XPDY0002: ${message}`);
export const errXPTY0004 = (message: string) => new Error(`XPTY0004: ${message}`);
export const errFOTY0013 = (type: ValueType) =>
	new Error(`FOTY0013: Atomization is not supported for ${valueTypeToString(type)}.`);
export const errXPST0081 = (prefix: string) =>
	new Error(`XPST0081: The prefix ${prefix} could not be resolved.`);
