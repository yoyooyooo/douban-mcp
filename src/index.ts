#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { BrowseParamsSchema, GetGroupTopicDetailParamsSchema, ListGroupTopicsParamsSchema, SearchMovieParamsSchema, SearchParamsSchema, TOOL } from "./types.js";
import { getGroupTopicDetail, getGroupTopics, searchBooks, searchMovies } from "./api.js";
import json2md from 'json2md'
import open from 'open'
import dayjs from "dayjs";
import TurndownService from "turndown";

const server = new Server(
  {
    name: "L-Chris/douban-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: TOOL.SEARCH_BOOK,
        description: "search books from douban, either by ISBN or by query",
        inputSchema: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Optional, The search query",
            },
            isbn: {
              type: "string",
              description: "Optional, The ISBN of the book",
            },
          },
        },
      },
      {
        name: TOOL.SEARCH_MOVIE,
        description: "search movies from douban by query",
        inputSchema: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The search query",
            }
          },
          required: ['q']
        },
      },
      {
        name: TOOL.BROWSE,
        description: "open default browser and browse douban book detail",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Required, The id of douban book data",
            }
          },
          required: ['id']
        }
      },
      {
        name: TOOL.LIST_GROUP_TOPICS,
        description: "list group topics",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Optional, The id of douban group, default 732764",
            },
            tags: {
              type: "array",
              description: "Optional, The tags of the topics",
            },
            from_date: {
              type: "string",
              description: "Optional, The from date of the topics, format: YYYY/MM/DD",
            }
          },
        }
      },
      {
        name: TOOL.GET_GROUP_TOPIC_DETAIL,
        description: "get group topic detail",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The id of douban group topic",
            }
          },
        },
        required: ['id']
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === TOOL.SEARCH_BOOK) {
      const validatedArgs = SearchParamsSchema.parse(args);
      if (!validatedArgs.isbn && !validatedArgs.q) {
        throw new McpError(ErrorCode.InvalidParams, "Either q or isbn must be provided")
      }
      const books = await searchBooks(validatedArgs)
      const text = json2md({
        table: {
          headers: ['publish_date', 'title', 'author', 'rate' ,'id', 'isbn'],
          rows: books.map(_ => ({
            id: _.id,
            title: _.title,
            author: _.author.join('、'),
            publish_date: _.pubdate,
            isbn: _.isbn13,
            rating: `${_.rating?.average || '0'} (${_.rating?.numRaters || 0}人)`
          }))
        }
      })

      return {
        content: [
          {
            type: 'text',
            text: text
          }
        ]
      }
    }

    if (name === TOOL.SEARCH_MOVIE) {
      const validatedArgs = SearchMovieParamsSchema.parse(args);
      if (!validatedArgs.q) {
        throw new McpError(ErrorCode.InvalidParams, "q must be provided")
      }

      const movies = await searchMovies(validatedArgs)

      const text = json2md({
        table: {
          headers: ['title', 'original_title', 'rating', 'wish_count', 'collect_count', 'do_count', 'id'],
          rows: movies.map(_ => ({
            id: _.id,
            title: _.title,
            original_title: _.original_title,
            rating: `${_.rating?.average || '0'} (${_.ratings_count || 0}人)`,
            wish_count: _.wish_count,
            collect_count: _.collect_count,
            do_count: _.do_count,
          }))
        }
      })

      return {
        content: [
          {
            type: 'text',
            text: text
          }
        ]
      }
    }

    if (name === TOOL.BROWSE) {
      const validatedArgs = BrowseParamsSchema.parse(args);
      if (!validatedArgs.id) {
        throw new McpError(ErrorCode.InvalidParams, "douban book id must be provided")
      }

      // Automatically open the image URL in the default browser
      await open(`https://book.douban.com/subject/${validatedArgs.id}/`);

      // Return a formatted message with the clickable link
      return {
        content: [
          {
            type: "text",
            text: `The Douban Book Page has been opened in your default browser`,
          },
        ],
      }
    }

    if (name === TOOL.LIST_GROUP_TOPICS) {
      const validatedArgs = ListGroupTopicsParamsSchema.parse(args);
      const id = validatedArgs.id || '732764'
      const topics = await getGroupTopics({ id: id })

      const text = json2md({
        table: {
          headers: ['publish_date', 'title', 'id'],
          rows: topics.map(_ => ({
            id: _.id,
            title: `${_.topic_tags.map(_ => _.name + '|').join()}${_.title}`,
            publish_date: dayjs(_.create_time).format('YYYY/MM/DD'),
          }))
        }
      })

      return {
        content: [
          {
            type: "text",
            text: text,
          },
        ],
      }
    }

    if (name === TOOL.GET_GROUP_TOPIC_DETAIL) {
      const validatedArgs = GetGroupTopicDetailParamsSchema.parse(args);
      if (!validatedArgs.id) {
        throw new McpError(ErrorCode.InvalidParams, "douban group topic id must be provided")
      }

      const topic = await getGroupTopicDetail({ id: validatedArgs.id })

      if (!topic?.id) throw new McpError(ErrorCode.InvalidRequest, "request failed")
      const tService = new TurndownService()
      const text = `title: ${topic.title}
tags: ${topic.topic_tags.map(_ => _.name).join('|')}
content:
${tService.turndown(topic.content)}
`

      return {
        content: [
          {
            type: "text",
            text: text,
          },
        ],
      }
    }
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }


  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
