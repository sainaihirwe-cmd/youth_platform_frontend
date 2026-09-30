/**
 * Maps express-validator field errors from the API onto react-hook-form fields.
 * Returns true when at least one field error was applied.
 */
export function applyServerErrors(err, setError, fieldMap = {}) {
  if (!err?.errors?.length || !setError) return false;
  let applied = false;
  for (const e of err.errors) {
    if (!e.field) continue;
    const field = fieldMap[e.field] || e.field;
    setError(field, { type: 'server', message: e.message });
    applied = true;
  }
  return applied;
}
