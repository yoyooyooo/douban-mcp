#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { BrowseParamsSchema, ListGroupTopicsParamsSchema, SearchParamsSchema } from "./types.js";
import { getGroupTopics, searchBooks, TOOL } from "./api.js";
import json2md from 'json2md'
import open from 'open'
import dayjs from "dayjs";

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
        name: TOOL.SEARCH,
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
            }
          },
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === TOOL.SEARCH) {
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
            rate: `${_.rating?.average || '0'} (${_.rating?.numRaters || 0}人)`
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
      const topics = await getGroupTopics({ group_id: id })

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
