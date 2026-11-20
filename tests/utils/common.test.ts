import { describe, expect, it } from 'vitest';
import {
  formatTime,
  generateRandomString,
  isActiveNav,
  pluralize,
} from '~/utils/common';

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [NaN, '0:00'],
    [5, '0:05'],
    [59, '0:59'],
    [60, '1:00'],
    [125, '2:05'],
    [3600, '60:00'],
    [61.9, '1:01'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });
});

describe('isActiveNav', () => {
  it('matches by prefix when `match` is set', () => {
    expect(
      isActiveNav({ to: '/a', match: '/playlists' }, '/playlists/42'),
    ).toBe(true);
  });

  it('does not match a different prefix', () => {
    expect(isActiveNav({ to: '/a', match: '/playlists' }, '/other')).toBe(
      false,
    );
  });

  it('requires an exact path when `match` is null', () => {
    const item = { to: '/home', match: null };
    expect(isActiveNav(item, '/home')).toBe(true);
    expect(isActiveNav(item, '/home/sub')).toBe(false);
  });
});

describe('generateRandomString', () => {
  it.each([0, 1, 15, 16, 43])('returns exactly %i characters', (n) => {
    expect(generateRandomString(n)).toHaveLength(n);
  });

  it('uses only lowercase hex characters', () => {
    expect(generateRandomString(64)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns different values across calls', () => {
    expect(generateRandomString(32)).not.toBe(generateRandomString(32));
  });
});

describe('pluralize', () => {
  it('uses the singular for 1', () => {
    expect(pluralize(1, 'song')).toBe('1 song');
  });

  it('uses the default plural for 0', () => {
    expect(pluralize(0, 'song')).toBe('0 songs');
  });

  it('formats thousands with separators', () => {
    expect(pluralize(1200, 'song')).toBe('1,200 songs');
  });

  it('uses a custom plural when given', () => {
    expect(pluralize(2, 'person', 'people')).toBe('2 people');
    expect(pluralize(1, 'person', 'people')).toBe('1 person');
  });
});
