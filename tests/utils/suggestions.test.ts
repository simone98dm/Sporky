import { describe, expect, it } from 'vitest';
import { pickSuggestions } from '~/utils/suggestions';
import type { Track } from '~/types';

const track = (id: string, name: string): Track => ({
  id,
  name,
  artists: [{ name: 'Daft Punk' }],
  album: 'Album',
  cover: '',
  url: `spotify:track:${id}`,
  duration: 1000,
});

describe('pickSuggestions', () => {
  const current = track('t1', 'Get Lucky');

  it('drops the current track and other versions of it', () => {
    const candidates = [
      track('t1', 'Get Lucky'),
      track('t2', 'Get Lucky (Radio Edit) [feat. Pharrell Williams]'),
      track('t3', 'Get Lucky - Remastered 2023'),
      track('t4', 'One More Time'),
    ];

    expect(pickSuggestions(candidates, current, 6).map((t) => t.id)).toEqual([
      't4',
    ]);
  });

  it('keeps one version of each song, in the given order', () => {
    const candidates = [
      track('a', 'Around the World'),
      track('b', 'Around the World (Live)'),
      track('c', 'Starboy'),
    ];

    expect(pickSuggestions(candidates, current, 6).map((t) => t.id)).toEqual([
      'a',
      'c',
    ]);
  });

  it('returns at most `limit` songs', () => {
    const candidates = ['A', 'B', 'C', 'D'].map((n) => track(n, n));

    expect(pickSuggestions(candidates, current, 2)).toHaveLength(2);
  });

  it('returns an empty list when nothing is left', () => {
    expect(pickSuggestions([current], current, 6)).toEqual([]);
  });
});
