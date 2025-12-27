import { parseFeedToJson } from '@sesamy/podcast-parser';
import * as timers from 'node:timers';

export class PodcastLoader {
  constructor() {}

  async getPodcastFromFeed(feedUrl: string) {
    const response = await fetch(feedUrl);
    const xmlString = await response.text();

    const podcastFromXml = await parseFeedToJson(xmlString);
    const channel = podcastFromXml.rss.channel;
    const categories = channel['itunes:category'];
    const itunesCategories: Category[] = [];
    if (categories) {
      categories.forEach(category => {
        itunesCategories.push({
          name: category['@_text']
        });
        if (category['itunes:category']) {
          category['itunes:category'].forEach(subCategory => {
            itunesCategories.push({
              name: subCategory['@_text']
            });
          });
        }
      });
    }

    const episodes: Episode[] = [];
    const items = channel.item;
    items.forEach(item => {
      let enclosure: Enclosure | undefined = undefined;
      if (item.enclosure) {
         enclosure = {
           url: item.enclosure[0]['@_url'],
           type: item.enclosure[0]['@_type'],
           length: item.enclosure[0]['@_length'],
         }
      }
      episodes.push({
        title: item.title,
        enclosure: enclosure,
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
      });
    });

    const podcastResponse: Podcast = {
      title: channel.title,
      description: channel.description,
      link: channel.link,
      language: channel.language,
      categories: itunesCategories,
      explicit: channel['itunes:explicit'] === 'true',
      imageUrl: channel['itunes:image']?.['@_href'],
      author: channel['itunes:author'],
      copyright: channel['copyright'],
      fundingUrl: channel['podcast:funding']?.['@_url'],
      type: channel['itunes:type'],
      episodes: episodes,
    };

    return podcastResponse;
  }
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