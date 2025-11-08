// Extracts mentioned user IDs from TipTap HTML content
export function extractMentionedUserIds(content: string): string[] {
  // TipTap mention nodes are rendered as <span class="mention" data-id="USER_ID" ...>
  const regex = /<span[^>]*class=["']mention["'][^>]*data-id=["']([^"']+)["'][^>]*>/g;
  const ids = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids);
}
