/**
 * @fileoverview
 * @externs
 */

/**
 * @record
 */
class INodesFactory {

	/**
	 * @nosideeffects
	 * @export
	 * @param   {?string}  namespaceURI
	 * @param   {!string}  name
	 * @return  {!Element}
	 */
	createElementNS (namespaceURI, name) {
	}
	/**
	 * @nosideeffects
	 * @export
	 * @param   {!string}  contents
	 * @return  {!Comment}
	 */
	createComment (contents) {
	}

	/**
	 * @nosideeffects
	 * @export
	 * @param   {!string}  contents
	 * @return  {!Text}
	 */
	createTextNode (contents) {
	}
}
