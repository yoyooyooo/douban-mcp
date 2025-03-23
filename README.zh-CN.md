# 豆瓣 MCP 服务器

[English](README.md) | [中文](README.zh-CN.md)

这个 MCP 服务器提供与豆瓣内容（包括图书、电影和小组讨论）交互的功能。

## 功能特点

- **搜索图书**：通过标题关键词或 ISBN 搜索图书
- **搜索电影**：通过标题或关键词搜索电影
- **获取电影评论**：获取特定电影的评论
- **浏览内容**：在默认浏览器中打开豆瓣书籍或电影页面
- **小组话题**：列出和筛选豆瓣小组的话题
- **话题详情**：获取特定小组话题的详细内容

## 工具

服务器通过 MCP 提供以下可调用的工具：

### 1. 搜索图书

```typescript
// 工具名称: search-book
{
  q: "Python",             // 可选：通过关键词搜索
  isbn: "9787501524044"    // 可选：通过 ISBN 搜索
}
```

必须提供 `q` 或 `isbn` 中的一个。

### 2. 搜索电影

```typescript
// 工具名称: search-movie
{
  q: "盗梦空间"; // 必填：通过标题或关键词搜索
}
```

### 3. 获取电影评论

```typescript
// 工具名称: get-movie-reviews
{
  id: "1889243"; // 必填：豆瓣电影 ID
}
```

### 4. 浏览内容

```typescript
// 工具名称: browse
{
  id: "1889243",           // 必填：豆瓣条目 ID
  type: "movie"            // 可选："book"（默认）或 "movie"
}
```

### 5. 列出小组话题

```typescript
// 工具名称: list-group-topics
{
  id: "732764",            // 可选：豆瓣小组 ID（默认：732764 豆瓣电影讨论小组）
  tags: ["python", "web"],  // 可选：按标签筛选
  from_date: "2024-01-01"  // 可选：从该日期开始筛选（包含该日期）
}
```

### 6. 获取小组话题详情

```typescript
// 工具名称: get-group-topic-detail
{
  id: "123456789"; // 必填：豆瓣小组话题 ID
}
```

## 响应格式

所有工具返回的响应格式如下：

```typescript
{
  content: [
    {
      type: "text",
      text: "以 Markdown 格式返回的响应内容",
    },
  ];
}
```

## 开始使用

1. 克隆仓库
2. 安装依赖：`npm install`
3. 构建服务器：`npm run build`

### 使用方法

您可以直接运行服务器：

```bash
npm start
```

这将启动通过 stdio 运行的豆瓣 MCP 服务器。

### 在桌面应用中使用

要将此服务器集成到桌面应用中，请在应用的服务器配置中添加以下内容：

```json
{
  "mcpServers": {
    "douban-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-douban-server"],
      "env": {
        "COOKIE": "bid=;ck=;dbcl2=;frodotk_db=;" // 从豆瓣网站获取 cookie 值
      }
    }
  }
}
```

## 配置

您可以通过环境变量配置各种选项：

```bash
# API 配置
export COOKIE="bid=;ck=;dbcl2=;frodotk_db=;" # 您的豆瓣 cookie 值，用于认证请求
```

## 开发

- 运行 `npm run dev` 启动 TypeScript 编译器的监视模式
- 运行 `npm test` 运行测试

## 豆瓣 API 集成

此服务器使用多个豆瓣 API：

1. **图书 API** - 通过关键词或 ISBN 搜索图书
2. **电影 API** - 搜索电影并获取评论
3. **小组 API** - 访问小组话题和详情

## 错误处理

所有工具都包含全面的错误处理，在出现以下问题时会提供清晰的错误消息：

- 无效参数
- 未找到错误
- API 请求失败
- 认证问题

## Docker 部署

您可以使用提供的 Dockerfile 构建并运行容器：

```bash
# 构建 Docker 镜像
docker build -t douban-mcp .

# 运行容器
docker run -it douban-mcp
```

## 许可证

本项目采用 MIT 许可证。
