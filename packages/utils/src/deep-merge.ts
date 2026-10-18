/**
 * Pure deep merge for plain objects.
 * Arrays and primitives in source replace target values.
 */
export function deepMerge<T extends Record<string, any>>(target: T, source?: Record<string, any> | null): T {
  if (!source || typeof source !== 'object') return { ...target };
  const output = { ...target } as any;

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = (target as any)[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      output[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      output[key] = sourceVal;
    }
  }

  return output;
}
