// Share only the in-flight request: never cache a completed identity or access token.
export function createRefreshSession(sendRefresh) {
  let pending;
  return () => {
    if (!pending) pending = Promise.resolve().then(sendRefresh).finally(() => { pending = undefined; });
    return pending;
  };
}
