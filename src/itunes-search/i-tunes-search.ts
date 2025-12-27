import type { ITunesSearchParams, MediaType } from './itunes-search-options.js';
import type { ITunesSearchResponse } from './itunes-search-result.js';

export class ITunesSearch {
  private static readonly ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

  constructor() {}

  async search<T extends MediaType>(option: ITunesSearchParams<T>) {
    const searchUrlWithParams = this.buildSearchUrl(option);

    try {
      const response = await fetch(searchUrlWithParams);

      if (!response.ok) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(
          `Failed to fetch data from iTunes Search API: ${response.status}}`,
        );
      }

      return await response.json() as ITunesSearchResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fetch failed: ${error.message}`);
      }

      throw error;
    }
  }

  private buildSearchUrl<T extends MediaType>(option: ITunesSearchParams<T>): string {
    const url = new URL(ITunesSearch.ITUNES_SEARCH_URL);

    for (const [key, value] of Object.entries(option)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }

    return url.toString();
  }
}
