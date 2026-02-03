import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItunesSearch } from './itunes-search';
import type { ITunesSearchResponse } from './itunes-search-result.js';

describe('itunesSearch', () => {
  let searcher: ItunesSearch;

  beforeEach(() => {
    searcher = new ItunesSearch();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should return data with success when the response is ok', async () => {
    const mockData: ITunesSearchResponse = {
      resultCount: 1,
      results: [
        {
          wrapperType: 'track',
          kind: 'song',
          trackName: 'Test Song',
          artistName: 'Test Artist',
          collectionName: 'Test Album',
          trackPrice: 0.99,
          country: 'USA',
          currency: 'USD',
          releaseDate: '2023-01-01T08:00:00Z',
          primaryGenreName: 'Pop',
        },
      ],
    };

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

  it('lookupById should return data with success when the response is ok', async () => {
    const mockData: ITunesSearchResponse = {
      resultCount: 1,
      results: [
        {
          wrapperType: 'track',
          kind: 'song',
          trackName: 'Lookup Song',
          artistName: 'Lookup Artist',
          collectionName: 'Lookup Album',
          trackPrice: 1.29,
          country: 'USA',
          currency: 'USD',
          releaseDate: '2024-01-01T08:00:00Z',
          primaryGenreName: 'Pop',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await searcher.lookupById(123);

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('https://itunes.apple.com/lookup?id=123');
  });

  it('lookupById should raise an error if the http response is not ok (ex: 404)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(searcher.lookupById(999)).rejects.toThrow(
      'Failed to fetch data from iTunes Lookup API: 404',
    );
  });

  it('lookupById should raise an error "Fetch failed" in case of network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));

    await expect(searcher.lookupById(123)).rejects.toThrow(
      'Fetch failed: Network Error',
    );
  });
});
