/**
 * @fileoverview
 * @externs
 */

/**
 * @record
 */
class IDocumentWriter {
	/**
	 * @export
	 * @param   {!Node}  parent
	 * @param   {!Node}  newNode
	 * @param   {?Node}  referenceNode
	 * @return  {!Node}  The added child
	 */
	insertBefore (parent, newNode, referenceNode) {
	}

	/**
	 * @export
	 * @param   {!Node}    node
	 * @param   {?string}  namespace
	 * @param   {!string}  name
	 */
	removeAttributeNS (node, namespace, name) {
	}

	/**
	 * @export
	 * @param   {!Node}  parent
	 * @param   {!Node}  child
	 * @return  {!Node}  The removed child node
	 */
	removeChild (parent, child) {
	}

	/**
	 * @export
	 * @param   {!Node}    node
	 * @param   {?string}  namespace
	 * @param   {!string}  name
	 * @param   {!string}  value
	 */
	setAttributeNS (node, namespace, name, value) {
	}

	/**
	 * @export
	 * @param   {!Node}    node
	 * @param   {!string}  data
	 */
	setData (node, data) {
	}
}
