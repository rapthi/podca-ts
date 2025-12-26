export type MediaType =
  | 'movie'
  | 'podcast'
  | 'music'
  | 'musicVideo'
  | 'audiobook'
  | 'shortFilm'
  | 'tvShow'
  | 'software'
  | 'ebook'
  | 'all';

export type Entity =
  | 'movieArtist'
  | 'movie'
  | 'podcastAuthor'
  | 'podcast'
  | 'musicArtist'
  | 'musicTrack'
  | 'album'
  | 'musicVideo'
  | 'mix'
  | 'song'
  | 'audiobookAuthor'
  | 'audiobook'
  | 'shortFilmArtist'
  | 'shortFilm'
  | 'tvEpisode'
  | 'tvSeason'
  | 'software'
  | 'iPadSoftware'
  | 'macSoftware'
  | 'ebook'
  | 'allArtist'
  | 'allTrack';

type EntityForMediaType<T extends MediaType> = T extends 'movie'
  ? 'movieArtist' | 'movie'
  : T extends 'podcast'
    ? 'podcastAuthor' | 'podcast'
    : T extends 'music'
      ? 'musicArtist' | 'musicTrack' | 'album' | 'musicVideo' | 'mix' | 'song'
      : T extends 'musicVideo'
        ? 'musicArtist' | 'musicVideo'
        : T extends 'audiobook'
          ? 'audiobookAuthor' | 'audiobook'
          : T extends 'shortFilm'
            ? 'shortFilmArtist' | 'shortFilm'
            : T extends 'tvShow'
              ? 'tvEpisode' | 'tvSeason'
              : T extends 'software'
                ? 'software' | 'iPadSoftware' | 'macSoftware'
                : T extends 'ebook'
                  ? 'ebook'
                  : T extends 'all'
                    ?
                        | 'movie'
                        | 'album'
                        | 'allArtist'
                        | 'podcast'
                        | 'musicVideo'
                        | 'mix'
                        | 'audiobook'
                        | 'tvSeason'
                        | 'allTrack'
                    : never;

export interface ITunesSearchParams<T extends MediaType> {
  media: T;
  entity?: EntityForMediaType<T>;
  term: string;
  country?: string;
  limit?: number;
  lang?: string;
  version?: number;
  explicit?: 'Yes' | 'No';
}