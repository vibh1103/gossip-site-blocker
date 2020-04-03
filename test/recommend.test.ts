import makeRecommendUrl from '../apps/model/recommend';

describe('makeRecommendUrl', () => {
    it('d.hatena.ne.jp', () => {
        expect(makeRecommendUrl('d.hatena.ne.jp/foo/bar')).toBe('d.hatena.ne.jp/foo/');
        expect(makeRecommendUrl('d.hatena.ne.jp/foo/')).toBe(null);
    });

    it('ameblo.jp', () => {
        expect(makeRecommendUrl('ameblo.jp/foo-bar-baz1/def-ghi')).toBe('ameblo.jp/foo-bar-baz1/');
        expect(makeRecommendUrl('ameblo.jp/foo-bar-baz1/')).toBe(null);
    });

    it('blog.livedoor.jp', () => {
        expect(makeRecommendUrl('blog.livedoor.jp/foo-bar/abc-def')).toBe('blog.livedoor.jp/foo-bar/');
        expect(makeRecommendUrl('blog.livedoor.jp/foo-bar/')).toBe(null);
    });
});
