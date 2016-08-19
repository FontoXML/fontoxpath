define([
], function (
) {

	function DynamicContext (context) {
		this.contextItem = context.contextItem;
		this.contextSequence = context.contextSequence;
		this.blueprint = context.blueprint;
		this.variables = context.variables;
	}

	DynamicContext.prototype.createScopedContext = function (overlayContext) {
		return new DynamicContext({
			contextItem: overlayContext.contextItem ? overlayContext.contextItem : this.contextItem,
			contextSequence: overlayContext.contextSequence ? overlayContext.contextSequence : this.contextSequence,
			blueprint: overlayContext.blueprint ? overlayContext.blueprint : this.blueprint,
			variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables
		});
	};

	return DynamicContext;
});
