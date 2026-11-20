import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXPORT_FORMATS,
  serialize,
  toCsv,
  toFileName,
  toJson,
  toPlainText,
} from '~/utils/playlistExport';
import type { PlaylistSong } from '~/types';

const song = (over: Partial<PlaylistSong> = {}): PlaylistSong => ({
  title: 'Song',
  artist: 'Artist',
  album: 'Album',
  ...over,
});

describe('toCsv', () => {
  it('emits only the header row for an empty list', () => {
    expect(toCsv([])).toBe('Title,Artist,Album');
  });

  it('joins rows with CRLF and no trailing newline', () => {
    const csv = toCsv([song(), song({ title: 'Two' })]);
    expect(csv).toBe(
      'Title,Artist,Album\r\nSong,Artist,Album\r\nTwo,Artist,Album',
    );
  });

  it('quotes fields containing commas', () => {
    expect(toCsv([song({ title: 'a, b' })])).toContain('"a, b",Artist,Album');
  });

  it('doubles embedded quotes', () => {
    expect(toCsv([song({ title: 'say "hi"' })])).toContain('"say ""hi""",');
  });

  it('quotes fields containing newlines', () => {
    expect(toCsv([song({ album: 'a\nb' })])).toContain(',"a\nb"');
  });

  it.each(['=1+1', '+1', '-1', '@SUM(A1)', '\tx'])(
    'defuses formula prefix in %j',
    (title) => {
      const row = toCsv([song({ title })]).split('\r\n')[1]!;
      expect(row.startsWith(`'${title}`)).toBe(true);
    },
  );

  it('defuses and quotes a leading carriage return', () => {
    expect(toCsv([song({ title: '\rx' })])).toContain(`"'\rx",`);
  });

  it('leaves a trailing empty cell for an empty album', () => {
    expect(toCsv([song({ album: '' })]).split('\r\n')[1]).toBe('Song,Artist,');
  });
});

describe('toJson', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns playlist, ISO exportedAt, trackCount and tracks', () => {
    const songs = [song(), song({ title: 'Two' })];
    expect(JSON.parse(toJson('Mix', songs))).toEqual({
      playlist: 'Mix',
      exportedAt: '2026-01-02T03:04:05.000Z',
      trackCount: 2,
      tracks: songs,
    });
  });

  it('reports zero tracks for an empty list', () => {
    const out = JSON.parse(toJson('Mix', []));
    expect(out.trackCount).toBe(0);
    expect(out.tracks).toEqual([]);
  });

  it('is pretty-printed with two-space indentation', () => {
    expect(toJson('Mix', [])).toContain('\n  "playlist": "Mix"');
  });
});

describe('toPlainText', () => {
  it('starts with the playlist name and a blank line', () => {
    expect(toPlainText('Mix', [song()]).split('\n').slice(0, 2)).toEqual([
      'Mix',
      '',
    ]);
  });

  it('formats lines as "n. artist - title (album)"', () => {
    expect(toPlainText('Mix', [song()])).toBe(
      'Mix\n\n1. Artist - Song (Album)',
    );
  });

  it('omits the album when empty', () => {
    expect(toPlainText('Mix', [song({ album: '' })])).toBe(
      'Mix\n\n1. Artist - Song',
    );
  });

  it('pads numbers to the width of the track count', () => {
    const songs = Array.from({ length: 10 }, (_, i) =>
      song({ title: `T${i + 1}` }),
    );
    const lines = toPlainText('Mix', songs).split('\n');
    expect(lines[2]).toMatch(/^ 1\. /);
    expect(lines[10]).toMatch(/^ 9\. /);
    expect(lines[11]).toMatch(/^10\. /);
  });

  it('returns only header and blank line for an empty list', () => {
    expect(toPlainText('Mix', [])).toBe('Mix\n');
  });
});

describe('serialize', () => {
  const songs = [song()];

  it('dispatches csv', () => {
    expect(serialize('csv', 'Mix', songs)).toBe(toCsv(songs));
  });

  it('dispatches txt', () => {
    expect(serialize('txt', 'Mix', songs)).toBe(toPlainText('Mix', songs));
  });

  it('dispatches json', () => {
    expect(JSON.parse(serialize('json', 'Mix', songs)).playlist).toBe('Mix');
  });
});

describe('toFileName', () => {
  it('slugifies and appends the extension', () => {
    expect(toFileName('Late Night Drive', 'csv')).toBe('late-night-drive.csv');
  });

  it('strips diacritics', () => {
    expect(toFileName('Café Münchën', 'txt')).toBe('cafe-munchen.txt');
  });

  it('falls back to "playlist" for emoji-only names', () => {
    expect(toFileName('✨🎵', 'json')).toBe('playlist.json');
  });

  it('falls back to "playlist" for an empty name', () => {
    expect(toFileName('', 'csv')).toBe('playlist.csv');
  });

  it('caps the slug at 80 characters', () => {
    const name = toFileName('a'.repeat(200), 'csv');
    expect(name).toBe(`${'a'.repeat(80)}.csv`);
  });

  it('has no leading or trailing dashes', () => {
    expect(toFileName('  --Hello!! ✨ ', 'csv')).toBe('hello.csv');
  });
});

describe('EXPORT_FORMATS', () => {
  it('has unique values', () => {
    const values = EXPORT_FORMATS.map((f) => f.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
