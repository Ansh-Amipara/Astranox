// Utility for batching promises to avoid memory overload or rate limits
export async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, index) => task(item, i + index))
    );
    results.push(...batchResults);
  }
  return results;
}
