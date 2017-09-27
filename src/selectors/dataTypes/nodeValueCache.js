// This should work for maximal reuse of instances:
// NodeValue has a strong ref to a Node, but when it's only referenced by this weakmap, it should be eligible for GC
// When it is collected, the Node may be collected too
// TODO: This must work for all values, and be in a 'static context' of some sort
/**
 * @const {!WeakMap<!Node, !./Value>}
 */
const nodeValueCache = new WeakMap();

export default nodeValueCache;
