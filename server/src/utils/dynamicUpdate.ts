export type SqlPrimitive = string | number | boolean | null;

/**
 * Builds a parameterized `col1 = $N, col2 = $N+1, ...` SET clause using only
 * the keys that are actually *present* on `data`.
 *
 * Why not COALESCE($n, column)? COALESCE makes "clear this field" and
 * "leave this field alone" indistinguishable — both send NULL down the
 * wire, so COALESCE silently keeps the old value instead of clearing it.
 *
 * Instead we rely on the fact that JSON (and the zod-parsed objects built
 * from it) can express three distinct states for a field:
 *   - key absent            -> not provided, leave column untouched
 *   - key present, value null -> explicitly cleared, SET column = NULL
 *   - key present, value X    -> SET column = X
 *
 * `Object.keys(data)` only returns keys that were actually set on the
 * object, so a field the caller omitted (parsed by zod as `undefined` and
 * therefore never assigned) is correctly skipped, while an explicit `null`
 * still comes through and clears the column.
 *
 * Column names come from the keys of a typed `Partial<Row>` object that was
 * itself produced by a zod schema with a fixed, known shape — never from
 * unsanitized user input — so building SQL text from `key` here is safe.
 *
 * @param data       Partial row data, produced by a zod schema.
 * @param startIndex The first placeholder index to use (e.g. 3 if $1/$2 are
 *                    already used by the WHERE clause).
 */
export function buildSetClause<T extends Record<string, unknown>>(
  data: T,
  startIndex: number
): { setSql: string; values: unknown[]; hasChanges: boolean } {
  const keys = Object.keys(data).filter((key) => data[key as keyof T] !== undefined);

  const setSql = keys.map((key, i) => `${key} = $${startIndex + i}`).join(', ');
  const values = keys.map((key) => data[key as keyof T]);

  return { setSql, values, hasChanges: keys.length > 0 };
}
