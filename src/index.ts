#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { TOOL } from "./types.js";
import {
  getGroupTopicDetail,
  getGroupTopics,
  searchBooks,
  searchMovies,
  getMovieReviews,
} from "./api.js";
import json2md from "json2md";
import open from "open";
import dayjs from "dayjs";
import TurndownService from "turndown";
import { z } from "zod";

// Create MCP server with proper metadata
const server = new McpServer({
  name: "L-Chris/douban-mcp",
  version: "0.1.0",
  description:
    "Douban API MCP Server for fetching books, movies, and group information",
});

// 搜索图书
server.tool(
  TOOL.SEARCH_BOOK,
  "Search books from Douban, either by ISBN or by query string. Returns book details including title, author, rating, and publication information.",
  {
    q: z
      .string()
      .optional()
      .describe('Query string to search for books, e.g. "python"'),
    isbn: z
      .string()
      .optional()
      .describe('ISBN number to look up a specific book, e.g. "9787501524044"'),
  },
  async (args) => {
    try {
      if (!args.isbn && !args.q) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Either q or isbn must be provided"
        );
      }
      const books = await searchBooks(args);

      if (books.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No books found matching your search criteria.",
            },
          ],
        };
      }

      const text = json2md({
        table: {
          headers: ["publish_date", "title", "author", "rating", "id", "isbn"],
          rows: books.map((_) => ({
            id: _.id || "",
            title: _.title || "",
            author: (_.author || []).join("、"),
            publish_date: _.pubdate,
            isbn: _.isbn13 || "",
            rating: `${_.rating?.average || 0} (${_.rating?.numRaters || 0}人)`,
          })),
        },
      });

      return {
        content: [{ type: "text", text }],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search books: ${error.message}`
      );
    }
  }
);

// 搜索电影
server.tool(
  TOOL.SEARCH_MOVIE,
  "Search movies from Douban by query string. Returns movie details including title, rating, and popularity metrics.",
  {
    q: z
      .string()
      .describe('Query string to search for movies, e.g. "Inception"'),
  },
  async (args) => {
    try {
      if (!args.q) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Query string must be provided"
        );
      }

      const movies = await searchMovies(args);

      if (movies.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No movies found matching your search criteria.",
            },
          ],
        };
      }

      const text = json2md({
        table: {
          headers: [
            "title",
            "original_title",
            "rating",
            "wish_count",
            "collect_count",
            "do_count",
            "id",
          ],
          rows: movies.map((_) => ({
            id: _.id,
            title: _.title,
            original_title: _.original_title,
            rating: `${_.rating?.average || "0"} (${_.ratings_count || 0}人)`,
            wish_count: _.wish_count,
            collect_count: _.collect_count,
            do_count: _.do_count,
          })),
        },
      });

      return {
        content: [{ type: "text", text }],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search movies: ${error.message}`
      );
    }
  }
);

// 获取电影评论 (New tool based on the weather API example)
server.tool(
  TOOL.GET_MOVIE_REVIEWS,
  "Get reviews for a specific movie from Douban. Returns a list of user reviews with ratings and comments.",
  {
    id: z.string().describe('Douban movie ID, e.g. "1234567890"'),
  },
  async (args) => {
    try {
      if (!args.id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Movie ID must be provided"
        );
      }

      const reviews = await getMovieReviews({ id: args.id });

      if (!reviews || reviews.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No reviews found for movie with ID: ${args.id}`,
            },
          ],
        };
      }

      // Convert HTML content to markdown for better readability
      const tService = new TurndownService();

      let text = `## Reviews for Movie ID: ${args.id}\n\n`;

      reviews.slice(0, 5).forEach((review, index) => {
        text += `### Review ${index + 1}\n`;
        text += `**Rating**: ${review.rating?.value || "No rating"}\n`;
        text += `**Author**: ${review.author?.name || "Anonymous"}\n`;
        text += `**Title**: ${review.title}\n`;
        text += `**Published**: ${dayjs(review.created_at).format(
          "YYYY/MM/DD"
        )}\n`;
        text += `**Summary**: ${tService.turndown(review.summary || "")}\n\n`;
      });

      text += `Total reviews: ${reviews.length}\n`;

      return {
        content: [{ type: "text", text }],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch movie reviews: ${error.message}`
      );
    }
  }
);

// 浏览图书详情
server.tool(
  TOOL.BROWSE,
  "Open Douban book/movie detail page in your default browser. Opens a new browser window to view the complete information.",
  {
    id: z.string().describe('Douban item ID, e.g. "1234567890"'),
    type: z
      .enum(["book", "movie"])
      .default("book")
      .describe("Item type: book or movie"),
  },
  async (args) => {
    try {
      if (!args.id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Douban item ID must be provided"
        );
      }

      const url =
        args.type === "movie"
          ? `https://movie.douban.com/subject/${args.id}/`
          : `https://book.douban.com/subject/${args.id}/`;

      await open(url);

      return {
        content: [
          {
            type: "text",
            text: `The Douban ${args.type} page has been opened in your default browser`,
          },
        ],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to open browser: ${error.message}`
      );
    }
  }
);

// 获取小组话题列表
server.tool(
  TOOL.LIST_GROUP_TOPICS,
  "List Douban group topics with optional filtering by tags and date. Returns a table of topics with dates, tags, and titles.",
  {
    id: z
      .string()
      .optional()
      .default("732764")
      .describe(
        "Douban group ID, default: 732764 (Douban movie discussion group)"
      ),
    tags: z
      .array(z.string())
      .optional()
      .describe('Filter topics by tags, e.g. ["python"]'),
    from_date: z
      .string()
      .optional()
      .describe('Filter topics from this date onward, e.g. "2024-01-01"'),
  },
  async (args) => {
    try {
      const id = args.id || "732764";
      const topics = await getGroupTopics({
        id,
        tags: args.tags,
        from_date: args.from_date,
      });

      if (topics.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No topics found for group ID: ${id}${
                args.tags ? " with tags: " + args.tags.join(", ") : ""
              }${args.from_date ? " from date: " + args.from_date : ""}`,
            },
          ],
        };
      }

      const text = json2md({
        table: {
          headers: ["publish_date", "tags", "title", "id"],
          rows: topics.map((_) => ({
            id: _.id,
            tags: _.topic_tags.map((_) => _.name).join("、"),
            title: `[${_.title}](${_.url})`,
            publish_date: dayjs(_.create_time).format("YYYY/MM/DD"),
          })),
        },
      });

      const responseText = `Found ${topics.length} topics for group ID: ${id}${
        args.tags ? " with tags: " + args.tags.join(", ") : ""
      }${args.from_date ? " from date: " + args.from_date : ""}\n\n${text}`;

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list group topics: ${error.message}`
      );
    }
  }
);

// 获取小组话题详情
server.tool(
  TOOL.GET_GROUP_TOPIC_DETAIL,
  "Get detailed information about a specific Douban group topic. Returns the topic content, title, and metadata.",
  {
    id: z.string().describe('Douban group topic ID, e.g. "1234567890"'),
  },
  async (args) => {
    try {
      if (!args.id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Douban group topic ID must be provided"
        );
      }

      const topic = await getGroupTopicDetail({ id: args.id });
      if (!topic?.id)
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Failed to fetch topic details"
        );

      const tService = new TurndownService();
      const text = `# ${topic.title}

**Tags**: ${topic.topic_tags.map((_) => _.name).join(" | ")}
**Published**: ${dayjs(topic.create_time).format("YYYY/MM/DD")}
**Comments**: ${topic.comments_count}
**Likes**: ${topic.like_count}

## Content
${tService.turndown(topic.content)}
`;
      return {
        content: [{ type: "text", text }],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get topic details: ${error.message}`
      );
    }
  }
);

async function main() {
  try {
    console.log("Starting Douban MCP Server...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Douban MCP Server started and connected.");
  } catch (error: any) {
    console.error("Fatal error in Douban MCP Server:", error);
    process.exit(1);
  }
}

main().catch((error: any) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
