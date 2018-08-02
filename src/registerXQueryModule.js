export default function registerXQueryModule (moduleString) {
	// TODO:
	// - Parse stuff
	// - Assert that this is a library (or should we? should we just disable XQuery main modules for now? Regard them as XPaths (`evaluateXPath(file.readString(prrt.xqm))?`))
	// - get the URI
	// - Register this to the global environment, under the URI
	// - Statically compile it (assuming every import can be resolved, TODO: figure out if XQuery has circular imports. I hope not...)

}
