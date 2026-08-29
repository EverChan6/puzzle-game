# 拼图大师

一个基于 Next.js 的在线拼图游戏，支持经典模式和高级模式。玩家可以选择预设图片或上传自定义图片，并记录游戏进度与成绩。

## 功能

- 经典拼图模式
- 高级模式：逐块生成并放置拼图碎片
- 预设图片与自定义图片上传
- 游戏计时、步数统计和完成记录
- 高级模式游戏存档与恢复
- IndexedDB 保存自定义图片，避免浏览器 `localStorage` 配额溢出
- 响应式界面与深色模式支持

## 技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide React
- Vercel Analytics

## 本地开发

### 环境要求

- Node.js 20 或更高版本
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

