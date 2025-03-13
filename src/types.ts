import { z } from "zod";

export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  isbn: z.string().optional()
});

export const BrowseParamsSchema = z.object({
  id: z.string()
});

export const ListGroupTopicsParamsSchema = z.object({
  id: z.string().optional()
});

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