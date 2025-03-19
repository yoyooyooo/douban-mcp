#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL } from "./types.js";
import { getGroupTopicDetail, getGroupTopics, searchBooks, searchMovies } from "./api.js";
import json2md from 'json2md'
import open from 'open'
import dayjs from "dayjs";
import TurndownService from "turndown";
import { z } from "zod";

const server = new McpServer(
  {
    name: "L-Chris/douban-mcp",
    version: "0.1.0",
  }
);

// 搜索图书
server.tool(
  TOOL.SEARCH_BOOK,
  {
    q: z.string().optional(),
    isbn: z.string().optional()
  },
  async (args) => {
    if (!args.isbn && !args.q) {
      throw new McpError(ErrorCode.InvalidParams, "Either q or isbn must be provided")
    }
    const books = await searchBooks(args)
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
      content: [{ type: 'text', text }]
    }
  }
);

// 搜索电影
server.tool(
  TOOL.SEARCH_MOVIE,
  {
    q: z.string()
  },
  async (args) => {
    if (!args.q) {
      throw new McpError(ErrorCode.InvalidParams, "q must be provided")
    }

    const movies = await searchMovies(args)
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
      content: [{ type: 'text', text }]
    }
  }
);

// 浏览图书详情
server.tool(
  TOOL.BROWSE,
  {
    id: z.string()
  },
  async (args) => {
    if (!args.id) {
      throw new McpError(ErrorCode.InvalidParams, "douban book id must be provided")
    }

    await open(`https://book.douban.com/subject/${args.id}/`);

    return {
      content: [{
        type: "text",
        text: `The Douban Book Page has been opened in your default browser`,
      }]
    }
  }
);

// 获取小组话题列表
server.tool(
  TOOL.LIST_GROUP_TOPICS,
  {
    id: z.string().optional().default('732764').describe('douban group id, default: 732764'),
    tags: z.array(z.string()).optional(),
    from_date: z.string().optional()
  },
  async (args) => {
    const id = args.id || '732764'
    const topics = await getGroupTopics({ id, tags: args.tags, from_date: args.from_date })

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
      content: [{ type: "text", text }]
    }
  }
);

// 获取小组话题详情
server.tool(
  TOOL.GET_GROUP_TOPIC_DETAIL,
  {
    id: z.string()
  },
  async (args) => {
    if (!args.id) {
      throw new McpError(ErrorCode.InvalidParams, "douban group topic id must be provided")
    }

    const topic = await getGroupTopicDetail({ id: args.id })
    if (!topic?.id) throw new McpError(ErrorCode.InvalidRequest, "request failed")

    const tService = new TurndownService()
    const text = `title: ${topic.title}
tags: ${topic.topic_tags.map(_ => _.name).join('|')}
content:
${tService.turndown(topic.content)}
`
    return {
      content: [{ type: "text", text }]
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
