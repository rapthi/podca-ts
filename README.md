# podca-ts

[![npm version](https://badge.fury.io/js/podca-ts.svg)](https://badge.fury.io/js/podca-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A modern, fully-typed TypeScript library for parsing and managing podcast feeds from RSS/iTunes feeds. Built with type safety, error handling, and comprehensive test coverage.

## Features

- 📡 **Parse RSS Feeds** - Extract podcast metadata from standard RSS feeds
- 🎵 **iTunes Support** - Full support for iTunes-specific podcast metadata
- 🔍 **iTunes Search** - Search for podcasts using the iTunes Search API
- 📦 **Fully Typed** - Complete TypeScript support with strict type checking

## Installation

```bash
npm install podca-ts
```
```bash
yarn add podca-ts
```
```bash
pnpm add podca-ts
```

## Quick Start

### Parse a Podcast Feed

```typescript
import { PodcastLoader } from 'podca-ts';

const loader = new PodcastLoader();

try {
  const podcast = await loader.getPodcastFromFeed(
    'https://example.com/podcast/feed.xml'
  );

  console.log(`Podcast: ${podcast.title}`);
  console.log(`Episodes: ${podcast.episodes?.length}`);
  
  podcast.episodes?.forEach((episode) => {
    console.log(`- ${episode.title} (${episode.durationInSeconds}s)`);
  });
} catch (error) {
  console.error('Failed to load podcast:', error);
}
```

### Search for Podcasts on iTunes

```typescript
import { ItunesSearch } from 'podca-ts';

const searcher = new ItunesSearch();

try {
  const results = await searcher.search({
    term: 'javascript',
    media: 'podcast',
    limit: 10,
    country: 'US',
  });

  console.log(`Found ${results.resultCount} podcasts`);
  
  results.results.forEach((podcast) => {
    console.log(`- ${podcast.trackName} by ${podcast.artistName}`);
  });
} catch (error) {
  console.error('Search failed:', error);
}
```

## API Documentation

### PodcastLoader

The main class for parsing podcast feeds.

#### Constructor

```typescript
const loader = new PodcastLoader();
```

#### Methods

##### `getPodcastFromFeed(feedUrl: string): Promise<Podcast>`

Fetches and parses a podcast feed from the given URL.

**Parameters:**
- `feedUrl` (string): The URL of the podcast RSS feed

**Returns:** A Promise that resolves to a `Podcast` object

**Throws:**
- `Error` if the feed URL is invalid
- `Error` if the feed cannot be fetched
- `Error` if the feed is malformed or missing required fields
- `Error` if the request times out (30 seconds)

**Example:**

```typescript
const podcast = await loader.getPodcastFromFeed(
  'https://feeds.example.com/podcast.xml'
);
```

### ItunesSearch

Search for podcasts using the iTunes Search API.

#### Constructor

```typescript
const searcher = new ItunesSearch();
```

#### Methods

##### `search<T extends MediaType>(option: ITunesSearchParams<T>): Promise<ITunesSearchResponse>`

Searches for content on iTunes.

**Parameters:**
- `option` (ITunesSearchParams): Search parameters

**Returns:** A Promise that resolves to an `ITunesSearchResponse` object

**Throws:**
- `Error` if the API request fails
- `Error` if the response is not OK

**Example:**

```typescript
const results = await searcher.search({
  term: 'typescript',
  media: 'podcast',
  limit: 25,
  country: 'US',
  lang: 'en_us',
});
```

## Types

### Podcast

```typescript
interface Podcast {
  title: string;
  description?: string;
  link: string;
  language?: string;
  categories: Category[];
  explicit: boolean;
  imageUrl?: string;
  author?: string;
  copyright?: string;
  fundingUrl?: string;
  type?: string;
  episodes?: Episode[];
}
```

### Episode

```typescript
interface Episode {
  title?: string;
  guid: string;
  enclosure?: Enclosure;
  linkUrl?: string;
  pubDate?: string;
  description?: string;
  durationInSeconds?: string | number;
  imageUrl?: string;
  explicit?: boolean;
  number?: number;
  season?: number;
  type?: string;
}
```

### Category

```typescript
interface Category {
  name: string;
}
```

### Enclosure

```typescript
interface Enclosure {
  url: string;
  type: string;
  length: string;
}
```

### ITunesSearchParams

```typescript
interface ITunesSearchParams<T extends MediaType> {
  term: string;
  media: T;
  entity?: EntityForMediaType<T>;
  country?: string;
  limit?: number;
  lang?: string;
  version?: number;
  explicit?: 'Yes' | 'No';
}
```

## Error Handling

The library provides detailed error messages to help with debugging:

```typescript
import { PodcastLoader } from 'podca-ts';

const loader = new PodcastLoader();

try {
  const podcast = await loader.getPodcastFromFeed('invalid-url');
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Output: "Invalid feed URL: invalid-url"
  }
}
```

## Requirements

- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.0.0 (for development)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Thierry Rapillard](https://github.com/rapthi)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes in each release.

## Support

If you encounter any issues or have questions, please open an issue on [GitHub](https://github.com/rapthi/podca-ts/issues).

## Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Tested with [Vitest](https://vitest.dev/)
- Parsing powered by [@sesamy/podcast-parser](https://www.npmjs.com/package/@sesamy/podcast-parser)
