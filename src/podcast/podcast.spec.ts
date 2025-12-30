import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PodcastLoader } from './podcast';

vi.mock('@sesamy/podcast-parser', () => ({
  parseFeedToJson: vi.fn(),
}));

import { parseFeedToJson } from '@sesamy/podcast-parser';

describe('PodcastLoader', () => {
  let podcastLoader: PodcastLoader;

  beforeEach(() => {
    podcastLoader = new PodcastLoader();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPodcastFromFeed', () => {
    it('should successfully parse a valid podcast feed', async () => {
      const mockXmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0">
          <channel>
            <title>Test Podcast</title>
            <description>A test podcast</description>
            <link>https://example.com</link>
            <language>en</language>
            <itunes:category text="Technology">
              <itunes:category text="Software How-To"/>
            </itunes:category>
            <itunes:explicit>false</itunes:explicit>
            <itunes:image href="https://example.com/image.jpg"/>
            <itunes:author>John Doe</itunes:author>
            <copyright>2024 Test Podcast</copyright>
            <podcast:funding url="https://example.com/support">Support Us</podcast:funding>
            <itunes:type>episodic</itunes:type>
            <item>
              <title>Episode 1</title>
              <guid>#text</guid>
              <link>https://example.com/episode1</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
              <description>First episode</description>
              <itunes:duration>3600</itunes:duration>
              <itunes:image href="https://example.com/ep1.jpg"/>
              <itunes:explicit>no</itunes:explicit>
              <itunes:episode>1</itunes:episode>
              <itunes:season>1</itunes:season>
              <itunes:episodeType>full</itunes:episodeType>
              <enclosure url="https://example.com/ep1.mp3" type="audio/mpeg" length="123456"/>
            </item>
          </channel>
        </rss>`;

      const mockParsedData = {
        rss: {
          channel: {
            title: 'Test Podcast',
            description: 'A test podcast',
            link: 'https://example.com',
            language: 'en',
            'itunes:category': [
              {
                '@_text': 'Technology',
                'itunes:category': [{ '@_text': 'Software How-To' }],
              },
            ],
            'itunes:explicit': 'false',
            'itunes:image': { '@_href': 'https://example.com/image.jpg' },
            'itunes:author': 'John Doe',
            copyright: '2024 Test Podcast',
            'podcast:funding': { '@_url': 'https://example.com/support' },
            'itunes:type': 'episodic',
            item: [
              {
                title: 'Episode 1',
                guid: { '#text': 'episode-1-guid' },
                link: 'https://example.com/episode1',
                pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
                description: 'First episode',
                'itunes:duration': '3600',
                'itunes:image': { '@_href': 'https://example.com/ep1.jpg' },
                'itunes:explicit': 'no',
                'itunes:episode': 1,
                'itunes:season': 1,
                'itunes:episodeType': 'full',
                enclosure: [
                  {
                    '@_url': 'https://example.com/ep1.mp3',
                    '@_type': 'audio/mpeg',
                    '@_length': '123456',
                  },
                ],
              },
            ],
          },
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => mockXmlResponse,
      } as Response);

      vi.mocked(parseFeedToJson).mockResolvedValueOnce(mockParsedData);

      const result = await podcastLoader.getPodcastFromFeed('https://example.com/feed.xml');

      expect(result.title).toBe('Test Podcast');
      expect(result.description).toBe('A test podcast');
      expect(result.link).toBe('https://example.com');
      expect(result.language).toBe('en');
      expect(result.explicit).toBe(false);
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.author).toBe('John Doe');
      expect(result.copyright).toBe('2024 Test Podcast');
      expect(result.fundingUrl).toBe('https://example.com/support');
      expect(result.type).toBe('episodic');
      expect(result.categories).toHaveLength(2);
      expect(result.episodes).toHaveLength(1);
    });

    it('should handle explicit content correctly', async () => {
      const mockParsedData = {
        rss: {
          channel: {
            title: 'Explicit Podcast',
            description: 'Contains explicit content',
            link: 'https://example.com',
            language: 'en',
            'itunes:explicit': 'true',
            item: [],
          },
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => '<xml></xml>',
      } as Response);

      vi.mocked(parseFeedToJson).mockResolvedValueOnce(mockParsedData);

      const result = await podcastLoader.getPodcastFromFeed('https://example.com/feed.xml');

      expect(result.explicit).toBe(true);
    });

    it('should handle missing optional fields gracefully', async () => {
      const mockParsedData = {
        rss: {
          channel: {
            title: 'Minimal Podcast',
            link: 'https://example.com',
            item: [],
          },
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => '<xml></xml>',
      } as Response);

      vi.mocked(parseFeedToJson).mockResolvedValueOnce(mockParsedData);

      const result = await podcastLoader.getPodcastFromFeed('https://example.com/feed.xml');

      expect(result.title).toBe('Minimal Podcast');
      expect(result.description).toBeUndefined();
      expect(result.imageUrl).toBeUndefined();
      expect(result.author).toBeUndefined();
      expect(result.copyright).toBeUndefined();
      expect(result.fundingUrl).toBeUndefined();
      expect(result.type).toBeUndefined();
      expect(result.categories).toEqual([]);
      expect(result.episodes).toEqual([]);
    });

    it('should throw an error when fetch fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(podcastLoader.getPodcastFromFeed('https://invalid.com/feed.xml')).rejects.toThrow(
        'Network error',
      );
    });

    it('should throw an error when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(podcastLoader.getPodcastFromFeed('https://example.com/feed.xml')).rejects.toThrow();
    });
  });

  describe('mapCategories', () => {
    it('should map single category without subcategories', () => {
      const categories = [{ '@_text': 'Technology' }];

      const result = podcastLoader['mapCategories'](categories);

      expect(result).toEqual([{ name: 'Technology' }]);
    });

    it('should map categories with subcategories', () => {
      const categories = [
        {
          '@_text': 'Technology',
          'itunes:category': [
            { '@_text': 'Software How-To' },
            { '@_text': 'Gadgets' },
          ],
        },
      ];

      const result = podcastLoader['mapCategories'](categories);

      expect(result).toEqual([
        { name: 'Technology' },
        { name: 'Software How-To' },
        { name: 'Gadgets' },
      ]);
    });

    it('should handle multiple parent categories with subcategories', () => {
      const categories = [
        {
          '@_text': 'Technology',
          'itunes:category': [{ '@_text': 'Software How-To' }],
        },
        {
          '@_text': 'Business',
          'itunes:category': [{ '@_text': 'Careers' }],
        },
      ];

      const result = podcastLoader['mapCategories'](categories);

      expect(result).toEqual([
        { name: 'Technology' },
        { name: 'Software How-To' },
        { name: 'Business' },
        { name: 'Careers' },
      ]);
    });

    it('should return empty array when categories is undefined', () => {
      const result = podcastLoader['mapCategories'](undefined);

      expect(result).toEqual([]);
    });

    it('should handle categories without subcategories', () => {
      const categories = [
        { '@_text': 'Technology' },
        { '@_text': 'Business' },
      ];

      const result = podcastLoader['mapCategories'](categories);

      expect(result).toEqual([
        { name: 'Technology' },
        { name: 'Business' },
      ]);
    });
  });

  describe('mapEpisodes', () => {
    it('should map episodes with all fields', () => {
      const items = [
        {
          title: 'Episode 1',
          guid: { '#text': 'ep1-guid' },
          link: 'https://example.com/ep1',
          pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
          description: 'First episode',
          'itunes:duration': '3600',
          'itunes:image': { '@_href': 'https://example.com/ep1.jpg' },
          'itunes:explicit': 'yes',
          'itunes:episode': 1,
          'itunes:season': 1,
          'itunes:episodeType': 'full',
          enclosure: [
            {
              '@_url': 'https://example.com/ep1.mp3',
              '@_type': 'audio/mpeg',
              '@_length': '123456',
            },
          ],
        },
      ];

      const result = podcastLoader['mapEpisodes'](items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: 'Episode 1',
        guid: 'ep1-guid',
        linkUrl: 'https://example.com/ep1',
        pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
        description: 'First episode',
        durationInSeconds: '3600',
        imageUrl: 'https://example.com/ep1.jpg',
        explicit: true,
        number: 1,
        season: 1,
        type: 'full',
        enclosure: {
          url: 'https://example.com/ep1.mp3',
          type: 'audio/mpeg',
          length: '123456',
        },
      });
    });

    it('should handle episodes with minimal fields', () => {
      const items = [
        {
          title: 'Episode 1',
          guid: { '#text': 'ep1-guid' },
        },
      ];

      const result = podcastLoader['mapEpisodes'](items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: 'Episode 1',
        guid: 'ep1-guid',
        enclosure: undefined,
        linkUrl: undefined,
        pubDate: undefined,
        description: undefined,
        durationInSeconds: undefined,
        imageUrl: undefined,
        explicit: false,
        number: undefined,
        season: undefined,
        type: undefined,
      });
    });

    it('should handle explicit field as "no"', () => {
      const items = [
        {
          title: 'Clean Episode',
          guid: { '#text': 'ep-guid' },
          'itunes:explicit': 'no',
        },
      ];

      const result = podcastLoader['mapEpisodes'](items);

      expect(result[0].explicit).toBe(false);
    });

    it('should handle multiple episodes', () => {
      const items = [
        {
          title: 'Episode 1',
          guid: { '#text': 'ep1-guid' },
        },
        {
          title: 'Episode 2',
          guid: { '#text': 'ep2-guid' },
        },
      ];

      const result = podcastLoader['mapEpisodes'](items);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Episode 1');
      expect(result[1].title).toBe('Episode 2');
    });
  });

  describe('mapEnclosure', () => {
    it('should map enclosure with all fields', () => {
      const enclosure = [
        {
          '@_url': 'https://example.com/ep1.mp3',
          '@_type': 'audio/mpeg',
          '@_length': '123456',
        },
      ];

      const result = podcastLoader['mapEnclosure'](enclosure);

      expect(result).toEqual({
        url: 'https://example.com/ep1.mp3',
        type: 'audio/mpeg',
        length: '123456',
      });
    });

    it('should return undefined when enclosure is undefined', () => {
      const result = podcastLoader['mapEnclosure'](undefined);

      expect(result).toBeUndefined();
    });

    it('should return undefined when enclosure array is empty', () => {
      const result = podcastLoader['mapEnclosure']([]);

      expect(result).toBeUndefined();
    });

    it('should handle enclosure with different media types', () => {
      const enclosures = [
        {
          '@_url': 'https://example.com/ep1.m4a',
          '@_type': 'audio/mp4',
          '@_length': '654321',
        },
      ];

      const result = podcastLoader['mapEnclosure'](enclosures);

      expect(result?.type).toBe('audio/mp4');
      expect(result?.url).toBe('https://example.com/ep1.m4a');
    });
  });
});
