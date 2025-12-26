import type { ITunesSearchParams, MediaType } from './itunes-search-options.js';

export class itunesSearch {
  private static readonly ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

  constructor() {}

  async search<T extends MediaType>(option: ITunesSearchParams<T>) {
    const searchUrlWithParams = this.buildSearchUrl(option);

    try {
      const response = await fetch(searchUrlWithParams);

      if (!response.ok) {
        throw new Error(`Failed to fetch data from iTunes Search API: ${response.status}}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fetch failed: ${error.message}`);
      }

      throw error;
    }
  }

  private buildSearchUrl<T extends MediaType>(option: ITunesSearchParams<T>): string {
    const url = new URL(itunesSearch.ITUNES_SEARCH_URL);

    for (const [key, value] of Object.entries(option)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }

    return url.toString();
  }
}
