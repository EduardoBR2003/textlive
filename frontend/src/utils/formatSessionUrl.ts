export function formatSessionUrl(slug: string): string {
  const base = window.location.origin;
  return `${base}/s/${slug}`;
}
