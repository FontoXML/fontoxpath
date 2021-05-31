import { Attr } from '../../types/Types';

export const errXUST0001 = (
	message = 'Can not execute an updating expression in a non-updating context.'
) => new Error(`XUST0001: ${message}`);
export const errXUTY0004 = (node: Attr) =>
	new Error(
		`XUTY0004: The attribute ${node.name}="${node.value}" follows a node that is not an attribute node.`
	);
export const errXUTY0005 = () =>
	new Error(
		'XUTY0005: The target of a insert expression with into must be a single element or document node.'
	);
export const errXUTY0006 = () =>
	new Error(
		'XUTY0006: The target of a insert expression with before or after must be a single element, text, comment, or processing instruction node.'
	);
export const errXUTY0007 = () =>
	new Error(
		'XUTY0007: The target of a delete expression must be a sequence of zero or more nodes.'
	);
export const errXUTY0008 = () =>
	new Error(
		'XUTY0008: The target of a replace expression must be a single element, attribute, text, comment, or processing instruction node.'
	);
export const errXUDY0009 = (target) =>
	new Error(`XUDY0009: The target ${target.outerHTML} for replacing a node must have a parent.`);
export const errXUTY0010 = () =>
	new Error(
		'XUTY0010: When replacing an an element, text, comment, or processing instruction node the new value must be a single node.'
	);
export const errXUTY0011 = () =>
	new Error(
		'XUTY0011: When replacing an attribute the new value must be zero or more attribute nodes.'
	);
export const errXUTY0012 = () =>
	new Error(
		'XUTY0012: The target of a rename expression must be a single element, attribute, or processing instruction node.'
	);
export const errXUTY0013 = () =>
	new Error(
		'XUTY0013: The source expression of a copy modify expression must return a single node.'
	);
export const errXUDY0014 = (target) =>
	new Error(
		`XUDY0014: The target ${target.outerHTML} must be a node created by the copy clause.`
	);
export const errXUDY0015 = (target) =>
	new Error(
		`XUDY0015: The target ${target.outerHTML} is used in more than one rename expression.`
	);
export const errXUDY0016 = (target) =>
	new Error(
		`XUDY0016: The target ${target.outerHTML} is used in more than one replace expression.`
	);
export const errXUDY0017 = (target) =>
	new Error(
		`XUDY0017: The target ${target.outerHTML} is used in more than one replace value of expression.`
	);
export const errXUDY0021 = (constraint) =>
	new Error(
		`XUDY0021: Applying the updates will result in the XDM instance violating constraint: '${constraint}'`
	);
export const errXUTY0022 = () =>
	new Error(
		'XUTY0022: An insert expression specifies the insertion of an attribute node into a document node.'
	);
export const errXUDY0023 = (namespaceURI: string) =>
	new Error(`XUDY0023: The namespace binding ${namespaceURI} is conflicting.`);
export const errXUDY0024 = (namespaceURI: string) =>
	new Error(`XUDY0024: The namespace binding ${namespaceURI} is conflicting.`);
export const errXUDY0027 = () =>
	new Error(
		'XUDY0027: The target for an insert, replace, or rename expression expression should not be empty.'
	);
export const errXUDY0029 = (target) =>
	new Error(
		`XUDY0029: The target ${target.outerHTML} for inserting a node before or after must have a parent.`
	);
export const errXUDY0030 = () =>
	new Error(
		'XUDY0030: An insert expression specifies the insertion of an attribute node before or after a child of a document node.'
	);
export const errXUDY0037 = () =>
	new Error(
		'XUDY0037: The modify expression of a copy modify expression can not contain a fn:put.'
	);
export const errXUDY0038 = () =>
	new Error(
		'XUDY0038: The function returned by the PrimaryExpr of a dynamic function invocation can not be an updating function'
	);
