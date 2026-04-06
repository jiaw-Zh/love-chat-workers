# 恋语 AI — Cloudflare Workers 部署版

> 将融入了[「深情祖师爷」](https://github.com/hotcoffeeshake/tong-jincheng-skill)视角的 AI 聊天 Prompt 平台部署到 Cloudflare Workers 边缘网络

## 📁 目录结构

```text
.
├── wrangler.toml        # Cloudflare Workers 配置文件
├── package.json         # Node.js 项目配置与依赖
├── .gitignore           # Git 忽略文件
├── prompts/             # Markdown 格式提示词库（深情祖师爷核心逻辑）
│   ├── base_persona.md  # 核心人设与底层心法
│   └── scene_*.md       # 破冰/暧昧/挽回等场景策略
├── src/
│   ├── index.js         # Worker 入口 (路由 + API)
│   └── prompts.js       # Prompt 渲染引擎 (解析并加载 Markdown)
└── static/
    └── index.html       # 单页 Web 前端系统
```

## 🚀 部署步骤

### 1. 前提条件
- 注册 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号（免费）
- 安装 Node.js (已有 ✅)

### 2. 登录 Cloudflare
```bash
npx wrangler login
```
会打开浏览器让你授权。

### 3. 本地测试
```bash
npm run dev
# 打开 http://localhost:8787
```

### 4. 部署到 Cloudflare
```bash
npm run deploy
```
部署成功后会返回一个 URL，如：
`https://lianyu-ai.你的名字.workers.dev`

### 5. 设置 API Key（可选）
在 Cloudflare Dashboard 中设置密钥：
```bash
npx wrangler secret put AI_API_KEY
# 输入你的 API Key
```
或者在页面上直接输入。

## 💰 费用

| 方案 | 限制 | 费用 |
|------|------|------|
| **Free** | 10 万请求/天 | **免费** |
| Workers Paid | 1000 万请求/月 | $5/月 |

> 免费方案足够个人使用和小规模测试！

## 🌏 优势

- **全球边缘部署** — 用户就近访问，延迟极低
- **无需服务器** — 无运维，自动扩缩容
- **免费额度大** — 每天 10 万次请求免费
- **HTTPS 自带** — 自动 SSL 证书
- **自定义域名** — 可以绑定自己的域名

## ⚙️ 自定义域名

```bash
# 在 wrangler.toml 中添加：
routes = [
  { pattern = "ai.yourdomain.com", zone_name = "yourdomain.com" }
]
```

## 📝 与 Python 版的区别

| 项目 | Python (FastAPI) | Workers (JS) |
|------|-----------------|--------------|
| 运行环境 | 本地/云服务器 | Cloudflare 边缘网络 |
| 语言 | Python | JavaScript |
| 部署 | 需要服务器 | `npm run deploy` 一键 |
| 费用 | 服务器费用 | 免费 (10万请求/天) |
| 功能 | 完全一致 | 完全一致 |
