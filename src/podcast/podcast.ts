import { parseFeedToJson } from '@sesamy/podcast-parser';

interface RawCategory {
  '@_text': string;
  'itunes:category'?: RawCategory[];
}

interface RawEnclosure {
  '@_url': string;
  '@_type': string;
  '@_length': string;
}

interface RawEpisode {
  title?: string;
  guid: { '#text': string };
  link?: string;
  pubDate?: string;
  description?: string;
  'itunes:duration'?: string | number;
  'itunes:image'?: { '@_href': string };
  'itunes:explicit'?: 'yes' | 'no';
  'itunes:episode'?: number;
  'itunes:season'?: number;
  'itunes:episodeType'?: string;
  enclosure?: RawEnclosure[];
}

interface RawChannel {
  title: string;
  description?: string;
  link: string;
  language?: string;
  'itunes:category'?: RawCategory[];
  'itunes:explicit'?: 'true' | 'false';
  'itunes:image'?: { '@_href': string };
  'itunes:author'?: string;
  copyright?: string;
  'podcast:funding'?: { '@_url': string };
  'itunes:type'?: string;
  item?: RawEpisode[];
}

interface RawPodcastFeed {
  rss?: {
    channel?: RawChannel;
  };
}

export class PodcastLoader {
  private readonly FETCH_TIMEOUT_MS = 30000;

  /**
   * Fetches and parses a podcast feed from the given URL
   * @param feedUrl - The URL of the podcast feed
   * @returns A Promise resolving to the parsed Podcast
   * @throws Error if the feed is invalid or the fetch fails
   */
  async getPodcastFromFeed(feedUrl: string): Promise<Podcast> {
    this.validateUrl(feedUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(feedUrl, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch podcast feed: ${response.status} ${response.statusText}`,
        );
      }

      const xmlString = await response.text();

      if (!xmlString.trim()) {
        throw new Error('Podcast feed is empty');
      }

      const podcastFromXml = await parseFeedToJson(xmlString) as RawPodcastFeed;
      const channel = this.extractChannel(podcastFromXml);

      this.validateChannel(channel);

      return this.mapChannel(channel);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Podcast feed request timeout after ${this.FETCH_TIMEOUT_MS}ms`);
      }

      if (error instanceof Error) {
        throw new Error(`Failed to load podcast feed: ${error.message}`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private validateUrl(feedUrl: string): void {
    try {
      new URL(feedUrl);
    } catch {
      throw new Error(`Invalid feed URL: ${feedUrl}`);
    }
  }

  private extractChannel(podcastFromXml: RawPodcastFeed): RawChannel {
    const channel = podcastFromXml?.rss?.channel;

    if (!channel) {
      throw new Error('Invalid podcast feed: missing channel data');
    }

    return channel;
  }

  private validateChannel(channel: RawChannel): void {
    if (!channel.title) {
      throw new Error('Invalid podcast feed: missing required field "title"');
    }

    if (!channel.link) {
      throw new Error('Invalid podcast feed: missing required field "link"');
    }
  }

  private mapChannel(channel: RawChannel): Podcast {
    return {
      title: channel.title,
      description: channel.description,
      link: channel.link,
      language: channel.language,
      categories: this.mapCategories(channel['itunes:category']),
      explicit: channel['itunes:explicit'] === 'true',
      imageUrl: channel['itunes:image']?.['@_href'],
      author: channel['itunes:author'],
      copyright: channel['copyright'],
      fundingUrl: channel['podcast:funding']?.['@_url'],
      type: channel['itunes:type'],
      episodes: this.mapEpisodes(channel.item),
    };
  }

  private mapCategories(categories: RawCategory[] | undefined): Category[] {
    if (!categories) {return [];}

    return categories.flatMap((category) => [
      { name: category['@_text'] },
      ...(category['itunes:category']?.map((sub) => ({ name: sub['@_text'] })) || []),
    ]);
  }

  private mapEpisodes(items: RawEpisode[] | undefined): Episode[] {
    if (!items) {return [];}

    return items.map((item) => ({
      title: item.title,
      enclosure: this.mapEnclosure(item.enclosure),
      guid: item.guid['#text'],
      linkUrl: item.link,
      pubDate: item.pubDate,
      description: item.description,
      durationInSeconds: item['itunes:duration'],
      imageUrl: item['itunes:image']?.['@_href'],
      explicit: item['itunes:explicit'] === 'yes',
      number: item['itunes:episode'],
      season: item['itunes:season'],
      type: item['itunes:episodeType'],
    }));
  }

  private mapEnclosure(enclosure: RawEnclosure[] | undefined): Enclosure | undefined {
    if (!enclosure?.[0]) {return undefined;}

    return {
      url: enclosure[0]['@_url'],
      type: enclosure[0]['@_type'],
      length: enclosure[0]['@_length'],
    };
  }
}

export interface Category {
  name: string;
}

export interface Episode {
  title: string | undefined;
  enclosure: Enclosure | undefined;
  guid: string;
  linkUrl?: string;
  pubDate?: string;
  description?: string;
  durationInSeconds?: string | number | undefined;
  imageUrl?: string;
  explicit?: boolean;
  number?: number;
  season?: number;
  type?: string | undefined;
}

export interface Enclosure {
  length: string;
  type: string;
  url: string;
}

export interface Podcast {
  title: string;
  description: string | undefined;
  link: string;
  language: string | undefined;
  categories: Category[];
  explicit: boolean;
  imageUrl?: string;
  author?: string;
  copyright?: string;
  fundingUrl?: string;
  type?: string;
  complete?: boolean;
  episodes?: Episode[];
}
