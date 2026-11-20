import type { Track } from '~/types';

// "Get Lucky (Radio Edit) [feat. …]" and "Get Lucky - Remastered" are the same
// song for a listener: compare titles without versions and features.
const songKey = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();

/**
 * Other songs from the artist's search results: drops the current song (any
 * version of it) and duplicate versions, keeping Spotify's relevance order.
 */
export function pickSuggestions(
  candidates: readonly Track[],
  current: Track,
  limit: number,
): Track[] {
  const seen = new Set([songKey(current.name)]);
  return candidates
    .filter((candidate) => {
      const key = songKey(candidate.name);
      if (candidate.id === current.id || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
