// Verified replacements and missing references. Do not replace arbitrary maintainer URLs.
const libraryOld = 'https://www.mitcorer.edu.in/about-lib-details.html';
const libraryCurrent = 'https://mitcorer.edu.in/about-lib-details.php';
const missingReferences = {
  'KB-1': 'https://mitcorer.edu.in/fy-btech-documents.php',
  'KB-5': 'https://mitcorer.edu.in/fy-btech-eligibility-criteria.php',
};
export function resolveSourceUrl(url) {
  return url === libraryOld ? libraryCurrent : url || '';
}
export function sourceRecord(record) {
  return { ...record, sourceUrl: resolveSourceUrl(record.sourceUrl ?? missingReferences[record.id]) };
}
export function uniqueSourceLinks(links, primaryUrl = '') {
  const seen = new Set(primaryUrl ? [resolveSourceUrl(primaryUrl)] : []);
  return (links || []).flatMap(link => {
    const url = resolveSourceUrl(link.url);
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ ...link, url }];
  });
}
