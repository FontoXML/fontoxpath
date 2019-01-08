import TestAbstractExpression from './TestAbstractExpression';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

class NameTest extends TestAbstractExpression {
	_localName: string;
	_namespaceURI: string;
	_prefix: string;
	_kind: number;
	/**
	 * @param  {{prefix:string, namespaceURI: ?string, localName: string}} name
	 * @param  {{kind: ?number}} [options=]
	 */
	constructor (name: { prefix: string; namespaceURI: string | null; localName: string; }, options: { kind: number | null; } = { kind: null }) {
		const { prefix, namespaceURI, localName } = name;
		const specificity = {};

		if (localName !== '*') {
			specificity[Specificity.NODENAME_KIND] = 1;
		}
		if (options.kind !== null) {
			specificity[Specificity.NODETYPE_KIND] = 1;
		}
		super(new Specificity(specificity));

		this._localName = localName;
		this._namespaceURI = namespaceURI;
		this._prefix = prefix || (namespaceURI ? null : '');

		this._kind = options.kind;
	}

	performStaticEvaluation (staticContext) {
		if (this._namespaceURI === null && this._prefix !== '*') {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix || '');

			if (!this._namespaceURI && this._prefix) {
				throw new Error(`XPST0081: The prefix ${this._prefix} could not be resolved.`);
			}
		}
	}

	evaluateToBoolean (_dynamicContext, node) {
		const nodeIsElement = isSubtypeOf(node.type, 'element()');
		const nodeIsAttribute = isSubtypeOf(node.type, 'attribute()');
		if (!nodeIsElement && !nodeIsAttribute) {
			return false;
		}
		if (this._kind !== null && ((this._kind === 1 && !nodeIsElement) || this._kind === 2 && !nodeIsAttribute)) {
			return false;
		}
		// Easy cases first
		if (
			this._prefix === null && this._namespaceURI !== '' && this._localName === '*') {
			return true;
		}
		if (this._prefix === '*') {
			if (this._localName === '*') {
				return true;
			}
			return this._localName === node.value.localName;

		}
		if (this._localName !== '*') {
			if (this._localName !== node.value.localName) {
				return false;
			}
		}

		let resolvedNamespaceURI;
		if (this._prefix === '') {
			// An unprefixed QName, when used as a name test on an axis whose principal node kind is element,
			//    has the namespace URI of the default element/type namespace in the expression context;
			//    otherwise, it has no namespace URI.
			if (nodeIsElement) {
				resolvedNamespaceURI = this._namespaceURI || null;
			}
			else {
				resolvedNamespaceURI = null;
			}
		}
		else {
			// We have a prefixed name test.
			resolvedNamespaceURI = this._namespaceURI || null;
		}

		return node.value.namespaceURI === resolvedNamespaceURI;
	}

	getBucket () {
		if (this._localName === '*') {
			if (this._kind === null) {
				return null;
			}
			return `type-${this._kind}`;
		}
		return 'name-' + this._localName;
	}
}

export default NameTest;
