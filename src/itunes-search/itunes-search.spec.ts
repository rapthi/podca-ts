import { describe, it, expect, vi, beforeEach } from 'vitest';
import { itunesSearch } from './itunes-search.js';

describe('itunesSearch', () => {
  let searcher: itunesSearch;

  beforeEach(() => {
    searcher = new itunesSearch();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should return data with success when the response is ok', async () => {
    const mockData = { resultCount: 1, results: [{ trackName: 'Test Song' }] };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await searcher.search({ term: 'test', media: 'music' });

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://itunes.apple.com/search?term=test&media=music',
      ),
    );
  });

  it("should raise an error if the http response is not ok (ex: 404)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(searcher.search({ term: 'invalid', media: 'podcast' })).rejects.toThrow(
      'Failed to fetch data from iTunes Search API: 404',
    );
  });

  it('should raise an error "Fetch failed" in case of network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));

    await expect(searcher.search({ term: 'test', media: 'podcast' })).rejects.toThrow(
      'Fetch failed: Network Error',
    );
  });
});
