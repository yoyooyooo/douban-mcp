#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { RequestPayloadSchema } from "./types.js";
import { searchBooks, TOOL } from "./api.js";
import json2md from 'json2md'

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
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const validatedArgs = RequestPayloadSchema.parse(args);

  if (!validatedArgs.isbn && !validatedArgs.q) {
    throw new McpError(ErrorCode.InvalidParams, "Either q or isbn must be provided")
  }

  try {
    if (name === TOOL.SEARCH) {
      const books = await searchBooks(validatedArgs)
      const text = json2md({
        table: {
          headers: ['id', 'title', 'author' ,'publish_date', 'isbn'],
          rows: books.map(_ => ({
            id: _.id,
            title: _.title,
            author: _.author.join('、'),
            publish_date: _.pubdate,
            isbn: _.isbn13
          }))
        }
      })

      return {
        content: [
          {
            type: 'text',
            text: '```markdown\n' + text + '```'
          }
        ]
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
