import { describe, expect, it } from 'vitest';
import { applyImageFallback, publicAssetUrl } from './publicAssets';

describe('publicAssetUrl', () => {
  it.each([
    ['assets/banner/hero.png', '/assets/banner/hero.png'],
    ['/assets/banner/hero.png', '/assets/banner/hero.png'],
    ['public/assets/banner/hero.png', '/assets/banner/hero.png'],
  ])('normalizes %s for the development base', (path, expected) => {
    expect(publicAssetUrl(path, '/')).toBe(expected);
  });

  it.each([
    ['assets/banner/hero.png', './assets/banner/hero.png'],
    ['/assets/banner/hero.png', './assets/banner/hero.png'],
    ['public/assets/banner/hero.png', './assets/banner/hero.png'],
  ])('normalizes %s for a relative build base', (path, expected) => {
    expect(publicAssetUrl(path, './')).toBe(expected);
  });

  it.each([
    'https://images.example.com/hero.png',
    'data:image/png;base64,AAAA',
    'blob:http://localhost/image-id',
  ])('preserves browser-managed URL %s', (url) => {
    expect(publicAssetUrl(url, '/portal/')).toBe(url);
  });

  it('normalizes a base without a trailing slash', () => {
    expect(publicAssetUrl('/docs/manual.docx', '/portal')).toBe('/portal/docs/manual.docx');
  });
});

describe('applyImageFallback', () => {
  it('applies a fallback at most once', () => {
    const image = { src: 'broken.png', dataset: {} as Record<string, string> };

    applyImageFallback(image, '/assets/fallback.png');
    expect(image).toEqual({
      src: '/assets/fallback.png',
      dataset: { imageFallbackApplied: 'true' },
    });

    applyImageFallback(image, '/assets/another.png');
    expect(image.src).toBe('/assets/fallback.png');
  });
});
