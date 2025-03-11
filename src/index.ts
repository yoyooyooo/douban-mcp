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
import { TOOL } from "./api.js";

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
    throw new Error("Either q or isbn must be provided");
  }

  const tool = request.params.name

  if (tool === TOOL.SEARCH) {
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${tool}`)
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
