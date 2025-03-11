# Douban MCP Server

This MCP server provides functionality to search book from douban

## Components

### Tools

- **search**
  - search book info from douban
  - Input:
    - `isbn` (string, optional): isbn of the book to fetch
    - `q` (string, optional): search keyword of the book title to fetch

  - Returns the book content array

### Resources

This server does not provide any persistent resources. It's designed to fetch and transform web content on demand.

## Getting started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the server: `npm run build`

### Usage

To use the server, you can run it directly:

```bash
npm start
```

This will start the Fetch MCP Server running on stdio.

### Usage with Desktop App

To integrate this server with a desktop app, add the following to your app's server configuration:

```json
{
  "mcpServers": {
    "douban-mcp": {
      "command": "node",
      "args": [
        "{ABSOLUTE PATH TO FILE HERE}/dist/index.js"
      ]
    }
  }
}
```

## Features

- Search book from douban

## Development

- Run `npm run dev` to start the TypeScript compiler in watch mode

## License

This project is licensed under the MIT License.
