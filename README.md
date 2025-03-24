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

## Getting started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the server: `npm run build`

### Usage with Desktop App

To integrate this server with a desktop app, add the following to your app's server configuration:

```json
{
  "mcpServers": {
    "douban-mcp": {
      "command": "node",
      "args": [
        "{ABSOLUTE PATH TO FILE HERE}/dist/index.js"
      ],
      "env": {
        "COOKIE": "bid=;ck=;dbcl2=;frodotk_db=;" // get cookie value from website
      }
    }
  }
}
```

## Features

- Search book from douban

## DOCS
- [douban api doc](https://www.doubanapi.com/)

## License

This project is licensed under the MIT License.
