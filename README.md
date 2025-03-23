# Douban MCP Server

[English](README.md) | [中文](README.zh-CN.md)

This MCP server provides functionality to search and interact with Douban content including books, movies, and group discussions.

## Features

- **Search Books**: Search books by title keywords or ISBN
- **Search Movies**: Search movies by title or keywords
- **Get Movie Reviews**: Fetch reviews for a specific movie
- **Browse Content**: Open book or movie pages in your default browser
- **Group Topics**: List and filter topics from Douban groups
- **Topic Details**: Get detailed content of specific group topics

## Tools

The server provides the following tools that can be called through MCP:

### 1. Search Books

```typescript
// Tool name: search-book
{
  q: "Python",             // Optional: Search by keyword
  isbn: "9787501524044"    // Optional: Search by ISBN
}
```

One of `q` or `isbn` must be provided.

### 2. Search Movies

```typescript
// Tool name: search-movie
{
  q: "Inception"; // Required: Search by title or keyword
}
```

### 3. Get Movie Reviews

```typescript
// Tool name: get-movie-reviews
{
  id: "1889243"; // Required: Douban movie ID
}
```

### 4. Browse Content

```typescript
// Tool name: browse
{
  id: "1889243",           // Required: Douban item ID
  type: "movie"            // Optional: "book" (default) or "movie"
}
```

### 5. List Group Topics

```typescript
// Tool name: list-group-topics
{
  id: "732764",            // Optional: Douban group ID (default: 732764)
  tags: ["python", "web"],  // Optional: Filter by tags
  from_date: "2024-01-01"  // Optional: Filter by date (from this date onward)
}
```

### 6. Get Group Topic Detail

```typescript
// Tool name: get-group-topic-detail
{
  id: "123456789"; // Required: Douban group topic ID
}
```

## Response Format

All tools return responses in the following format:

```typescript
{
  content: [
    {
      type: "text",
      text: "Response content in markdown format",
    },
  ];
}
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the server: `npm run build`

### Usage

To use the server, you can run it directly:

```bash
npm start
```

This will start the Douban MCP Server running on stdio.

### Usage with Desktop App

To integrate this server with a desktop app, add the following to your app's server configuration:

```json
{
  "mcpServers": {
    "douban-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-douban-server"],
      "env": {
        "COOKIE": "bid=;ck=;dbcl2=;frodotk_db=;" // get cookie value from Douban website
      }
    }
  }
}
```

## Configuration

You can configure various options through environment variables:

```bash
# API Configuration
export COOKIE="bid=;ck=;dbcl2=;frodotk_db=;" # Your Douban cookie value for authenticated requests
```

## Development

- Run `npm run dev` to start the TypeScript compiler in watch mode
- Run `npm test` to run tests

## Douban API Integration

This server uses several Douban APIs:

1. **Book API** - Searches for books by keyword or ISBN
2. **Movie API** - Searches for movies and retrieves reviews
3. **Group API** - Accesses group topics and details

## Error Handling

All tools include comprehensive error handling that will provide clear error messages when issues occur, such as:

- Invalid parameters
- Not found errors
- API request failures
- Authentication issues

## Docker Deployment

You can build and run the container using the provided Dockerfile:

```bash
# Build Docker image
docker build -t douban-mcp .

# Run container
docker run -it douban-mcp
```

## License

This project is licensed under the MIT License.
