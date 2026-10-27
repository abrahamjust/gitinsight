export { bulkUpsert };

const CHUNK_SIZE = 1000;

/**
 * Inserts new documents and refreshes existing ones in batched bulkWrites.
 * `keys` identify a document (e.g. ["repositoryId", "githubId"]).
 * With insertOnly, existing documents are left untouched (immutable data
 * such as commits).
 */
async function bulkUpsert(Model, docs, keys, { insertOnly = false } = {}) {
    let inserted = 0;
    let updated = 0;

    const now = new Date();

    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const operations = docs.slice(i, i + CHUNK_SIZE).map((doc) => ({
            updateOne: {
                filter: Object.fromEntries(keys.map((key) => [key, doc[key]])),
                // Mongoose's automatic timestamps would $set updatedAt on every
                // match, so insert-only writes stamp their own
                update: insertOnly
                    ? { $setOnInsert: { ...doc, createdAt: now, updatedAt: now } }
                    : { $set: doc },
                upsert: true,
            },
        }));

        const result = await Model.bulkWrite(operations, {
            ordered: false,
            timestamps: !insertOnly,
        });
        inserted += result.upsertedCount;
        updated += result.modifiedCount;
    }

    return { inserted, updated };
}
