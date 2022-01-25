/**
 * Buckets are an optimization to XPaths. They are passed whenever FontoXPath can determine that only
 * certain types of nodes will be used.
 *
 * For example, when evaluating the `child::element()` XPath, the `domFacade#getChildNodes` method will
 * be called with a `type-1` bucket. Signaling text nodes or comments do not have to be returned.
 *
 * @see getBucketsForNode
 * @see getBucketForSelector
 *
 * @public
 */
export type Bucket =
	| 'type-1'
	| 'type-2'
	| 'type-3'
	| 'type-4'
	| 'type-7'
	| 'type-8'
	| 'type-9'
	| 'type-10'
	| 'type-11'
	| `name-${string}`
	| 'name'
	| 'type-1-or-type-2'
	| 'empty';

// Some buckets include others. For the purpose of determining their intersection, this lists
// "subtypes" per bucket, with all name-* buckets collapsed into "name".
// Note that although "name" is not a strict subtype of either "type-1" or "type-2", it is generally
// more specific than the type-based ones, so we consider it a subtype of both.
const subBucketsByBucket: Map<Bucket, Bucket[]> = new Map([
	['type-1-or-type-2', ['name', 'type-1', 'type-2']],
	['type-1', ['name']],
	['type-2', ['name']],
]);

/**
 * Determine the intersection between the two passed buckets. The intersection is the 'strongest'
 * bucket of the two. This may return `empty` if there is no such intersection.
 *
 * Example: `type-1` ∩ `null` = `type-1`
 * Example: `type-1` ∩ `type-1-or-type-2` = `type-1`
 * Example: `type-1` ∩ `name-p` = `name-p`
 * Example: `name-p` ∩ `name-div` = `empty`
 *
 * @param  bucket1 - The first bucket to check
 * @param  bucket2 - The second bucket to check
 *
 * @returns The intersection between the two buckets.
 */
export function intersectBuckets(bucket1: Bucket | null, bucket2: Bucket | null): Bucket | null {
	// null bucket applies to everything
	if (bucket1 === null) {
		return bucket2;
	}
	if (bucket2 === null) {
		return bucket1;
	}
	// Same bucket is same
	if (bucket1 === bucket2) {
		return bucket1;
	}
	// Find the more specific one, given that the buckets are not equal
	const type1 = bucket1.startsWith('name-') ? 'name' : bucket1;
	const type2 = bucket2.startsWith('name-') ? 'name' : bucket2;
	const subtypes1 = subBucketsByBucket.get(type1);
	if (subtypes1 !== undefined && subtypes1.includes(type2)) {
		// bucket 2 is more specific
		return bucket2;
	}
	const subtypes2 = subBucketsByBucket.get(type2);
	if (subtypes2 !== undefined && subtypes2.includes(type1)) {
		// bucket 1 is more specific
		return bucket1;
	}

	// Expression will never match any nodes
	return 'empty';
}
