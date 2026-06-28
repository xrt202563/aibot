# Dify AI 盗墓笔记一(上册)聊天机器人

一个基于 React 的 AI 聊天机器人，接入 [Dify](https://dify.ai) API，支持流式对话和多轮会话。

## 功能特性

- 🎨 美观的聊天界面，支持 Markdown 渲染
- ⚡ 流式响应，实时显示 AI 回复
- 💬 多轮对话支持，保持上下文记忆
- 📱 响应式设计，适配不同屏幕
- 🧹 一键清空对话
- 可以询问一些基础的盗墓笔记一书中的内容，如青眼狐尸趴在谁背上,如密码盒的密码是什么,如闷油瓶子是什么

## 技术栈

- React 18
- Dify Chat API (Streaming 模式)
- React Markdown

## 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:xrt202563/aibot.git
cd aibot
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
REACT_APP_DIFY_BASE_URL=https://api.dify.ai/v1
REACT_APP_DIFY_API_KEY=你的Dify_API_Key
```

### 4. 启动开发服务器

```bash
npm start
```

浏览器访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 项目结构

```
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── App.js              # 主组件（聊天界面）
│   ├── App.css             # 样式文件
│   ├── difyApi.js          # Dify API 调用封装
│   └── index.js            # 入口文件
├── .env                    # 环境变量（不提交到 Git）
├── .gitignore
└── package.json
```

## API 说明

项目封装了两种 Dify API 调用方式：

- **`sendChatMessage(query, conversationId)`** - 阻塞模式，等待完整回复
- **`sendChatMessageStream(query, conversationId, onChunk)`** - 流式模式，实时逐字显示回复

当前使用流式模式以获得更好的用户体验。

## 许可证

MIT
