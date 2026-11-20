import type {
  Track,
  TrackDetails,
  Playlist,
  PlaylistSummaryDTO,
  PlaylistEntryDTO,
  PlaylistSong,
} from '~/types';

export function mapTrackToSong(track: TrackDetails): Track {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists,
    album: track.album.name,
    cover: track.album.images[0]?.url ?? '',
    url: track.uri,
    popularity: track.popularity,
    duration: track.duration_ms,
  };
}

// Spotify descriptions arrive HTML-escaped and may contain <a> tags.
const toPlainText = (html: string | null): string => {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '');
  return (
    new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
  );
};

export function mapPlaylist(p: PlaylistSummaryDTO): Playlist {
  return {
    id: p.id,
    name: p.name,
    description: toPlainText(p.description),
    cover: p.images?.[0]?.url ?? '',
    owner: p.owner.display_name ?? p.owner.id,
    trackCount: (p.items ?? p.tracks)?.total ?? 0,
  };
}

// Null for removed tracks and podcast episodes, which have no song data.
export function mapPlaylistEntry(entry: PlaylistEntryDTO): PlaylistSong | null {
  const track = entry.item ?? entry.track;
  if (!track || track.type !== 'track') return null;
  return {
    title: track.name,
    artist: (track.artists ?? []).map((a) => a.name).join(', '),
    album: track.album?.name ?? '',
  };
}
