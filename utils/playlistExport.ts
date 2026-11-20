import type { PlaylistSong } from '../types';

export type ExportFormat = 'json' | 'csv' | 'txt';

export const EXPORT_FORMATS: ReadonlyArray<{
  value: ExportFormat;
  label: string;
  hint: string;
  mime: string;
}> = [
  {
    value: 'csv',
    label: 'CSV',
    hint: 'Spreadsheets, Excel, Numbers',
    mime: 'text/csv;charset=utf-8',
  },
  {
    value: 'json',
    label: 'JSON',
    hint: 'Apps, scripts, re-importing',
    mime: 'application/json;charset=utf-8',
  },
  {
    value: 'txt',
    label: 'Plain text',
    hint: 'Notes, messages, printing',
    mime: 'text/plain;charset=utf-8',
  },
];

const CSV_HEADER = ['Title', 'Artist', 'Album'];

// Quotes fields when needed (RFC 4180) and defuses spreadsheet formulas: a
// cell starting with = + - @ would otherwise run as a formula in Excel.
const csvCell = (value: string): string => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (songs: readonly PlaylistSong[]): string =>
  [CSV_HEADER, ...songs.map((s) => [s.title, s.artist, s.album])]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');

export const toJson = (
  playlistName: string,
  songs: readonly PlaylistSong[],
): string =>
  JSON.stringify(
    {
      playlist: playlistName,
      exportedAt: new Date().toISOString(),
      trackCount: songs.length,
      tracks: songs,
    },
    null,
    2,
  );

export const toPlainText = (
  playlistName: string,
  songs: readonly PlaylistSong[],
): string => {
  const width = String(songs.length).length;
  const lines = songs.map((s, i) => {
    const n = String(i + 1).padStart(width, ' ');
    const album = s.album ? ` (${s.album})` : '';
    return `${n}. ${s.artist} - ${s.title}${album}`;
  });
  return [playlistName, '', ...lines].join('\n');
};

export const serialize = (
  format: ExportFormat,
  playlistName: string,
  songs: readonly PlaylistSong[],
): string => {
  if (format === 'csv') return toCsv(songs);
  if (format === 'json') return toJson(playlistName, songs);
  return toPlainText(playlistName, songs);
};

// "Late Night Drive ✨" → "late-night-drive"; never empty.
export const toFileName = (playlistName: string, format: ExportFormat) => {
  const slug = playlistName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'playlist'}.${format}`;
};

// Browser-only. The BOM makes Excel read accented CSV text as UTF-8.
export const downloadExport = (
  format: ExportFormat,
  playlistName: string,
  songs: readonly PlaylistSong[],
): void => {
  const { mime } = EXPORT_FORMATS.find((f) => f.value === format)!;
  const body = serialize(format, playlistName, songs);
  const blob = new Blob([format === 'csv' ? `﻿${body}` : body], {
    type: mime,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = toFileName(playlistName, format);
  link.click();
  // Revoke on the next tick: some browsers read the URL after click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
