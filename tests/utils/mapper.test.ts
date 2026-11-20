import { describe, expect, it } from 'vitest';
import { mapPlaylist, mapPlaylistEntry, mapTrackToSong } from '~/utils/mapper';
import type {
  PlaylistEntryDTO,
  PlaylistSummaryDTO,
  PlaylistTrackDTO,
  TrackDetails,
} from '~/types';

const summary = (
  over: Partial<PlaylistSummaryDTO> = {},
): PlaylistSummaryDTO => ({
  id: 'p1',
  name: 'Mix',
  description: null,
  images: [{ url: 'http://img/1' }, { url: 'http://img/2' }] as never,
  owner: { id: 'u1', display_name: 'Ann' },
  items: { total: 7 },
  ...over,
});

describe('mapPlaylist', () => {
  it('maps the basic fields', () => {
    expect(mapPlaylist(summary())).toEqual({
      id: 'p1',
      name: 'Mix',
      description: '',
      cover: 'http://img/1',
      owner: 'Ann',
      trackCount: 7,
    });
  });

  it('uses an empty cover when images is null', () => {
    expect(mapPlaylist(summary({ images: null })).cover).toBe('');
  });

  it('uses an empty cover when images is empty', () => {
    expect(mapPlaylist(summary({ images: [] })).cover).toBe('');
  });

  it('falls back to the owner id when display_name is null', () => {
    const p = summary({ owner: { id: 'u1', display_name: null } });
    expect(mapPlaylist(p).owner).toBe('u1');
  });

  it('reads trackCount from legacy tracks.total', () => {
    const p = summary({ items: undefined, tracks: { total: 3 } });
    expect(mapPlaylist(p).trackCount).toBe(3);
  });

  it('prefers items.total over tracks.total', () => {
    const p = summary({ items: { total: 9 }, tracks: { total: 3 } });
    expect(mapPlaylist(p).trackCount).toBe(9);
  });

  it('defaults trackCount to 0 when neither is present', () => {
    const p = summary({ items: undefined, tracks: undefined });
    expect(mapPlaylist(p).trackCount).toBe(0);
  });

  it('strips HTML tags from the description (no DOMParser in node)', () => {
    const p = summary({ description: 'Hi <a href="x">there</a> <b>you</b>' });
    expect(mapPlaylist(p).description).toBe('Hi there you');
  });

  it('returns an empty description for an empty string', () => {
    expect(mapPlaylist(summary({ description: '' })).description).toBe('');
  });
});

const track = (over: Partial<PlaylistTrackDTO> = {}): PlaylistTrackDTO => ({
  type: 'track',
  name: 'Song',
  artists: [{ name: 'A' }],
  album: { name: 'Album' },
  ...over,
});

describe('mapPlaylistEntry', () => {
  it('maps a track from `item`', () => {
    expect(mapPlaylistEntry({ item: track() })).toEqual({
      title: 'Song',
      artist: 'A',
      album: 'Album',
    });
  });

  it('maps a track from legacy `track`', () => {
    expect(mapPlaylistEntry({ track: track() })?.title).toBe('Song');
  });

  it('prefers `item` over `track`', () => {
    const e: PlaylistEntryDTO = {
      item: track({ name: 'New' }),
      track: track({ name: 'Old' }),
    };
    expect(mapPlaylistEntry(e)?.title).toBe('New');
  });

  it('returns null for episodes', () => {
    expect(mapPlaylistEntry({ item: track({ type: 'episode' }) })).toBeNull();
  });

  it('returns null for a null track', () => {
    expect(mapPlaylistEntry({ item: null, track: null })).toBeNull();
  });

  it('returns null when the entry is empty', () => {
    expect(mapPlaylistEntry({})).toBeNull();
  });

  it('joins multiple artists with ", "', () => {
    const t = track({ artists: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });
    expect(mapPlaylistEntry({ item: t })?.artist).toBe('A, B, C');
  });

  it('gives an empty artist when artists is missing', () => {
    expect(
      mapPlaylistEntry({ item: track({ artists: undefined }) })?.artist,
    ).toBe('');
  });

  it('gives an empty album when album is missing', () => {
    expect(mapPlaylistEntry({ item: track({ album: undefined }) })?.album).toBe(
      '',
    );
  });
});

describe('mapTrackToSong', () => {
  const details = {
    id: 't1',
    name: 'Song',
    artists: [{ name: 'A' }],
    album: { name: 'Album', images: [{ url: 'http://c/1' }] },
    uri: 'spotify:track:t1',
    popularity: 55,
    duration_ms: 123000,
  } as unknown as TrackDetails;

  it('maps the fields to a Track', () => {
    expect(mapTrackToSong(details)).toEqual({
      id: 't1',
      name: 'Song',
      artists: [{ name: 'A' }],
      album: 'Album',
      cover: 'http://c/1',
      url: 'spotify:track:t1',
      popularity: 55,
      duration: 123000,
    });
  });

  it('uses an empty cover when the album has no images', () => {
    const d = { ...details, album: { name: 'Album', images: [] } } as never;
    expect(mapTrackToSong(d).cover).toBe('');
  });
});
