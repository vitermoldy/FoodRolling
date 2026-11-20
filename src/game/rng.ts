/** Small seeded generator (mulberry32), so a simulation can be replayed in tests. */
export function makeRng(seed: number): () => number {
