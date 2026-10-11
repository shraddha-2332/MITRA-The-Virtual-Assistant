export function retrievalMetrics(ids, groups) {
  if (!groups.length) return null;
  const recall = k => groups.filter(group => group.some(id => ids.slice(0, k).includes(id))).length / groups.length;
  const ranks = groups.map(group => ids.findIndex(id => group.includes(id)));
  return { groupRecallAt1: recall(1), groupRecallAt3: recall(3),
    groupMRRAt3: ranks.reduce((sum, rank) => sum + (rank < 0 ? 0 : 1 / (rank + 1)), 0) / groups.length };
}
