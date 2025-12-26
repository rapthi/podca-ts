export type WrapperType = 'track' | 'collection' | 'artist';

export type Explicitness = 'explicit' | 'cleaned' | 'notExplicit';

export type Kind =
  | 'book'
  | 'album'
  | 'coached-audio'
  | 'feature-movie'
  | 'interactive-booklet'
  | 'music-video'
  | 'pdf'
  | 'podcast'
  | 'podcast-episode'
  | 'software-package'
  | 'song'
  | 'tv-episode'
  | 'artist';

export interface ITunesSearchResult {
  wrapperType: WrapperType;
  kind: Kind;

  artistId?: number;
  collectionId?: number;
  trackId?: number;

  artistName?: string;
  collectionName?: string;
  trackName?: string;

  collectionCensoredName?: string;
  trackCensoredName?: string;

  artistViewUrl?: string;
  collectionViewUrl?: string;
  trackViewUrl?: string;

  previewUrl?: string;

  artworkUrl30?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;

  collectionPrice?: number;
  trackPrice?: number;

  collectionExplicitness?: Explicitness;
  trackExplicitness?: Explicitness;

  discCount?: number;
  discNumber?: number;
  trackCount?: number;
  trackNumber?: number;
  trackTimeMillis?: number;

  country?: string;
  currency?: string;

  primaryGenreName?: string;

  releaseDate?: string;
}

export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesSearchResult[];
}
