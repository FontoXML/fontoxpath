import { AttributeNodePointer, ElementNodePointer } from '../../domClone/Pointer';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import {} from '../Expression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import { Bucket } from '../util/Bucket';
import TestAbstractExpression from './TestAbstractExpression';

class NameTest extends TestAbstractExpression {
	public _kind: number;
	public _localName: string;
	public _namespaceURI: string;
	public _prefix: string;

	constructor(
		name: { localName: string; namespaceURI: string | null; prefix: string },
		options: { kind: number | null } = { kind: null }
	) {
		const { prefix, namespaceURI, localName } = name;
		const specificity: { [s: string]: number } = {};

		if (localName !== '*') {
			specificity[Specificity.NODENAME_KIND] = 1;
		}

		// We have a special specificity: we will match either attributes or elements. this counts
		// as a specificity: self::type[parent::*] is more specific than self::type
		specificity[Specificity.NODETYPE_KIND] = 1;

		super(new Specificity(specificity));

		this._localName = localName;
		this._namespaceURI = namespaceURI;
		this._prefix = prefix || (namespaceURI ? null : '');

		this._kind = options.kind;
	}

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		value: Value,
		executionParameters: ExecutionParameters
	) {
		const domFacade = executionParameters.domFacade;
		const nodeIsElement = isSubtypeOf(value.type, ValueType.ELEMENT);
		const nodeIsAttribute = isSubtypeOf(value.type, ValueType.ATTRIBUTE);
		if (!nodeIsElement && !nodeIsAttribute) {
			return false;
		}

		const node = value.value as AttributeNodePointer | ElementNodePointer;

		if (
			this._kind !== null &&
			((this._kind === 1 && !nodeIsElement) || (this._kind === 2 && !nodeIsAttribute))
		) {
			return false;
		}
		// Easy cases first
		if (this._prefix === null && this._namespaceURI !== '' && this._localName === '*') {
			return true;
		}
		if (this._prefix === '*') {
			if (this._localName === '*') {
				return true;
			}
			return this._localName === domFacade.getLocalName(node);
		}
		if (this._localName !== '*') {
			if (this._localName !== domFacade.getLocalName(node)) {
				return false;
			}
		}

		// An unprefixed QName, when used as a name test on an axis whose principal node kind is element,
		//    has the namespace URI of the default element/type namespace in the expression context;
		//    otherwise, it has no namespace URI.
		const resolvedNamespaceURI =
			this._prefix === '' ? (nodeIsElement ? this._namespaceURI : null) : this._namespaceURI;

		return (domFacade.getNamespaceURI(node) || null) === (resolvedNamespaceURI || null);
	}

	public override getBucket(): Bucket {
		if (this._localName === '*') {
			if (this._kind === null) {
				return 'type-1-or-type-2';
			}
			return `type-${this._kind}` as Bucket;
		}
		return `name-${this._localName}`;
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		if (this._namespaceURI === null && this._prefix !== '*') {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix || '') || null;

			if (!this._namespaceURI && this._prefix) {
				throw new Error(`XPST0081: The prefix ${this._prefix} could not be resolved.`);
			}
		}
	}
}

export default NameTest;
