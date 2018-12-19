# Future ideas

Introduce tests which execute queries whilst hitting the cache. It has occurred that a query would work without case but would break when a cache entry was hit.

# Technical depth

We can not support all queries if we only use the DOM spec as we need to ability to change the name of detached node. i.e. we should look more closely to an XDM instance when introducing another "DOM" layer. This case creates a detached node and tries to rename it: `copy $a := /element modify rename node $a as "elem" return $a`

We now do normalization of nodes in the `xqutsTests.js` after executing an updating query. This should not be necessary once we implement step 3 of [applyUpdates](https://www.w3.org/TR/xquery-update-30/#id-upd-apply-updates). We should do this once we have a new DOM layer as its quite a lot of work to do it properly with the current codebase.

We should use implementations of `IDocumentWriter`, `IDomFacade`, and `INodesFactory` to work with the DOM. However this does not support all required cases and so we do not do this in the following cases:

- applyPulPrimitives.js
	- ReplaceValue directly uses target.value = stringValue; for detached attributes
- TransformExpression.js
	- deepCloneNode directly uses node.value.cloneNode(true) to create a deep clone
