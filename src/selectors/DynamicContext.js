define([
], function (
) {
	'use strict';

	function DynamicContext (context) {
		this.contextItem = context.contextItem;
		this.contextSequence = context.contextSequence;
		this.domFacade = context.domFacade;
		this.variables = context.variables;
	}

	DynamicContext.prototype.createScopedContext = function (overlayContext) {
		return new DynamicContext({
			contextItem: overlayContext.contextItem ? overlayContext.contextItem : this.contextItem,
			contextSequence: overlayContext.contextSequence ? overlayContext.contextSequence : this.contextSequence,
			domFacade: overlayContext.domFacade ? overlayContext.domFacade : this.domFacade,
			variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables
		});
	};

	return DynamicContext;
});
