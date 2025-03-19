import { z } from "zod";

export const SearchMovieParamsSchema = z.object({
  q: z.string(),
});

export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  isbn: z.string().optional()
});

export const BrowseParamsSchema = z.object({
  id: z.string()
});

export const ListGroupTopicsParamsSchema = z.object({
  id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  from_date: z.string().optional()
});

export const GetGroupTopicDetailParamsSchema = z.object({
  id: z.string()
});

export const GroupTopicParamsSchema = z.object({
  id: z.string()
});

export enum TOOL {
  SEARCH_BOOK = 'search-book',
  SEARCH_MOVIE = 'search-movie',
  BROWSE = 'browse',
  LIST_GROUP_TOPICS = 'list-group-topics',
  GET_GROUP_TOPIC_DETAIL = 'get-group-topic-detail'
}

export interface RawDoubanBook {
  rating: {
    max: number
    numRaters: number
    average: string
    min: number
  }
  subtitle: string
  author: string[]
  pubdate: string
  tags: {
    count: number
    name: string
    title: string
  }[]
  origin_title: string
  image: string
  binding: string
  translator: any[]
  catalog: string
  pages: string
  images: {
    small: string
    large: string
    medium: string
  }
  alt: string
  id: string
  publisher: string
  isbn10: string
  isbn13: string
  title: string
  url: string
  alt_title: string
  author_intro: string
  summary: string
  series: {
    id: string
    title: string
  }
  price: string
  ebook_url: string
}

export interface ITopic {
  update_time: string;
  is_event: boolean;
  is_elite: boolean;
  title: string;
  url: string;
  topic_tags: { id: string; name: string }[];
  author: any[];
  uri: string;
  cover_url: string;
  id: string;
  create_time: string;
  comments_count: number;
  activity_tag: null;
  gallery_topic: null;
  label: string;
  type: string;
  is_ad: boolean;
}

export interface ITopicDetail extends ITopic {
  like_count: number
  comments_count: number
  collections_count: number
  reshares_count: number
  content: string
  abstract: string
}