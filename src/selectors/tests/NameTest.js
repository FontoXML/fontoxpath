import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

/**
 * @extends {Selector}
 */
class NameTest extends Selector {
	/**
	 * @param  {?string}  prefix
	 * @param  {?string}  namespaceURI
	 * @param  {string}   localName
	 */
	constructor (prefix, namespaceURI, localName) {
		var specificity = {
				[Specificity.NODENAME_KIND]: 1
			};
		if (localName === '*') {
			specificity = {
				[Specificity.NODETYPE_KIND]: 1
			};
		}
		super(new Specificity(specificity), { canBeStaticallyEvaluated: false });

		this._localName = localName;
		this._namespaceURI = namespaceURI;
		this._prefix = prefix;

	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const node = dynamicContext.contextItem;
		const nodeIsElement = isSubtypeOf(node.type, 'element()');
		const nodeIsAttribute = isSubtypeOf(node.type, 'attribute()');
		if (!nodeIsElement && !nodeIsAttribute) {
			return Sequence.singletonFalseSequence();
		}
		// Easy cases first
		if (this._prefix === null && this._localName === '*') {
			return Sequence.singletonTrueSequence();
		}
		if (this._prefix === '*') {
			if (this._localName === '*') {
				return Sequence.singletonTrueSequence();
			}
			return this._localName === node.value.localName ?
				Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();

		}
		if (this._localName !== '*') {
			if (this._localName !== node.value.localName) {
				return Sequence.singletonFalseSequence();
			}
		}

		let resolvedNamespaceURI;
		if (this._namespaceURI !== null) {
			resolvedNamespaceURI = this._namespaceURI || null;
		}
		else if (this._prefix === null) {
			// An unprefixed QName, when used as a name test on an axis whose principal node kind is element,
			//    has the namespace URI of the default element/type namespace in the expression context;
			//    otherwise, it has no namespace URI.
			if (nodeIsElement) {
				resolvedNamespaceURI = dynamicContext.resolveNamespacePrefix('');
			}
			else {
				resolvedNamespaceURI = null;
			}
		}
		else {
			resolvedNamespaceURI = dynamicContext.resolveNamespacePrefix(this._prefix);
			if (!resolvedNamespaceURI) {
				throw new Error(`XPST0081: The prefix ${this._prefix} could not be resolved.`);
			}
		}

		return node.value.namespaceURI === resolvedNamespaceURI ?
			Sequence.singletonTrueSequence() :
			Sequence.singletonFalseSequence();
	}

	getBucket () {
		if (this._localName === '*') {
			// While * is a test matching attributes or elements, buckets are never used to match nodes.
			return 'type-1';
		}
		return 'name-' + this._localName;
	}
}

export default NameTest;
